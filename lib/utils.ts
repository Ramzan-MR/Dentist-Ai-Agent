import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function generateBookingReference(): string {
  return `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+1${cleaned}`
  }
  if (!cleaned.startsWith('1') && cleaned.length === 10) {
    return `+1${cleaned}`
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`
  }
  return `+${cleaned}`
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 15
}

export function parseTimeString(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number)
  return { hours, minutes }
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`
}

export function isWorkingDay(date: Date, workingDays: string[]): boolean {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
  return workingDays.includes(dayName)
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script[\s\S]*?<\/script>/gi, '')  // strip script blocks with their content
    .replace(/<style[\s\S]*?<\/style>/gi, '')    // strip style blocks with their content
    .replace(/<[^>]+>/g, '')                     // strip remaining HTML tags
    .substring(0, 500)
}
