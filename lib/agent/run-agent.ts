import Anthropic from '@anthropic-ai/sdk'
import {
  MessageParam,
  ToolUseBlock,
  ToolResultBlockParam,
  TextBlock,
} from '@anthropic-ai/sdk/resources/messages/messages'
import { AgentRequest, AgentResponse, AgentAction } from './types'
import { buildSystemPrompt } from './prompts'
import { agentTools, executeTool } from './tools'
import { getOrCreateConversation, getConversationHistory, saveMessage } from '@/lib/db/conversations'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 1024
const MAX_TOOL_ITERATIONS = 5

export async function runAgent(request: AgentRequest): Promise<AgentResponse> {
  const { channel, message, customer, metadata } = request

  // Resolve conversation
  let conversationId = request.conversationId
  if (!conversationId) {
    const convo = await getOrCreateConversation(channel, customer?.id ?? null, metadata?.externalId ?? null)
    conversationId = convo?.id ?? `temp-${Date.now()}`
  }

  // Build message history
  let history: Array<{ role: 'user' | 'assistant'; content: string }>
  if (request.history && request.history.length > 0) {
    // Web channel passes its own history from the frontend
    history = request.history.slice(-20)
  } else {
    // WhatsApp / voice: load from DB
    history = await getConversationHistory(conversationId, 20)
  }

  const systemPrompt = buildSystemPrompt(channel, customer?.name)
  const pendingActions: AgentAction[] = []

  // Build the messages array for Claude
  const messages: MessageParam[] = [
    ...history.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user', content: message },
  ]

  let finalText = ''
  let iterations = 0

  // Agentic loop: Claude may call tools multiple times
  while (iterations < MAX_TOOL_ITERATIONS) {
    iterations++

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: agentTools,
      messages,
    })

    // Collect any text blocks
    const textBlocks = response.content.filter((b): b is TextBlock => b.type === 'text')
    if (textBlocks.length > 0) {
      finalText = textBlocks.map(b => b.text).join('\n').trim()
    }

    // If Claude finished without tool use, we're done
    if (response.stop_reason === 'end_turn') {
      break
    }

    // Process tool calls
    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter((b): b is ToolUseBlock => b.type === 'tool_use')

      // Append the assistant message (with tool use)
      messages.push({ role: 'assistant', content: response.content })

      // Execute each tool and collect results
      const toolResults: ToolResultBlockParam[] = []
      for (const toolUse of toolUseBlocks) {
        console.log(`[AGENT] Tool call: ${toolUse.name}`, toolUse.input)
        const result = await executeTool(
          toolUse.name,
          toolUse.input as Record<string, string>,
          channel,
          conversationId,
          customer?.id
        )

        // Track actions for transfer/end_call
        if (toolUse.name === 'transfer_to_human') {
          pendingActions.push({ type: 'transfer_to_human', data: JSON.parse(result) })
        }
        if (toolUse.name === 'end_call') {
          pendingActions.push({ type: 'booking_created', data: JSON.parse(result) })
        }
        if (toolUse.name === 'create_lead') {
          pendingActions.push({ type: 'create_lead', data: JSON.parse(result) })
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: result,
        })
      }

      // Feed tool results back to Claude
      messages.push({ role: 'user', content: toolResults })
      continue
    }

    break
  }

  // Save messages to DB (skip for web channel which manages its own state)
  if (channel !== 'web' && conversationId && !conversationId.startsWith('temp-')) {
    await saveMessage(conversationId, 'user', message, channel)
    if (finalText) {
      await saveMessage(conversationId, 'assistant', finalText, channel)
    }
  }

  if (!finalText) {
    finalText = getFallbackMessage(channel)
  }

  return {
    text: finalText,
    conversationId,
    actions: pendingActions.length > 0 ? pendingActions : undefined,
  }
}

function getFallbackMessage(channel: string): string {
  if (channel === 'voice') {
    return "I'm sorry, I had trouble processing that. Could you please repeat your question?"
  }
  return "I'm sorry, I had trouble processing your message. Please try again or call us directly."
}
