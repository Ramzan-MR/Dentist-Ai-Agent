'use client'

import { useState, useEffect } from 'react'
import { format, parseISO, formatDistanceToNow } from 'date-fns'

interface Message { id: string; role: string; content: string; created_at: string }
interface Customer { name?: string; phone?: string }
interface Conversation {
  id: string; status: string; created_at: string; updated_at: string; external_id?: string
  customers?: Customer; messages?: Message[]
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/conversations?channel=voice&limit=50')
      .then(r => r.json())
      .then(d => setCalls(d.conversations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const callerName = (c: Conversation) => c.customers?.name ?? c.customers?.phone ?? 'Unknown Caller'

  const turnCount = (c: Conversation) => c.messages?.length ?? 0

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Voice Calls</h1>
        <p className="text-gray-500 mt-1">AI phone call logs via Twilio ConversationRelay</p>
      </div>

      {!loading && calls.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">📞 No calls yet — connect Twilio Voice</h3>
          <p className="text-sm text-blue-700 mb-3">Once Twilio is configured, every AI call will appear here with a full transcript.</p>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Add <code className="bg-blue-100 px-1 rounded">TWILIO_ACCOUNT_SID</code>, <code className="bg-blue-100 px-1 rounded">TWILIO_AUTH_TOKEN</code>, <code className="bg-blue-100 px-1 rounded">TWILIO_PHONE_NUMBER</code> to Vercel</li>
            <li>Set incoming call webhook in Twilio → <code className="bg-blue-100 px-1 rounded break-all">…/api/voice/incoming</code></li>
            <li>Railway WebSocket: <code className="bg-blue-100 px-1 rounded break-all">wss://dental-voice-ws-production.up.railway.app/api/voice/ws</code> ✅ already running</li>
          </ol>
          <a href="/admin/settings" className="inline-block mt-3 text-sm font-medium text-blue-800 underline">Go to Settings →</a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Call list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700">Recent Calls ({calls.length})</p>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : calls.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No voice calls recorded</div>
            ) : calls.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full text-left flex items-start gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected?.id === c.id ? 'bg-teal-50' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                  📞
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-0.5">
                    <p className="text-sm font-medium text-gray-900 truncate">{callerName(c)}</p>
                    <p className="text-xs text-gray-400 shrink-0 ml-2">{formatDistanceToNow(parseISO(c.created_at), { addSuffix: true })}</p>
                  </div>
                  <p className="text-xs text-gray-500">{turnCount(c)} message turns</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'completed' ? 'bg-green-100 text-green-700' : c.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.status}
                    </span>
                    {c.external_id && <span className="text-xs text-gray-400 truncate max-w-[100px]">{c.external_id?.slice(0, 12)}…</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Transcript */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            {selected ? (
              <>
                <span className="text-2xl">📞</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{callerName(selected)}</p>
                  <p className="text-xs text-gray-400">{format(parseISO(selected.created_at), 'PPp')}</p>
                </div>
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${selected.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {selected.status}
                </span>
              </>
            ) : (
              <p className="text-sm text-gray-400">Select a call to view transcript</p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto max-h-[560px] p-5">
            {selected ? (
              (selected.messages ?? []).length === 0 ? (
                <p className="text-sm text-center text-gray-400 pt-10">No transcript available</p>
              ) : (
                <div className="space-y-4">
                  {(selected.messages ?? []).map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-teal-100 text-teal-700'}`}>
                        {msg.role === 'user' ? '👤' : '🤖'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-medium text-gray-500">{msg.role === 'user' ? 'Caller' : 'AI Assistant'}</p>
                          <p className="text-xs text-gray-300">{format(parseISO(msg.created_at), 'h:mm:ss a')}</p>
                        </div>
                        <p className="text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-4xl mb-3">📞</p>
                  <p className="text-sm text-gray-400">Select a call to view transcript</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
