import { z } from 'zod'

export const BookingFormSchema = z.object({
  patient_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  service: z.string().min(1, 'Please select a service'),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  patient_type: z.enum(['new', 'existing']),
  urgency: z.enum(['routine', 'urgent']),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
})

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
})

export const RescheduleSchema = z.object({
  appointment_id: z.string().uuid(),
  new_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  new_time: z.string().regex(/^\d{2}:\d{2}$/),
})

export const CancelSchema = z.object({
  appointment_id: z.string().uuid(),
  cancellation_reason: z.string().max(500),
})

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const AvailabilityCheckSchema = z.object({
  service: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const AppointmentLookupSchema = z.object({
  email: z.string().email(),
  phone: z.string(),
})

export type BookingFormData = z.infer<typeof BookingFormSchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema>
export type RescheduleData = z.infer<typeof RescheduleSchema>
export type CancelData = z.infer<typeof CancelSchema>
export type AdminLoginData = z.infer<typeof AdminLoginSchema>
export type AvailabilityCheckData = z.infer<typeof AvailabilityCheckSchema>
export type AppointmentLookupData = z.infer<typeof AppointmentLookupSchema>
