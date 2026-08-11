import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { validateTwilioSignature, buildWebhookUrl } from '@/lib/twilio'
import { findOrCreateCustomerByWhatsApp } from '@/lib/db/customers'
import { getOrCreateConversation } from '@/lib/db/conversations'
import { runAgent } from '@/lib/agent/run-agent'

const { MessagingResponse } = twilio.twiml

// Deduplicate incoming messages by MessageSid to prevent double-processing
const processedMessages = new Set<string>()

export async function POST(request: NextRequest) {
  console.log('[WHATSAPP] Webhook received')

  // Parse form-encoded body (Twilio sends application/x-www-form-urlencoded)
  const formData = await request.formData()
  const body: Record<string, string> = {}
  formData.forEach((value, key) => { body[key] = value.toString() })

  // Validate Twilio signature in production
  if (process.env.NODE_ENV === 'production') {
    const webhookUrl = buildWebhookUrl('/api/whatsapp/webhook')
    const valid = validateTwilioSignature(request, body, webhookUrl)
    if (!valid) {
      console.warn('[WHATSAPP] Invalid Twilio signature — rejecting request')
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  const messageSid = body['MessageSid'] ?? ''
  const from = body['From'] ?? ''           // e.g. "whatsapp:+1XXXXXXXXXX"
  const profileName = body['ProfileName'] ?? ''
  const messageBody = (body['Body'] ?? '').trim()
  const numMedia = parseInt(body['NumMedia'] ?? '0', 10)

  console.log(`[WHATSAPP_MESSAGE_RECEIVED] from=${from} sid=${messageSid}`)

  // Deduplicate
  if (messageSid && processedMessages.has(messageSid)) {
    console.log(`[WHATSAPP] Duplicate message ${messageSid} — skipping`)
    return new NextResponse('', { status: 200 })
  }
  if (messageSid) processedMessages.add(messageSid)
  if (processedMessages.size > 500) {
    // Prevent unbounded growth (in-memory; restarts clear it, which is fine)
    const first = processedMessages.values().next().value
    if (first) processedMessages.delete(first)
  }

  // Extract the phone number from the "whatsapp:+1..." prefix
  const whatsappId = from.replace('whatsapp:', '')

  if (!whatsappId || !messageBody) {
    // Media-only message with no caption
    if (numMedia > 0 && !messageBody) {
      const twiml = new MessagingResponse()
      twiml.message(
        "Thanks for the file! Our team will review it. For immediate help, please describe your question in a message."
      )
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      })
    }
    return new NextResponse('', { status: 200 })
  }

  try {
    // Identify or create customer
    const customer = await findOrCreateCustomerByWhatsApp(
      whatsappId,
      profileName || undefined
    )

    // Get or create conversation
    const conversation = await getOrCreateConversation(
      'whatsapp',
      customer?.id ?? null,
      whatsappId  // use whatsappId as the external_id for conversation continuity
    )

    // Run the AI agent
    const agentResponse = await runAgent({
      channel: 'whatsapp',
      message: messageBody,
      conversationId: conversation?.id,
      customer: {
        id: customer?.id,
        phone: whatsappId,
        name: customer?.name ?? profileName,
        whatsappId,
      },
    })

    console.log(`[WHATSAPP_AGENT_RESPONSE] conversationId=${conversation?.id}`)

    // Respond via TwiML
    const twiml = new MessagingResponse()
    twiml.message(agentResponse.text)

    console.log(`[WHATSAPP_MESSAGE_SENT] to=${from} sid=${messageSid}`)

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (err) {
    console.error('[WHATSAPP] Error processing message:', err)

    // Always respond to Twilio — otherwise it retries repeatedly
    const twiml = new MessagingResponse()
    twiml.message(
      "I'm sorry, I encountered a problem. Please call us directly or try again shortly."
    )
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}
