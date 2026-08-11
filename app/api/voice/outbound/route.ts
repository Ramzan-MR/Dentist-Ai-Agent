import { NextRequest, NextResponse } from 'next/server'
import { initiateOutboundCall, buildWebhookUrl } from '@/lib/twilio'
import { normalizePhone } from '@/lib/db/customers'

// Simple rate limit: max 10 outbound calls per hour per calling IP
const callCounts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = callCounts.get(ip)
  if (!entry || now > entry.resetAt) {
    callCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

// Validate E.164 phone number
function isValidE164(phone: string): boolean {
  return /^\+\d{7,15}$/.test(phone)
}

export async function POST(request: NextRequest) {
  // Require internal authorization — check for a shared secret header
  const authToken = request.headers.get('x-outbound-secret')
  const expectedSecret = process.env.OUTBOUND_CALL_SECRET

  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'Outbound calling is not configured (OUTBOUND_CALL_SECRET missing)' },
      { status: 503 }
    )
  }

  if (authToken !== expectedSecret) {
    console.warn('[VOICE_OUTBOUND] Unauthorized attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit by IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const body = await request.json()
  const { to, purpose, customerId } = body

  if (!to || typeof to !== 'string') {
    return NextResponse.json({ error: 'to (phone number) is required' }, { status: 400 })
  }

  let normalizedTo: string
  try {
    normalizedTo = normalizePhone(to)
  } catch {
    return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
  }

  if (!isValidE164(normalizedTo)) {
    return NextResponse.json({ error: 'Phone number must be in E.164 format (e.g. +12125551234)' }, { status: 400 })
  }

  // Build the TwiML URL for the outbound call — reuses the same incoming voice handler
  const twimlUrl = buildWebhookUrl('/api/voice/incoming')

  console.log(`[VOICE_OUTBOUND] Initiating call to ${normalizedTo} purpose="${purpose ?? 'general'}" customer=${customerId ?? 'unknown'}`)

  const callSid = await initiateOutboundCall(normalizedTo, twimlUrl)

  if (!callSid) {
    return NextResponse.json({ error: 'Failed to initiate call' }, { status: 500 })
  }

  console.log(`[VOICE_OUTBOUND] Call initiated callSid=${callSid}`)

  return NextResponse.json({
    success: true,
    callSid,
    to: normalizedTo,
    purpose: purpose ?? 'general',
  })
}
