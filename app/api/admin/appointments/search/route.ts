import { NextRequest, NextResponse } from 'next/server'
import { searchAppointments } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, field } = body

    if (!query || !field) {
      return NextResponse.json(
        { error: 'Missing query or field' },
        { status: 400 }
      )
    }

    const result = await searchAppointments(
      query,
      field as 'patient_name' | 'phone' | 'email'
    )

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
