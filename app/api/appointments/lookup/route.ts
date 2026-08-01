import { NextRequest, NextResponse } from 'next/server'
import { AppointmentLookupSchema } from '@/lib/schemas'
import { getAppointmentsByEmail } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = AppointmentLookupSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.errors },
        { status: 400 }
      )
    }

    const { email } = result.data

    const appointmentsResult = await getAppointmentsByEmail(email)

    if (!appointmentsResult.success) {
      return NextResponse.json(
        { error: appointmentsResult.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      appointments: appointmentsResult.data || [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
