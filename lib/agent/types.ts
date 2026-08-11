// Omnichannel agent types — used by web, WhatsApp, and voice channels

export type Channel = 'web' | 'whatsapp' | 'voice'

export interface CustomerContext {
  id?: string
  phone?: string
  whatsappId?: string
  email?: string
  name?: string
}

export interface AgentRequest {
  channel: Channel
  message: string
  conversationId?: string
  customer?: CustomerContext
  // Web channel passes history from frontend; WhatsApp/voice use DB
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
  metadata?: Record<string, string>
}

export interface AgentResponse {
  text: string
  conversationId: string
  actions?: AgentAction[]
}

export interface AgentAction {
  type: 'transfer_to_human' | 'create_lead' | 'booking_created'
  data: Record<string, unknown>
}

// DB-level types for omnichannel tables

export interface Customer {
  id: string
  phone: string | null
  whatsapp_id: string | null
  email: string | null
  name: string | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  customer_id: string | null
  channel: Channel
  status: 'active' | 'completed' | 'abandoned'
  external_id: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  channel: Channel
  external_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface Lead {
  id: string
  customer_id: string | null
  conversation_id: string | null
  name: string
  phone: string | null
  email: string | null
  service: string | null
  intent: string | null
  preferred_time: string | null
  notes: string | null
  channel: Channel
  status: 'new' | 'contacted' | 'converted' | 'lost'
  created_at: string
  updated_at: string
}

// Voice session state kept in memory per WebSocket connection
export interface VoiceSession {
  callSid: string
  conversationId: string
  customer: CustomerContext
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  startedAt: number
}

// Twilio ConversationRelay WebSocket message shapes
export interface CRSetupEvent {
  event: 'setup'
  sessionId: string
  callSid: string
  from: string
  to: string
  direction: 'inbound' | 'outbound-api'
  customParameters?: Record<string, string>
}

export interface CRPromptEvent {
  event: 'prompt'
  voicePrompt: string
  lang: string
  last: boolean
}

export interface CRInterruptEvent {
  event: 'interrupt'
  utteranceUntilInterrupt: string
  durationUntilInterruptMs: number
}

export interface CRDtmfEvent {
  event: 'dtmf'
  digit: string
}

export type CRInboundEvent = CRSetupEvent | CRPromptEvent | CRInterruptEvent | CRDtmfEvent

export interface CRTextResponse {
  type: 'text'
  token: string
  last: boolean
}

export interface CREndResponse {
  type: 'end'
}

export type CROutboundMessage = CRTextResponse | CREndResponse
