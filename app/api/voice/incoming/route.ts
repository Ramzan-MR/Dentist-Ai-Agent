import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { validateTwilioSignature, buildWebhookUrl } from '@/lib/twilio'
import { clinicConfig } from '@/lib/clinic-config'

const { VoiceResponse } = twilio.twiml

export async function POST(request: NextRequest) {
  console.log('[VOICE_CALL_STARTED] Incoming call webhook')

  const formData = await request.formData()
  const body: Record<string, string> = {}
  formData.forEach((value, key) => { body[key] = value.toString() })

  // Validate signature in production
  if (process.env.NODE_ENV === 'production') {
    const webhookUrl = buildWebhookUrl('/api/voice/incoming')
    const valid = validateTwilioSignature(request, body, webhookUrl)
    if (!valid) {
      console.warn('[VOICE] Invalid Twilio signature — rejecting')
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  const callSid = body['CallSid'] ?? ''
  const from = body['From'] ?? ''
  const direction = body['Direction'] ?? 'inbound'

  console.log(`[VOICE_CALL_STARTED] callSid=${callSid} from=${from} direction=${direction}`)

  // Build WebSocket URL for ConversationRelay
  const wsUrl = process.env.VOICE_WS_URL || buildWebhookUrl('/api/voice/ws').replace(/^http/, 'ws')

  const twiml = new VoiceResponse()

  const connect = twiml.connect()
  const conversationRelay = connect.conversationRelay({
    url: wsUrl,
    welcomeGreeting: `Thank you for calling ${clinicConfig.name}. I'm your AI dental assistant. How can I help you today?`,
    welcomeGreetingInterruptible: 'true',
    dtmfDetection: true,
    interruptible: 'true',
  })

  // Pass caller info as custom parameters
  conversationRelay.parameter({ name: 'from', value: from })
  conversationRelay.parameter({ name: 'callSid', value: callSid })
  conversationRelay.parameter({ name: 'direction', value: direction })

  const response = twiml.toString()
  console.log(`[VOICE_AGENT_CONNECTED] callSid=${callSid}`)

  return new NextResponse(response, {
    headers: { 'Content-Type': 'text/xml' },
  })
}
