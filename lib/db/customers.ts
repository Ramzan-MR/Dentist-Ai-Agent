import { supabaseServer } from '@/lib/supabase-client'
import { Customer } from '@/lib/agent/types'

export async function findOrCreateCustomerByPhone(
  phone: string,
  name?: string
): Promise<Customer | null> {
  if (!supabaseServer) return null
  try {
    const normalized = normalizePhone(phone)
    const { data: existing } = await supabaseServer
      .from('customers')
      .select('*')
      .eq('phone', normalized)
      .maybeSingle()

    if (existing) {
      if (name && !existing.name) {
        const { data: updated } = await supabaseServer
          .from('customers')
          .update({ name, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single()
        return updated as Customer
      }
      return existing as Customer
    }

    const { data: created, error } = await supabaseServer
      .from('customers')
      .insert([{ phone: normalized, name: name || null }])
      .select()
      .single()

    if (error) {
      console.error('[DB] createCustomer error:', error.message)
      return null
    }
    return created as Customer
  } catch (err) {
    console.error('[DB] findOrCreateCustomerByPhone error:', err)
    return null
  }
}

export async function findOrCreateCustomerByWhatsApp(
  whatsappId: string,
  name?: string
): Promise<Customer | null> {
  if (!supabaseServer) return null
  try {
    const { data: existing } = await supabaseServer
      .from('customers')
      .select('*')
      .eq('whatsapp_id', whatsappId)
      .maybeSingle()

    if (existing) {
      if (name && !existing.name) {
        const { data: updated } = await supabaseServer
          .from('customers')
          .update({ name, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single()
        return updated as Customer
      }
      return existing as Customer
    }

    const { data: created, error } = await supabaseServer
      .from('customers')
      .insert([{ whatsapp_id: whatsappId, name: name || null }])
      .select()
      .single()

    if (error) {
      console.error('[DB] createCustomerWhatsApp error:', error.message)
      return null
    }
    return created as Customer
  } catch (err) {
    console.error('[DB] findOrCreateCustomerByWhatsApp error:', err)
    return null
  }
}

export function normalizePhone(phone: string): string {
  // Ensure E.164 format
  const digits = phone.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('1') && digits.length === 11) return `+${digits}`
  return `+${digits}`
}
