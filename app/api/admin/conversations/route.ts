import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-client'

export async function GET(req: NextRequest) {
  try {
    const channel = req.nextUrl.searchParams.get('channel')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50')

    let query = supabaseServer
      ?.from('conversations')
      .select(`
        id, channel, status, created_at, updated_at, external_id,
        customers ( id, name, phone, whatsapp_id, email ),
        messages ( id, role, content, created_at )
      `)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (channel) query = query?.eq('channel', channel)

    const { data, error } = await query ?? { data: null, error: 'Supabase not configured' }

    if (error) return NextResponse.json({ error: String(error) }, { status: 400 })

    return NextResponse.json({ conversations: data ?? [] })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
