import { NextRequest, NextResponse } from 'next/server'
import { updateAppointment } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointment_id, status } = body

    if (!appointment_id || !status) {
      return NextResponse.json(
        { error: 'Missing appointment_id or status' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no_show']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const result = await updateAppointment(appointment_id, { status })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      appointment: result.data,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
