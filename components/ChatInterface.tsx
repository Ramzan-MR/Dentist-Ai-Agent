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

interface BookingData {
  patientName?: string
  service?: string
  date?: string
  time?: string
  phone?: string
  email?: string
}

const BOOKING_STEPS = ['Name', 'Service', 'Date', 'Time', 'Contact', 'Confirmation', 'Complete']
const TOTAL_STEPS = BOOKING_STEPS.length

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Welcome to ${clinicConfig.name}! 👋 I'm here to help you book an appointment or answer any questions. What can I do for you today?`,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingStep, setBookingStep] = useState(0)
  const [bookingData, setBookingData] = useState<BookingData>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }
    setMessages(prev => [...prev, userMessage])
    setError(null)
    setIsLoading(true)

    try {
      // Check if user wants to book an appointment
      const contentLower = content.toLowerCase()
      const isBookingRequest = contentLower.includes('book') || contentLower.includes('appointment') || contentLower.includes('schedule')

      let assistantResponse = ''
      let nextStep = bookingStep

      if (bookingStep === 0 && isBookingRequest) {
        // Start booking process
        nextStep = 1
        assistantResponse = `Great! I'd be happy to help you book an appointment at ${clinicConfig.name}.\n\n📋 Step 1 of ${TOTAL_STEPS}: What is your full name?`
        setBookingStep(1)
      } else if (bookingStep === 1 && content.trim().length > 2) {
        // Collect name
        setBookingData(prev => ({ ...prev, patientName: content.trim() }))
        nextStep = 2
        setBookingStep(2)
        assistantResponse = `Nice to meet you, ${content.trim()}! 👋\n\n📋 Step 2 of ${TOTAL_STEPS}: Which service would you like?\n\n• General Checkup - $60\n• Teeth Cleaning - $85\n• Teeth Whitening - $150\n• Dental Filling - $120\n• Root Canal - $400\n• Tooth Extraction - $150\n• Dental Implants - $1,500\n• Emergency Consultation - $75\n\nJust type the service name.`
      } else if (bookingStep === 2) {
        // Collect service
        const services = ['General Checkup', 'Teeth Cleaning', 'Teeth Whitening', 'Dental Filling', 'Root Canal', 'Tooth Extraction', 'Dental Implants', 'Emergency Consultation']
        const matchedService = services.find(s => content.toLowerCase().includes(s.toLowerCase()))

        if (matchedService) {
          setBookingData(prev => ({ ...prev, service: matchedService }))
          nextStep = 3
          setBookingStep(3)
          assistantResponse = `Perfect! ${matchedService} is a great choice. 🦷\n\n📋 Step 3 of ${TOTAL_STEPS}: What date would you prefer? (e.g., tomorrow, next Monday, or a specific date)`
        } else {
          assistantResponse = `I didn't recognize that service. Please choose from:\n• General Checkup\n• Teeth Cleaning\n• Teeth Whitening\n• Dental Filling\n• Root Canal\n• Tooth Extraction\n• Dental Implants\n• Emergency Consultation`
        }
      } else if (bookingStep === 3) {
        // Collect date
        setBookingData(prev => ({ ...prev, date: content.trim() }))
        nextStep = 4
        setBookingStep(4)
        assistantResponse = `Great! ${content.trim()} works. 📅\n\n📋 Step 4 of ${TOTAL_STEPS}: What time would you prefer? (e.g., 9:00 AM, 2:30 PM, or morning/afternoon)`
      } else if (bookingStep === 4) {
        // Collect time
        setBookingData(prev => ({ ...prev, time: content.trim() }))
        nextStep = 5
        setBookingStep(5)
        assistantResponse = `Excellent! ${content.trim()} is noted. ⏰\n\n📋 Step 5 of ${TOTAL_STEPS}: What's your phone number?`
      } else if (bookingStep === 5) {
        // Collect phone
        setBookingData(prev => ({ ...prev, phone: content.trim() }))
        const isEmail = content.includes('@')

        if (isEmail) {
          setBookingData(prev => ({ ...prev, email: content.trim(), phone: prev.phone || '' }))
          nextStep = 6
          setBookingStep(6)
          assistantResponse = `Perfect! ${content.trim()} is confirmed. ✓\n\n📋 Step 6 of ${TOTAL_STEPS}: Let me confirm your booking details:\n\n👤 Name: ${bookingData.patientName}\n🦷 Service: ${bookingData.service}\n📅 Date: ${bookingData.date}\n⏰ Time: ${bookingData.time}\n📱 Contact: ${content.trim()}\n\nDoes everything look correct? (Reply with "yes" to confirm)`
        } else {
          assistantResponse = `Got it! ${content.trim()} 📱\n\n📋 Step 5b: And your email address please?`
        }
      } else if (bookingStep === 6) {
        // Confirmation
        if (contentLower.includes('yes') || contentLower.includes('correct') || contentLower.includes('confirm')) {
          nextStep = 7
          setBookingStep(7)
          const bookingRef = `BR-${Date.now().toString().slice(-6)}`
          assistantResponse = `🎉 Congratulations! Your appointment has been booked!\n\n✅ Booking Confirmed\nReference #: ${bookingRef}\n\n📋 Step 7 of ${TOTAL_STEPS}: Complete!\n\nDetails:\n👤 Name: ${bookingData.patientName}\n🦷 Service: ${bookingData.service}\n📅 Date: ${bookingData.date}\n⏰ Time: ${bookingData.time}\n📱 Phone: ${bookingData.phone}\n\nWe'll send you a reminder before your appointment. Thank you for choosing ${clinicConfig.name}!`
        } else {
          assistantResponse = `No problem! What would you like to change?`
        }
      } else if (bookingStep === 7) {
        // After completion, offer new booking
        if (contentLower.includes('book') || contentLower.includes('appointment')) {
          setBookingStep(0)
          setBookingData({})
          assistantResponse = `I'd be happy to help you book another appointment! What service would you like?`
        } else {
          assistantResponse = `Is there anything else I can help you with today?`
        }
      } else if (!isBookingRequest && bookingStep === 0) {
        // General inquiry
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content, history: messages }),
        })

        if (!response.ok) throw new Error('API error')
        const data = await response.json()
        assistantResponse = data.response
      } else {
        assistantResponse = `Would you like to book an appointment, or is there something else I can help you with?`
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
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
              {bookingStep > 0 && <p className="text-dental-100 text-xs sm:text-sm mt-1">Step {bookingStep}/{TOTAL_STEPS}</p>}
            </div>
            <div className="text-right">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl">🦷</div>
            </div>
          </div>

          {bookingStep > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Booking Progress</span>
                <span className="text-xs">{bookingStep}/{TOTAL_STEPS}</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(bookingStep / TOTAL_STEPS) * 100}%` }}
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
              <ChatMessage key={msg.id} message={msg} currentStep={bookingStep} totalSteps={TOTAL_STEPS} />
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
