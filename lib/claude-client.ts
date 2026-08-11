// Central AI client — now powered by Claude via the shared agent layer.
// The web chat API route calls chat() with conversation history from the frontend.

import { runAgent } from '@/lib/agent/run-agent'

export async function chat(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<{ response: string }> {
  const result = await runAgent({
    channel: 'web',
    message: userMessage,
    history: conversationHistory,
  })
  return { response: result.text }
}
