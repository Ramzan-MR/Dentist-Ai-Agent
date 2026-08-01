import { TimeSlot } from './types'
import { clinicConfig, dentalServices } from './clinic-config'
import { format, parse, addMinutes, isAfter, isBefore, isToday, addDays } from 'date-fns'
import { getAppointmentsInDateRange } from './supabase-client'

export async function generateAvailableSlots(
  serviceId: string,
  date: string
): Promise<TimeSlot[]> {
  // Validate date is not in the past
  const requestedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (requestedDate < today) {
    return []
  }

  // Find service to get duration
  const service = dentalServices.find(s => s.id === serviceId)
  if (!service) {
    return []
  }

  // Parse clinic hours
  const openingTime = parse(clinicConfig.opening_time, 'HH:mm', new Date())
  const closingTime = parse(clinicConfig.closing_time, 'HH:mm', new Date())
  const breakStart = parse(clinicConfig.break_start, 'HH:mm', new Date())
  const breakEnd = parse(clinicConfig.break_end, 'HH:mm', new Date())

  // Check if it's a working day
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
  if (!clinicConfig.working_days.includes(dayOfWeek)) {
    return []
  }

  // Generate all possible slots
  const slots: TimeSlot[] = []
  let currentTime = new Date(openingTime)

  while (currentTime < closingTime) {
    const endTime = addMinutes(currentTime, service.duration_minutes)

    // Skip break time
    const isInBreak =
      (isAfter(currentTime, breakStart) && isBefore(currentTime, breakEnd)) ||
      (isAfter(endTime, breakStart) && isBefore(endTime, breakEnd))

    if (!isInBreak && endTime <= closingTime) {
      const timeString = format(currentTime, 'HH:mm')

      // For today, only include future times
      if (isToday(requestedDate)) {
        const slotDateTime = new Date(date)
        const [hours, minutes] = timeString.split(':').map(Number)
        slotDateTime.setHours(hours, minutes, 0, 0)

        if (isAfter(slotDateTime, new Date())) {
          slots.push({
            date,
            time: timeString,
            formatted: `${timeString} - ${format(endTime, 'HH:mm')}`,
          })
        }
      } else {
        slots.push({
          date,
          time: timeString,
          formatted: `${timeString} - ${format(endTime, 'HH:mm')}`,
        })
      }
    }

    currentTime = addMinutes(currentTime, 30)
  }

  // Get booked appointments for this date
  const appointmentsResult = await getAppointmentsInDateRange(date, date)
  if (!appointmentsResult.success || !appointmentsResult.data) {
    return slots
  }

  const bookedSlots = appointmentsResult.data
    .filter(apt => apt.status !== 'cancelled')
    .map(apt => ({
      start: apt.start_time,
      end: apt.end_time,
    }))

  // Filter out booked slots
  return slots.filter(slot => {
    const slotStart = slot.time
    const slotEnd = format(
      addMinutes(parse(slot.time, 'HH:mm', new Date()), service.duration_minutes),
      'HH:mm'
    )

    return !bookedSlots.some(
      booked =>
        (slotStart >= booked.start && slotStart < booked.end) ||
        (slotEnd > booked.start && slotEnd <= booked.end) ||
        (slotStart <= booked.start && slotEnd >= booked.end)
    )
  })
}

export function getNextAvailableDates(days: number = 30): string[] {
  const dates: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < days; i++) {
    const date = addDays(today, i)
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })

    if (clinicConfig.working_days.includes(dayOfWeek)) {
      dates.push(format(date, 'yyyy-MM-dd'))
    }
  }

  return dates.slice(0, 3) // Return first 3 available dates
}

export function getTopThreeSlots(slots: TimeSlot[]): TimeSlot[] {
  return slots.slice(0, 3)
}

export function formatDateForDisplay(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function parseTimeString(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number)
  return { hours, minutes }
}
