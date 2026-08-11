import { Tool } from '@anthropic-ai/sdk/resources/messages/messages'
import { dentalServices, clinicConfig } from '@/lib/clinic-config'
import { generateAvailableSlots } from '@/lib/availability'
import { supabaseServer } from '@/lib/supabase-client'
import { Channel } from './types'

// Tool definitions sent to Claude
export const agentTools: Tool[] = [
  {
    name: 'check_availability',
    description:
      'Check available appointment time slots for a specific service and date. Use this whenever the patient asks about availability or wants to book.',
    input_schema: {
      type: 'object' as const,
      properties: {
        service_name: {
          type: 'string',
          description: 'Name of the dental service (e.g., "Teeth Cleaning", "General Checkup")',
        },
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format',
        },
      },
      required: ['service_name', 'date'],
    },
  },
  {
    name: 'get_services',
    description: 'Return the full list of dental services with prices and durations.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_clinic_info',
    description: 'Return clinic contact information, address, and operating hours.',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'create_lead',
    description:
      'Save a patient inquiry/lead. Use this once you have collected the patient name and at least one contact method (phone or email).',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Patient full name' },
        phone: { type: 'string', description: 'Patient phone number' },
        email: { type: 'string', description: 'Patient email address' },
        service: { type: 'string', description: 'Desired service' },
        preferred_time: { type: 'string', description: 'Preferred appointment time or date' },
        notes: { type: 'string', description: 'Any additional notes or context' },
      },
      required: ['name'],
    },
  },
  {
    name: 'transfer_to_human',
    description:
      'Escalate the conversation to a human team member. Use when the patient is upset, asks for a human, or the request is beyond your ability.',
    input_schema: {
      type: 'object' as const,
      properties: {
        reason: {
          type: 'string',
          description: 'Brief reason for transfer',
        },
      },
      required: ['reason'],
    },
  },
  {
    name: 'end_call',
    description:
      'End the phone call gracefully. Use only on the voice channel when the caller says goodbye or indicates the conversation is finished.',
    input_schema: {
      type: 'object' as const,
      properties: {
        summary: {
          type: 'string',
          description: 'Brief summary of what was accomplished',
        },
      },
      required: ['summary'],
    },
  },
]

// Tool execution — returns a string result to send back to Claude
export async function executeTool(
  toolName: string,
  toolInput: Record<string, string>,
  channel: Channel,
  conversationId?: string,
  customerId?: string
): Promise<string> {
  try {
    switch (toolName) {
      case 'check_availability': {
        const { service_name, date } = toolInput
        const service = dentalServices.find(
          s => s.name.toLowerCase().includes(service_name.toLowerCase())
        )
        if (!service) {
          return JSON.stringify({
            error: 'Service not found',
            available_services: dentalServices.map(s => s.name),
          })
        }
        const slots = await generateAvailableSlots(service.id, date)
        if (slots.length === 0) {
          return JSON.stringify({ date, available: false, message: 'No slots available on this date' })
        }
        const topSlots = slots.slice(0, 5).map(s => s.formatted)
        return JSON.stringify({ date, service: service.name, available_slots: topSlots, total: slots.length })
      }

      case 'get_services': {
        const list = dentalServices.map(s => ({
          name: s.name,
          price: `$${s.price}`,
          duration: `${s.duration_minutes} minutes`,
          category: s.category,
          description: s.description,
        }))
        return JSON.stringify({ services: list })
      }

      case 'get_clinic_info': {
        return JSON.stringify({
          name: clinicConfig.name,
          address: clinicConfig.address,
          phone: clinicConfig.phone,
          email: clinicConfig.email,
          hours: `${clinicConfig.opening_time}–${clinicConfig.closing_time}`,
          lunch_break: `${clinicConfig.break_start}–${clinicConfig.break_end}`,
          working_days: clinicConfig.working_days,
        })
      }

      case 'create_lead': {
        const { name, phone, email, service, preferred_time, notes } = toolInput
        if (supabaseServer) {
          await supabaseServer.from('leads').insert([
            {
              customer_id: customerId || null,
              conversation_id: conversationId || null,
              name,
              phone: phone || null,
              email: email || null,
              service: service || null,
              preferred_time: preferred_time || null,
              notes: notes || null,
              channel,
              status: 'new',
            },
          ])
        }
        return JSON.stringify({ success: true, message: 'Lead saved. Team will follow up.' })
      }

      case 'transfer_to_human': {
        const humanNumber = process.env.HUMAN_TRANSFER_NUMBER
        if (!humanNumber) {
          return JSON.stringify({
            success: false,
            message: 'No human agent configured. Collect callback details instead.',
          })
        }
        return JSON.stringify({
          success: true,
          transfer_to: humanNumber,
          message: 'Transferring to human agent.',
        })
      }

      case 'end_call': {
        return JSON.stringify({ success: true, action: 'end_call', summary: toolInput.summary })
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Tool execution error'
    console.error(`[TOOL] ${toolName} failed:`, msg)
    return JSON.stringify({ error: msg })
  }
}
