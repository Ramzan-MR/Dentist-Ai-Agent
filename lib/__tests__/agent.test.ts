/**
 * Shared agent tests — mock Anthropic and Supabase to avoid real API calls.
 */
import { runAgent } from '../agent/run-agent'

// Mock the Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'Hello! How can I help you today?' }],
          stop_reason: 'end_turn',
        }),
      },
    })),
  }
})

// Mock Supabase (no DB calls during tests)
jest.mock('../supabase-client', () => ({
  supabase: null,
  supabaseServer: null,
}))

// Mock DB helpers
jest.mock('../db/conversations', () => ({
  getOrCreateConversation: jest.fn().mockResolvedValue({ id: 'test-conv-id' }),
  getConversationHistory: jest.fn().mockResolvedValue([]),
  saveMessage: jest.fn().mockResolvedValue(undefined),
  markConversationCompleted: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('../db/customers', () => ({
  findOrCreateCustomerByPhone: jest.fn().mockResolvedValue({ id: 'cust-1', phone: '+1234567890', name: null }),
  findOrCreateCustomerByWhatsApp: jest.fn().mockResolvedValue({ id: 'cust-2', whatsapp_id: 'whatsapp:+1234567890', name: null }),
  normalizePhone: jest.fn((p: string) => p),
}))

describe('runAgent — shared agent layer', () => {
  it('accepts web channel and returns text', async () => {
    const result = await runAgent({
      channel: 'web',
      message: 'What are your opening hours?',
      history: [],
    })
    expect(result).toHaveProperty('text')
    expect(typeof result.text).toBe('string')
    expect(result.text.length).toBeGreaterThan(0)
    expect(result).toHaveProperty('conversationId')
  })

  it('accepts whatsapp channel', async () => {
    const result = await runAgent({
      channel: 'whatsapp',
      message: 'Hello',
      customer: { phone: '+1234567890', whatsappId: 'whatsapp:+1234567890' },
    })
    expect(result).toHaveProperty('text')
    expect(result.text.length).toBeGreaterThan(0)
  })

  it('accepts voice channel', async () => {
    const result = await runAgent({
      channel: 'voice',
      message: 'What services do you offer?',
      customer: { phone: '+1234567890' },
    })
    expect(result).toHaveProperty('text')
    expect(result.text.length).toBeGreaterThan(0)
  })

  it('uses provided conversation history for web channel', async () => {
    const history = [
      { role: 'user' as const, content: 'Hi there' },
      { role: 'assistant' as const, content: 'Hello! How can I help?' },
    ]
    const result = await runAgent({
      channel: 'web',
      message: 'What is your phone number?',
      history,
    })
    expect(result).toHaveProperty('text')
  })

  it('returns a conversationId', async () => {
    const result = await runAgent({
      channel: 'whatsapp',
      message: 'Book appointment',
      conversationId: 'existing-conv-id',
    })
    expect(result.conversationId).toBeDefined()
    expect(typeof result.conversationId).toBe('string')
  })
})
