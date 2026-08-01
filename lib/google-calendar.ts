import { google } from 'googleapis'
import { Appointment } from './types'

interface CalendarEvent {
  summary: string
  description: string
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  attendees?: Array<{ email: string }>
}

function getAuthClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY

  if (!clientEmail || !privateKey) {
    throw new Error('Missing Google Calendar configuration')
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
}

export async function createCalendarEvent(
  appointment: Appointment
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const auth = getAuthClient()
    const calendar = google.calendar({ version: 'v3', auth })
    const calendarId = process.env.GOOGLE_CALENDAR_ID

    if (!calendarId) {
      return { success: false, error: 'Missing Google Calendar ID' }
    }

    const startDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}:00`)
    const endDateTime = new Date(`${appointment.appointment_date}T${appointment.end_time}:00`)

    const event: CalendarEvent = {
      summary: `Dental Appointment - ${appointment.patient_name}`,
      description: `
Patient: ${appointment.patient_name}
Service: ${appointment.service}
Phone: ${appointment.phone}
Email: ${appointment.email}
Booking Ref: ${appointment.booking_reference}
Type: ${appointment.patient_type === 'new' ? 'New Patient' : 'Existing Patient'}
Urgency: ${appointment.urgency}
Notes: ${appointment.notes || 'None'}
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: appointment.timezone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: appointment.timezone,
      },
      attendees: [{ email: appointment.email }],
    }

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
      sendUpdates: 'externalOnly',
    })

    return {
      success: true,
      eventId: response.data.id || '',
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: `Failed to create calendar event: ${message}` }
  }
}

export async function updateCalendarEvent(
  eventId: string,
  appointment: Appointment
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = getAuthClient()
    const calendar = google.calendar({ version: 'v3', auth })
    const calendarId = process.env.GOOGLE_CALENDAR_ID

    if (!calendarId) {
      return { success: false, error: 'Missing Google Calendar ID' }
    }

    const startDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}:00`)
    const endDateTime = new Date(`${appointment.appointment_date}T${appointment.end_time}:00`)

    const event: CalendarEvent = {
      summary: `Dental Appointment - ${appointment.patient_name}`,
      description: `
Patient: ${appointment.patient_name}
Service: ${appointment.service}
Phone: ${appointment.phone}
Email: ${appointment.email}
Booking Ref: ${appointment.booking_reference}
Type: ${appointment.patient_type === 'new' ? 'New Patient' : 'Existing Patient'}
Status: ${appointment.status}
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: appointment.timezone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: appointment.timezone,
      },
    }

    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
      sendUpdates: 'externalOnly',
    })

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: `Failed to update calendar event: ${message}` }
  }
}

export async function cancelCalendarEvent(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = getAuthClient()
    const calendar = google.calendar({ version: 'v3', auth })
    const calendarId = process.env.GOOGLE_CALENDAR_ID

    if (!calendarId) {
      return { success: false, error: 'Missing Google Calendar ID' }
    }

    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'externalOnly',
    })

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: `Failed to cancel calendar event: ${message}` }
  }
}

export async function getCalendarAvailability(
  date: string
): Promise<{ success: boolean; busyPeriods?: Array<{ start: string; end: string }>; error?: string }> {
  try {
    const auth = getAuthClient()
    const calendar = google.calendar({ version: 'v3', auth })
    const calendarId = process.env.GOOGLE_CALENDAR_ID

    if (!calendarId) {
      return { success: false, error: 'Missing Google Calendar ID' }
    }

    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const response = await calendar.events.list({
      calendarId,
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const busyPeriods = (response.data.items || [])
      .filter(event => event.status !== 'cancelled')
      .map(event => ({
        start: event.start?.dateTime || event.start?.date || '',
        end: event.end?.dateTime || event.end?.date || '',
      }))
      .filter(period => period.start && period.end)

    return { success: true, busyPeriods }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: `Failed to get calendar availability: ${message}` }
  }
}
