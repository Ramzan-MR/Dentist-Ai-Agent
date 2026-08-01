import { NextResponse } from 'next/server'
import { clinicConfig } from '@/lib/clinic-config'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      clinic: clinicConfig,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
