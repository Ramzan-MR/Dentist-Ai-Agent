'use client'

interface QuickActionsProps {
  onAction: (action: string) => void
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    { id: 'book', label: '📅 Book an Appointment', icon: '📅' },
    { id: 'check', label: '🔍 Check Availability', icon: '🔍' },
    { id: 'services', label: '🦷 View Services', icon: '🦷' },
    { id: 'reschedule', label: '↻ Reschedule', icon: '↻' },
    { id: 'cancel', label: '❌ Cancel Appointment', icon: '❌' },
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">Quick Actions:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className="text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-dental-600 hover:bg-dental-50 transition-colors text-sm font-medium text-gray-700 hover:text-dental-700"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
