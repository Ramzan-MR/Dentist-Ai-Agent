'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'

interface Message { id: string; role: string; content: string; created_at: string }
interface Customer { id: string; name?: string; phone?: string; whatsapp_id?: string }
interface Conversation {
  id: string; channel: string; status: string; created_at: string; updated_at: string
  customers?: Customer; messages?: Message[]
}

export default function WhatsAppPage() {
  const [convs, setConvs] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/conversations?channel=whatsapp&limit=50')
      .then(r => r.json())
      .then(d => setConvs(d.conversations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const customerName = (c: Conversation) =>
    c.customers?.name ?? c.customers?.whatsapp_id ?? c.customers?.phone ?? 'Unknown'

  const lastMsg = (c: Conversation) =>
    c.messages?.slice(-1)[0]?.content?.slice(0, 80) ?? 'No messages'

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp</h1>
          <p className="text-gray-500 mt-1">Conversations via Twilio WhatsApp</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          WhatsApp Active
        </div>
      </div>

      {/* Setup banner if no conversations */}
      {!loading && convs.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-amber-800 mb-2">⚡ Connect WhatsApp to see conversations</h3>
          <p className="text-sm text-amber-700 mb-3">Add your Twilio WhatsApp credentials to start receiving messages.</p>
          <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
            <li>Get a Twilio WhatsApp Sandbox or Business number</li>
            <li>Set <code className="bg-amber-100 px-1 rounded">TWILIO_ACCOUNT_SID</code>, <code className="bg-amber-100 px-1 rounded">TWILIO_AUTH_TOKEN</code>, <code className="bg-amber-100 px-1 rounded">TWILIO_WHATSAPP_NUMBER</code> in Vercel</li>
            <li>Point Twilio WhatsApp webhook → <code className="bg-amber-100 px-1 rounded break-all">https://dentist-ai-agent-ram-ai.vercel.app/api/whatsapp/webhook</code></li>
          </ol>
          <a href="/admin/settings" className="inline-block mt-3 text-sm font-medium text-amber-800 underline">Go to Settings →</a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversation list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Conversations ({convs.length})</p>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : convs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No WhatsApp conversations yet</div>
            ) : convs.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full text-left flex items-start gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected?.id === c.id ? 'bg-teal-50' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shrink-0 mt-0.5">
                  {customerName(c).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium text-gray-900 truncate">{customerName(c)}</p>
                    <p className="text-xs text-gray-400 shrink-0 ml-2">{format(parseISO(c.updated_at), 'MMM d')}</p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{lastMsg(c)}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message thread */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            {selected ? (
              <>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                  {customerName(selected).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{customerName(selected)}</p>
                  <p className="text-xs text-gray-400">{selected.customers?.whatsapp_id ?? selected.customers?.phone}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">Select a conversation</p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto max-h-[540px] p-4 space-y-3 bg-gray-50">
            {selected ? (
              (selected.messages ?? []).length === 0 ? (
                <p className="text-sm text-center text-gray-400 pt-10">No messages in this conversation</p>
              ) : (
                (selected.messages ?? []).map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                        : 'bg-teal-600 text-white rounded-tr-none'
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-gray-400' : 'text-teal-200'}`}>
                        {format(parseISO(msg.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-sm text-gray-400">Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
