import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-client'
import { format, subDays } from 'date-fns'

export async function GET() {
  try {
    const today = format(new Date(), 'yyyy-MM-dd')
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd')

    const [aptsToday, aptsUpcoming, convs, leads] = await Promise.all([
      supabaseServer?.from('appointments').select('id', { count: 'exact' }).eq('appointment_date', today),
      supabaseServer?.from('appointments').select('id', { count: 'exact' }).gte('appointment_date', today).neq('status', 'cancelled'),
      supabaseServer?.from('conversations').select('id, channel, created_at', { count: 'exact' }).gte('created_at', `${weekAgo}T00:00:00Z`),
      supabaseServer?.from('leads').select('id', { count: 'exact' }).eq('status', 'new'),
    ])

    const channelBreakdown = { web: 0, whatsapp: 0, voice: 0 }
    if (convs?.data) {
      for (const c of convs.data) {
        if (c.channel in channelBreakdown) channelBreakdown[c.channel as keyof typeof channelBreakdown]++
      }
    }

    return NextResponse.json({
      appointmentsToday: aptsToday?.count ?? 0,
      upcomingAppointments: aptsUpcoming?.count ?? 0,
      conversationsThisWeek: convs?.count ?? 0,
      newLeads: leads?.count ?? 0,
      channelBreakdown,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
