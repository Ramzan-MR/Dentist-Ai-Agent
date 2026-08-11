import { supabaseServer } from '@/lib/supabase-client'
import { Conversation, Channel } from '@/lib/agent/types'

export async function getOrCreateConversation(
  channel: Channel,
  customerId?: string | null,
  externalId?: string | null
): Promise<Conversation | null> {
  if (!supabaseServer) return null
  try {
    // If externalId provided, look for existing active conversation
    if (externalId) {
      const { data: existing } = await supabaseServer
        .from('conversations')
        .select('*')
        .eq('external_id', externalId)
        .eq('status', 'active')
        .maybeSingle()
      if (existing) return existing as Conversation
    }

    // For WhatsApp: reuse recent active conversation for same customer
    if (channel === 'whatsapp' && customerId) {
      const { data: recent } = await supabaseServer
        .from('conversations')
        .select('*')
        .eq('customer_id', customerId)
        .eq('channel', 'whatsapp')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (recent) return recent as Conversation
    }

    const { data: created, error } = await supabaseServer
      .from('conversations')
      .insert([
        {
          customer_id: customerId || null,
          channel,
          status: 'active',
          external_id: externalId || null,
          metadata: {},
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('[DB] createConversation error:', error.message)
      return null
    }
    return created as Conversation
  } catch (err) {
    console.error('[DB] getOrCreateConversation error:', err)
    return null
  }
}

export async function getConversationHistory(
  conversationId: string,
  limit = 20
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  if (!supabaseServer) return []
  try {
    const { data } = await supabaseServer
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .in('role', ['user', 'assistant'])
      .order('created_at', { ascending: true })
      .limit(limit)

    return (data || []).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
  } catch (err) {
    console.error('[DB] getConversationHistory error:', err)
    return []
  }
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  channel: Channel,
  externalId?: string | null
): Promise<void> {
  if (!supabaseServer) return
  try {
    await supabaseServer.from('messages').insert([
      {
        conversation_id: conversationId,
        role,
        content,
        channel,
        external_id: externalId || null,
        metadata: {},
      },
    ])
  } catch (err) {
    console.error('[DB] saveMessage error:', err)
  }
}

export async function markConversationCompleted(conversationId: string): Promise<void> {
  if (!supabaseServer) return
  try {
    await supabaseServer
      .from('conversations')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', conversationId)
  } catch (err) {
    console.error('[DB] markConversationCompleted error:', err)
  }
}
