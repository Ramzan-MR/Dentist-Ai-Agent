import { NextRequest, NextResponse } from 'next/server'
import { validateTwilioSignature, buildWebhookUrl } from '@/lib/twilio'
import { supabaseServer } from '@/lib/supabase-client'
import { markConversationCompleted } from '@/lib/db/conversations'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const body: Record<string, string> = {}
  formData.forEach((value, key) => { body[key] = value.toString() })

  if (process.env.NODE_ENV === 'production') {
    const webhookUrl = buildWebhookUrl('/api/voice/status')
    const valid = validateTwilioSignature(request, body, webhookUrl)
    if (!valid) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  const callSid = body['CallSid'] ?? ''
  const callStatus = body['CallStatus'] ?? ''
  const duration = body['CallDuration'] ?? '0'
  const direction = body['Direction'] ?? ''

  console.log(`[VOICE_CALL_COMPLETED] callSid=${callSid} status=${callStatus} duration=${duration}s`)

  // Persist call metadata if Supabase is configured
  if (supabaseServer && callSid) {
    try {
      await supabaseServer.from('conversations')
        .update({
          status: ['completed', 'no-answer', 'failed', 'busy', 'canceled'].includes(callStatus)
            ? 'completed'
            : 'active',
          metadata: { callSid, callStatus, duration, direction },
          updated_at: new Date().toISOString(),
        })
        .eq('external_id', callSid)

      if (['completed', 'no-answer', 'failed', 'busy', 'canceled'].includes(callStatus)) {
        const { data: convo } = await supabaseServer
          .from('conversations')
          .select('id')
          .eq('external_id', callSid)
          .maybeSingle()
        if (convo) {
          await markConversationCompleted(convo.id)
        }
      }
    } catch (err) {
      console.error('[VOICE_STATUS] DB update error:', err)
    }
  }

  return new NextResponse('', { status: 200 })
}
