import twilio from 'twilio'
import { normalizePhone } from '@/lib/db/customers'

// Lazy-init Twilio client — only created when credentials are available
let _client: twilio.Twilio | null = null

export function getTwilioClient(): twilio.Twilio {
  if (_client) return _client
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be configured')
  }
  _client = twilio(accountSid, authToken)
  return _client
}

/**
 * Validate a Twilio webhook request signature.
 * Must be called before processing any Twilio webhook payload.
 *
 * Vercel/proxy hosts may rewrite the protocol to https but keep the original
 * Host header. We build the URL from APP_BASE_URL + the path to avoid
 * protocol mismatch issues.
 */
export function validateTwilioSignature(
  request: Request,
  body: Record<string, string>,
  url: string
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) {
    console.error('[TWILIO] TWILIO_AUTH_TOKEN not configured — cannot validate signature')
    return false
  }

  const signature = request.headers.get('x-twilio-signature') ?? ''
  if (!signature) {
    console.warn('[TWILIO] Missing x-twilio-signature header')
    return false
  }

  return twilio.validateRequest(authToken, signature, url, body)
}

/**
 * Build the full URL for a Twilio webhook using the configured APP_BASE_URL.
 * Falls back to NEXT_PUBLIC_APP_URL for local dev.
 */
export function buildWebhookUrl(path: string): string {
  const base =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  return `${base.replace(/\/$/, '')}${path}`
}

/**
 * Send a WhatsApp message via Twilio.
 */
export async function sendWhatsAppMessage(to: string, body: string): Promise<string | null> {
  try {
    const client = getTwilioClient()
    const from = process.env.TWILIO_WHATSAPP_NUMBER
    if (!from) throw new Error('TWILIO_WHATSAPP_NUMBER not configured')

    const message = await client.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${normalizePhone(to)}`,
      body,
    })
    return message.sid
  } catch (err) {
    console.error('[TWILIO] sendWhatsAppMessage error:', err)
    return null
  }
}

/**
 * Initiate an outbound voice call.
 * twimlUrl: the URL Twilio will fetch for TwiML instructions when the call is answered.
 */
export async function initiateOutboundCall(
  to: string,
  twimlUrl: string
): Promise<string | null> {
  try {
    const client = getTwilioClient()
    const from = process.env.TWILIO_PHONE_NUMBER
    if (!from) throw new Error('TWILIO_PHONE_NUMBER not configured')

    const call = await client.calls.create({
      to: normalizePhone(to),
      from,
      url: twimlUrl,
      statusCallback: buildWebhookUrl('/api/voice/status'),
      statusCallbackMethod: 'POST',
    })
    return call.sid
  } catch (err) {
    console.error('[TWILIO] initiateOutboundCall error:', err)
    return null
  }
}

export function isTwilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  )
}

export function isWhatsAppConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_NUMBER
  )
}
