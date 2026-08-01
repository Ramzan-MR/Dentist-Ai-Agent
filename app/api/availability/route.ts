import { NextRequest, NextResponse } from 'next/server'
import { AvailabilityCheckSchema } from '@/lib/schemas'
import { generateAvailableSlots, getNextAvailableDates } from '@/lib/availability'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = AvailabilityCheckSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.errors },
        { status: 400 }
      )
    }

    const { service, date } = result.data

    const availableSlots = await generateAvailableSlots(service, date)

    return NextResponse.json({
      success: true,
      date,
      available_slots: availableSlots,
      has_availability: availableSlots.length > 0,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const nextDates = getNextAvailableDates(30)

    return NextResponse.json({
      success: true,
      next_available_dates: nextDates,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
