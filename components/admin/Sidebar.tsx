'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/calendar', label: 'Calendar', icon: '📅' },
  { href: '/admin/whatsapp', label: 'WhatsApp', icon: '💬' },
  { href: '/admin/calls', label: 'Voice Calls', icon: '📞' },
  { href: '/admin/leads', label: 'Leads', icon: '👥' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-teal-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-teal-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-xl">🦷</div>
          <div>
            <p className="font-bold text-sm leading-tight">Dental Admin</p>
            <p className="text-teal-300 text-xs">AI Omnichannel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-teal-700 text-white'
                  : 'text-teal-200 hover:bg-teal-800 hover:text-white'
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom links */}
      <div className="px-3 py-4 border-t border-teal-700 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-teal-300 hover:bg-teal-800 hover:text-white transition-colors"
        >
          <span>🌐</span> View Chat Widget
        </Link>
        <a
          href="/api/config-check"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-teal-300 hover:bg-teal-800 hover:text-white transition-colors"
        >
          <span>🔍</span> System Health
        </a>
      </div>
    </aside>
  )
}
