// Appointment types
export interface Appointment {
  id: string
  booking_reference: string
  patient_name: string
  phone: string
  email: string
  service: string
  appointment_date: string
  start_time: string
  end_time: string
  timezone: string
  patient_type: 'new' | 'existing'
  urgency: 'routine' | 'urgent'
  notes: string
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show'
  google_calendar_event_id?: string
  cancellation_reason?: string
  created_at: string
  updated_at: string
}

// Chat types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  appointment_id?: string
  created_at: string
  updated_at: string
}

// Dental service types
export interface DentalService {
  id: string
  name: string
  description: string
  duration_minutes: number
  price: number
  category: string
}

// Time slot types
export interface TimeSlot {
  date: string
  time: string
  formatted: string
}

// Appointment booking form
export interface BookingFormData {
  patient_name: string
  phone: string
  email: string
  service: string
  appointment_date: string
  start_time: string
  patient_type: 'new' | 'existing'
  urgency: 'routine' | 'urgent'
  notes: string
}

// AI Tool definitions
export interface ToolInput {
  [key: string]: string | number | boolean | object | null | undefined
}

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}

// Clinic configuration
export interface ClinicConfig {
  name: string
  address: string
  phone: string
  email: string
  timezone: string
  opening_time: string
  closing_time: string
  break_start: string
  break_end: string
  working_days: string[]
  appointment_duration: number
}

// Availability check response
export interface AvailabilityResponse {
  date: string
  available_slots: TimeSlot[]
}

// User admin/auth
export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'staff'
  created_at: string
  updated_at: string
}
