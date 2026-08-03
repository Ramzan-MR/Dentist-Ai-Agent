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

const BOOKING_STEPS = ['Name', 'Service', 'Date', 'Time', 'Contact Info', 'Confirmation', 'Completed']
const TOTAL_STEPS = BOOKING_STEPS.length

function detectBookingStep(messages: Message[]): number {
  const conversation = messages.map(m => m.content.toLowerCase()).join(' ')

  if (conversation.includes('name')) return 1
  if (conversation.includes('service') || conversation.includes('treatment')) return 2
  if (conversation.includes('date') || conversation.includes('when')) return 3
  if (conversation.includes('time') || conversation.includes('slot') || conversation.includes('available')) return 4
  if (conversation.includes('phone') || conversation.includes('email')) return 5
  if (conversation.includes('confirm') || conversation.includes('booking')) return 6
  if (conversation.includes('completed') || conversation.includes('confirmed')) return 7

  return 0
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
  const [currentStep, setCurrentStep] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const step = detectBookingStep(messages)
    setCurrentStep(step)
  }, [messages])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
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
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-dental-600 to-dental-700 text-white shadow-lg flex-shrink-0">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{clinicConfig.name}</h1>
              {currentStep > 0 && <p className="text-dental-100 text-xs sm:text-sm mt-1">Step {currentStep}/{TOTAL_STEPS}</p>}
            </div>
            <div className="text-right">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl">🦷</div>
            </div>
          </div>

          {currentStep > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Booking Progress</span>
                <span className="text-xs">{currentStep}/{TOTAL_STEPS}</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent',
        }}
      >
        <div className="w-full px-4 py-6 sm:px-6">
          <div className="max-w-3xl mx-auto">
            {messages.length === 1 && !isLoading && (
              <div className="mb-6">
                <QuickActions onAction={handleQuickAction} />
              </div>
            )}

            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} currentStep={currentStep} totalSteps={TOTAL_STEPS} />
            ))}

            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg rounded-tl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-3">
                <p className="font-semibold text-sm">Error</p>
                <p className="text-xs mt-1">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-gray-200 bg-white flex-shrink-0 px-4 py-3 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
