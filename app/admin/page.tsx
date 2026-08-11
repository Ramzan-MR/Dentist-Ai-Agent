'use client'

import { useState, useEffect } from 'react'

interface Stats {
  appointmentsToday: number
  upcomingAppointments: number
  conversationsThisWeek: number
  newLeads: number
  channelBreakdown: { web: number; whatsapp: number; voice: number }
}

const statCards = (s: Stats) => [
  { label: "Today's Appointments", value: s.appointmentsToday, icon: '📅', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { label: 'Upcoming Appointments', value: s.upcomingAppointments, icon: '📋', color: 'bg-teal-50 text-teal-700 border-teal-100' },
  { label: 'Conversations This Week', value: s.conversationsThisWeek, icon: '💬', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  { label: 'New Leads', value: s.newLeads, icon: '👥', color: 'bg-amber-50 text-amber-700 border-amber-100' },
]

const channelInfo = [
  { key: 'web', label: 'Web Chat', icon: '🌐', desc: 'Live on your website' },
  { key: 'whatsapp', label: 'WhatsApp', icon: '💬', desc: 'Twilio WhatsApp Business' },
  { key: 'voice', label: 'Voice Calls', icon: '📞', desc: 'AI phone via Twilio ConversationRelay' },
]

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const s: Stats = stats ?? { appointmentsToday: 0, upcomingAppointments: 0, conversationsThisWeek: 0, newLeads: 0, channelBreakdown: { web: 0, whatsapp: 0, voice: 0 } }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">All channels, one AI brain.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards(s).map(({ label, value, icon, color }) => (
          <div key={label} className={`rounded-xl border p-5 ${color}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{icon}</span>
              {loading && <div className="w-8 h-4 bg-current opacity-20 rounded animate-pulse" />}
            </div>
            <p className="text-3xl font-bold">{loading ? '—' : value}</p>
            <p className="text-sm font-medium mt-1 opacity-80">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Channel Activity (7 days)</h2>
          <div className="space-y-4">
            {channelInfo.map(({ key, label, icon, desc }) => {
              const count = s.channelBreakdown[key as keyof typeof s.channelBreakdown]
              const max = Math.max(...Object.values(s.channelBreakdown), 1)
              const pct = Math.round((count / max) * 100)
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { href: '/admin/calendar', icon: '📅', label: 'Manage Appointments', sub: 'View & update calendar' },
              { href: '/admin/whatsapp', icon: '💬', label: 'WhatsApp Conversations', sub: 'See all WhatsApp threads' },
              { href: '/admin/calls', icon: '📞', label: 'Voice Call Logs', sub: 'Review AI call transcripts' },
              { href: '/admin/leads', icon: '👥', label: 'Manage Leads', sub: 'Follow up with captured leads' },
              { href: '/admin/settings', icon: '⚙️', label: 'Channel Settings', sub: 'Configure Twilio & webhooks' },
            ].map(({ href, icon, label, sub }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-teal-50 transition-colors group"
              >
                <span className="text-xl">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-teal-700">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
                <span className="text-gray-300 group-hover:text-teal-400">→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
