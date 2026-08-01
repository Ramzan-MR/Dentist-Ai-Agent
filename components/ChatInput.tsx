'use client'

import { useState } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input)
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type your message..."
        disabled={isLoading}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-600 disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="px-6 py-2 bg-dental-600 text-white rounded-lg hover:bg-dental-700 disabled:bg-gray-400 transition-colors font-medium"
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>
  )
}
