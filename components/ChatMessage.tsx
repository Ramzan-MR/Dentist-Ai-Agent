'use client'

import ReactMarkdown from 'react-markdown'

interface ChatMessageProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
  }
  currentStep?: number
  totalSteps?: number
}

export default function ChatMessage({ message, currentStep = 0, totalSteps = 7 }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  // Extract and clean content to remove markdown-like formatting
  const cleanedContent = message.content.replace(/\*\*/g, '')

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`px-4 py-3 rounded-lg max-w-2xl ${
          isUser
            ? 'bg-dental-600 text-white rounded-tr-none'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="text-sm text-left">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                }}
              >
                {cleanedContent}
              </ReactMarkdown>
            </div>

            {currentStep > 0 && totalSteps > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="mb-2 flex justify-between items-center">
                  <strong className="text-xs text-gray-700">Booking Progress</strong>
                  <span className="text-xs text-gray-600 font-medium">{currentStep}/{totalSteps}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-dental-500 to-dental-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
