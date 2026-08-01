import { NextResponse } from 'next/server'
import { getAppointmentsInDateRange } from '@/lib/supabase-client'
import { format, subDays } from 'date-fns'

export async function GET() {
  try {
    // Get appointments from last 90 days to next 90 days
    const startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd')
    const endDate = format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')

    const result = await getAppointmentsInDateRange(startDate, endDate)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      appointments: result.data || [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
