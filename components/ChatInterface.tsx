'use client'

import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import QuickActions from './QuickActions'
import { clinicConfig } from '@/lib/clinic-config'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Welcome to ${clinicConfig.name}! 👋 I'm your AI assistant. How can I help you today? You can book an appointment, check our services, or ask about our clinic.`,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }
    setMessages(prev => [...prev, userMessage])
    setError(null)
    setIsLoading(true)

    try {
      // Convert messages to the format expected by the API
      const history = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          history,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      book: 'I would like to book an appointment',
      check: 'Can you check available appointment slots?',
      reschedule: 'I need to reschedule my appointment',
      cancel: 'I want to cancel my appointment',
      services: 'What dental services do you offer?',
    }

    const message = actionMessages[action] || action
    handleSendMessage(message)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-dental-600 to-dental-700 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">{clinicConfig.name}</h1>
          <p className="text-dental-100 text-sm mt-1">Professional Dental Care</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 1 && !isLoading && (
            <div className="mb-6">
              <QuickActions onAction={handleQuickAction} />
            </div>
          )}

          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg rounded-tl-none max-w-xs">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-blue-50 border-t border-blue-200 px-4 py-2 text-center text-sm text-gray-600">
        <p>📞 {clinicConfig.phone} | 📧 {clinicConfig.email}</p>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
