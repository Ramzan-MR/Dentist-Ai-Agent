import { createClient } from '@supabase/supabase-js'
import { Appointment } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Allow missing keys during build time
const isBuilding = process.env.NODE_ENV === 'production' && !supabaseUrl

export const supabase = !isBuilding && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : (null as any)

export const supabaseServer = !isBuilding && supabaseUrl && (supabaseServiceKey || supabaseAnonKey)
  ? createClient(supabaseUrl as string, (supabaseServiceKey || supabaseAnonKey) as string)
  : (null as any)

export async function createAppointment(
  appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: Appointment; error?: string }> {
  try {
    const { data, error } = await supabaseServer
      .from('appointments')
      .insert([appointment])
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function getAppointmentsByEmail(
  email: string
): Promise<{ success: boolean; data?: Appointment[]; error?: string }> {
  try {
    const { data, error } = await supabaseServer
      .from('appointments')
      .select('*')
      .eq('email', email)
      .order('appointment_date', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function getAppointmentByBookingReference(
  reference: string
): Promise<{ success: boolean; data?: Appointment; error?: string }> {
  try {
    const { data, error } = await supabaseServer
      .from('appointments')
      .select('*')
      .eq('booking_reference', reference)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function getAppointmentsInDateRange(
  startDate: string,
  endDate: string
): Promise<{ success: boolean; data?: Appointment[]; error?: string }> {
  try {
    const { data, error } = await supabaseServer
      .from('appointments')
      .select('*')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('appointment_date', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function updateAppointment(
  id: string,
  updates: Partial<Appointment>
): Promise<{ success: boolean; data?: Appointment; error?: string }> {
  try {
    const { data, error } = await supabaseServer
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function cancelAppointment(
  id: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseServer
      .from('appointments')
      .update({ status: 'cancelled', cancellation_reason: reason })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function searchAppointments(
  query: string,
  field: 'patient_name' | 'phone' | 'email'
): Promise<{ success: boolean; data?: Appointment[]; error?: string }> {
  try {
    const { data, error } = await supabaseServer
      .from('appointments')
      .select('*')
      .ilike(field, `%${query}%`)
      .order('appointment_date', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}
