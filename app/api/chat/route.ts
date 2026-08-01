import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/claude-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history = [] } = body

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      )
    }

    if (message.length > 4000) {
      return NextResponse.json(
        { error: 'Message is too long' },
        { status: 400 }
      )
    }

    // Convert history to proper format
    const conversationHistory = history.map(
      (msg: { role: 'user' | 'assistant'; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })
    )

    // Get response from Claude
    const result = await chat(message, conversationHistory)

    return NextResponse.json({
      success: true,
      response: result.response,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
