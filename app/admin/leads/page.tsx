'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'

interface Lead {
  id: string; name: string; phone?: string; email?: string; service?: string
  intent?: string; preferred_time?: string; notes?: string; channel: string
  status: string; created_at: string
}

const CHANNEL_ICON: Record<string, string> = { web: '🌐', whatsapp: '💬', voice: '📞' }
const STATUS_COLOR: Record<string, string> = {
  new: 'bg-amber-100 text-amber-700',
  contacted: 'bg-blue-100 text-blue-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterChannel, setFilterChannel] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Lead | null>(null)

  useEffect(() => {
    fetch('/api/admin/leads?limit=100')
      .then(r => r.json())
      .then(d => setLeads(d.leads ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev)
  }

  const filtered = leads.filter(l => {
    const ms = filterStatus === 'all' || l.status === filterStatus
    const mc = filterChannel === 'all' || l.channel === filterChannel
    return ms && mc
  })

  const stats = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    total: leads.length,
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-500 mt-1">Captured from web, WhatsApp & voice channels</p>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Leads', value: stats.total, color: 'border-gray-200' },
          { label: 'New', value: stats.new, color: 'border-amber-200 bg-amber-50' },
          { label: 'Contacted', value: stats.contacted, color: 'border-blue-200 bg-blue-50' },
          { label: 'Converted', value: stats.converted, color: 'border-green-200 bg-green-50' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-white rounded-xl border ${color} p-4`}>
            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <span className="text-xs text-gray-500 self-center">Status:</span>
          {['all','new','contacted','converted','lost'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-gray-500 self-center">Channel:</span>
          {['all','web','whatsapp','voice'].map(c => (
            <button
              key={c}
              onClick={() => setFilterChannel(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterChannel === c ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {CHANNEL_ICON[c] ?? ''} {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-3xl mb-3">👥</p>
            <p className="text-gray-500 text-sm">No leads yet. They appear here when the AI captures contact info from any channel.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name','Service','Contact','Channel','Status','Date','Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold shrink-0">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{lead.service ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-gray-700">{lead.phone ?? '—'}</p>
                      <p className="text-xs text-gray-400">{lead.email ?? ''}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm">{CHANNEL_ICON[lead.channel] ?? '?'} <span className="text-xs text-gray-500">{lead.channel}</span></span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[lead.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {format(parseISO(lead.created_at), 'MMM d')}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelected(lead)}
                        className="text-teal-600 hover:text-teal-700 text-xs font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-400">{CHANNEL_ICON[selected.channel]} via {selected.channel}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-5">
              {[
                ['Phone', selected.phone],
                ['Email', selected.email],
                ['Service', selected.service],
                ['Preferred Time', selected.preferred_time],
                ['Intent', selected.intent],
                ['Date', format(parseISO(selected.created_at), 'PPp')],
              ].map(([k, v]) => v ? (
                <div key={k}>
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="font-medium text-gray-800">{v}</p>
                </div>
              ) : null)}
            </div>
            {selected.notes && (
              <div className="mb-5 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">{selected.notes}</div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-2">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                {['new','contacted','converted','lost'].map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selected.status === s ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
