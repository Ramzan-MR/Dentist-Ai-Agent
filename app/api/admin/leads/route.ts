import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-client'

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50')

    let query = supabaseServer
      ?.from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) query = query?.eq('status', status)

    const { data, error } = await query ?? { data: null, error: 'Supabase not configured' }

    if (error) return NextResponse.json({ error: String(error) }, { status: 400 })

    return NextResponse.json({ leads: data ?? [] })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()
    const { error } = await supabaseServer?.from('leads').update({ status }).eq('id', id) ?? { error: 'Supabase not configured' }
    if (error) return NextResponse.json({ error: String(error) }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
