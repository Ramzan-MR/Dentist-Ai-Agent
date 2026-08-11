import { NextResponse } from 'next/server'
import { isTwilioConfigured, isWhatsAppConfigured } from '@/lib/twilio'

// Returns configuration status — never reveals actual secret values
export async function GET() {
  const checks: Record<string, boolean | string> = {
    anthropic_api_key: !!process.env.ANTHROPIC_API_KEY,
    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabase_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    google_calendar: !!(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY),
    twilio_voice: isTwilioConfigured(),
    twilio_whatsapp: isWhatsAppConfigured(),
    voice_ws_url: process.env.VOICE_WS_URL ?? '(not set — will use /api/voice/ws)',
    human_transfer: !!process.env.HUMAN_TRANSFER_NUMBER,
    outbound_secret: !!process.env.OUTBOUND_CALL_SECRET,
  }

  const missing: string[] = []
  const warnings: string[] = []

  if (!checks.anthropic_api_key) missing.push('ANTHROPIC_API_KEY')
  if (!checks.supabase_url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!checks.supabase_anon_key) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!checks.twilio_voice) warnings.push('Twilio voice not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)')
  if (!checks.twilio_whatsapp) warnings.push('Twilio WhatsApp not configured (TWILIO_WHATSAPP_NUMBER)')
  if (!checks.human_transfer) warnings.push('HUMAN_TRANSFER_NUMBER not set — human handoff will collect callback details instead')
  if (!checks.outbound_secret) warnings.push('OUTBOUND_CALL_SECRET not set — outbound calling endpoint disabled')

  const status = missing.length === 0 ? 'ok' : 'misconfigured'

  return NextResponse.json({
    status,
    checks,
    missing,
    warnings,
    timestamp: new Date().toISOString(),
  })
}
