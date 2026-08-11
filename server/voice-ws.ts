/**
 * ConversationRelay WebSocket server for Twilio voice AI agent.
 *
 * This is a STANDALONE Node.js server, separate from the Next.js app.
 * Deploy this on Railway (or any long-running Node.js host) because
 * Vercel serverless functions cannot maintain WebSocket connections for
 * the full duration of a phone call.
 *
 * Deploy steps:
 *   1. Set VOICE_WS_PORT (default 8080) in Railway environment
 *   2. Set the same env vars as the Next.js app (ANTHROPIC_API_KEY, Supabase, etc.)
 *   3. Set VOICE_WS_URL in Vercel to wss://<your-railway-domain>/api/voice/ws
 *
 * Local dev: ts-node server/voice-ws.ts  (or: node -r ts-node/register server/voice-ws.ts)
 */

import * as http from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import type {
  VoiceSession,
  CRInboundEvent,
  CRSetupEvent,
  CRPromptEvent,
  CROutboundMessage,
} from '../lib/agent/types'

// Ensure env is loaded when running standalone
if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('dotenv').config({ path: '.env.local' })
  } catch { /* dotenv optional */ }
}

// Lazy-import the agent (resolves after env is loaded)
async function getRunAgent() {
  const mod = await import('../lib/agent/run-agent')
  return mod.runAgent
}

async function getCustomerFn() {
  const mod = await import('../lib/db/customers')
  return mod.findOrCreateCustomerByPhone
}

async function getConvoFn() {
  const mod = await import('../lib/db/conversations')
  return { getOrCreate: mod.getOrCreateConversation, markCompleted: mod.markConversationCompleted }
}

const PORT = parseInt(process.env.VOICE_WS_PORT ?? '8080', 10)

// Active sessions: one per WebSocket connection (one per call)
const sessions = new Map<WebSocket, VoiceSession>()

const server = http.createServer((_req, res) => {
  // Health check
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: 'ok', service: 'voice-ws' }))
})

const wss = new WebSocketServer({ server, path: '/api/voice/ws' })

wss.on('connection', (ws: WebSocket) => {
  console.log('[VOICE_WS] New connection')

  ws.on('message', async (data: Buffer) => {
    let event: CRInboundEvent
    try {
      event = JSON.parse(data.toString())
    } catch {
      console.warn('[VOICE_WS] Non-JSON message received')
      return
    }

    if (event.event === 'setup') {
      await handleSetup(ws, event as CRSetupEvent)
    } else if (event.event === 'prompt') {
      await handlePrompt(ws, event as CRPromptEvent)
    } else if (event.event === 'interrupt') {
      console.log('[VOICE_WS] Caller interrupted agent')
    } else if (event.event === 'dtmf') {
      // DTMF digits — treat as text input
      const session = sessions.get(ws)
      if (session) {
        await processVoiceMessage(ws, session, `Keypad input: ${(event as { digit: string }).digit}`)
      }
    }
  })

  ws.on('close', () => {
    const session = sessions.get(ws)
    if (session) {
      console.log(`[VOICE_CALL_COMPLETED] callSid=${session.callSid} duration=${Math.round((Date.now() - session.startedAt) / 1000)}s`)
      sessions.delete(ws)
    }
  })

  ws.on('error', (err) => {
    console.error('[VOICE_WS] WebSocket error:', err.message)
    sessions.delete(ws)
  })
})

async function handleSetup(ws: WebSocket, event: CRSetupEvent) {
  const callSid = event.callSid
  const from = event.customParameters?.from ?? event.from ?? ''

  console.log(`[VOICE_AGENT_CONNECTED] callSid=${callSid} from=${from}`)

  // Identify caller
  let customerId: string | undefined
  let customerPhone: string | undefined = from
  let customerName: string | undefined
  try {
    const findOrCreate = await getCustomerFn()
    const dbCustomer = from ? await findOrCreate(from) : null
    if (dbCustomer) {
      customerId = dbCustomer.id
      customerPhone = dbCustomer.phone ?? from
      customerName = dbCustomer.name ?? undefined
    }
  } catch (err) {
    console.error('[VOICE_WS] Customer lookup error:', err)
  }
  const customer = { id: customerId, phone: customerPhone, name: customerName }

  // Create conversation record
  let conversationId = `voice-${callSid}`
  try {
    const { getOrCreate } = await getConvoFn()
    const convo = await getOrCreate('voice', customer.id ?? null, callSid)
    if (convo) conversationId = convo.id
  } catch (err) {
    console.error('[VOICE_WS] Conversation creation error:', err)
  }

  const session: VoiceSession = {
    callSid,
    conversationId,
    customer,
    history: [],
    startedAt: Date.now(),
  }
  sessions.set(ws, session)
}

async function handlePrompt(ws: WebSocket, event: CRPromptEvent) {
  const session = sessions.get(ws)
  if (!session) {
    console.warn('[VOICE_WS] Received prompt with no session — ignoring')
    return
  }

  const transcript = event.voicePrompt?.trim()
  if (!transcript) return

  console.log(`[VOICE_TRANSCRIPT_RECEIVED] callSid=${session.callSid} text="${transcript}"`)

  await processVoiceMessage(ws, session, transcript)
}

async function processVoiceMessage(ws: WebSocket, session: VoiceSession, userText: string) {
  try {
    const runAgent = await getRunAgent()
    const result = await runAgent({
      channel: 'voice',
      message: userText,
      conversationId: session.conversationId,
      customer: session.customer,
      history: session.history,
    })

    // Update in-memory history
    session.history.push({ role: 'user', content: userText })
    session.history.push({ role: 'assistant', content: result.text })
    if (session.history.length > 30) session.history.splice(0, session.history.length - 30)

    console.log(`[VOICE_RESPONSE_SENT] callSid=${session.callSid} text="${result.text.slice(0, 80)}..."`)

    // Check for end_call action
    const shouldEndCall = result.actions?.some(a => a.type === 'booking_created' && (a.data as Record<string, unknown>)?.action === 'end_call')

    if (shouldEndCall) {
      sendToWs(ws, { type: 'text', token: result.text, last: true })
      setTimeout(() => {
        sendToWs(ws, { type: 'end' })
      }, 2000)
      return
    }

    // Check for human transfer
    const transferAction = result.actions?.find(a => a.type === 'transfer_to_human')
    if (transferAction && (transferAction.data as Record<string, unknown>)?.transfer_to) {
      sendToWs(ws, { type: 'text', token: result.text, last: true })
      return
    }

    sendToWs(ws, { type: 'text', token: result.text, last: true })
  } catch (err) {
    console.error(`[VOICE_CALL_FAILED] callSid=${session.callSid}`, err)
    sendToWs(ws, {
      type: 'text',
      token: "I'm sorry, I had trouble with that. Could you please repeat your question?",
      last: true,
    })
  }
}

function sendToWs(ws: WebSocket, message: CROutboundMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

server.listen(PORT, () => {
  console.log(`[VOICE_WS] Voice WebSocket server running on port ${PORT}`)
  console.log(`[VOICE_WS] ConversationRelay endpoint: ws://localhost:${PORT}/api/voice/ws`)
})
