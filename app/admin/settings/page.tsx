'use client'

import { useState, useEffect } from 'react'

interface ConfigCheck {
  checks: {
    anthropic_api_key: boolean
    supabase_url: boolean
    supabase_anon_key: boolean
    supabase_service_role: boolean
    google_calendar: boolean
    twilio_voice: boolean
    twilio_whatsapp: boolean
    voice_ws_url: string | false
    outbound_secret: boolean
  }
  warnings: string[]
}

const WEBHOOK_BASE = 'https://dentist-ai-agent-ram-ai.vercel.app'
const WS_URL = 'wss://dental-voice-ws-production.up.railway.app/api/voice/ws'

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {ok ? '✓ Connected' : '✗ Not set'}
    </span>
  )
}

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-gray-700 break-all">{value}</code>
        <button onClick={copy} className="shrink-0 px-3 py-2 text-xs font-medium bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors">
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigCheck | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/config-check')
      .then(r => r.json())
      .then(d => setConfig(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const c = config?.checks

  const sections = [
    {
      title: 'Core Services',
      icon: '🔑',
      rows: [
        { label: 'Anthropic Claude API', ok: c?.anthropic_api_key },
        { label: 'Supabase Database URL', ok: c?.supabase_url },
        { label: 'Supabase Anon Key', ok: c?.supabase_anon_key },
        { label: 'Supabase Service Role Key', ok: c?.supabase_service_role },
        { label: 'Google Calendar', ok: c?.google_calendar },
      ],
    },
    {
      title: 'Twilio — Voice',
      icon: '📞',
      rows: [
        { label: 'Twilio Voice (Account SID / Auth Token / Phone Number)', ok: c?.twilio_voice },
        { label: 'Railway WebSocket Server', ok: !!(c?.voice_ws_url) },
        { label: 'Outbound Call Secret', ok: c?.outbound_secret },
      ],
    },
    {
      title: 'Twilio — WhatsApp',
      icon: '💬',
      rows: [
        { label: 'WhatsApp Number configured', ok: c?.twilio_whatsapp },
      ],
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings & Channels</h1>
          <p className="text-gray-500 mt-1">Integration status and webhook configuration</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetch('/api/config-check').then(r => r.json()).then(setConfig).finally(() => setLoading(false)) }}
          className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Refresh Status
        </button>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {sections.map(({ title, icon, rows }) => (
          <div key={title} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{icon}</span>
              <h2 className="font-semibold text-gray-800">{title}</h2>
            </div>
            <div className="space-y-3">
              {rows.map(({ label, ok }) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <p className="text-xs text-gray-600 leading-snug flex-1">{label}</p>
                  {loading ? <span className="w-16 h-4 bg-gray-100 rounded animate-pulse" /> : <StatusBadge ok={!!ok} />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {config?.warnings && config.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <h3 className="font-semibold text-amber-800 mb-3">⚠️ Configuration Warnings</h3>
          <ul className="space-y-1">
            {config.warnings.map((w, i) => (
              <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="mt-0.5">•</span> {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Setup instructions */}
      <div className="space-y-6">
        {/* Voice setup */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">📞 Twilio Voice Setup</h2>
          <p className="text-sm text-gray-500 mb-5">Configure AI phone calling with ConversationRelay</p>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 mb-3">Step 1 — Add to Vercel environment variables:</p>
              <div className="space-y-2 font-mono text-xs text-gray-700">
                <p>TWILIO_ACCOUNT_SID = <span className="text-gray-400">ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</span></p>
                <p>TWILIO_AUTH_TOKEN = <span className="text-gray-400">your_auth_token</span></p>
                <p>TWILIO_PHONE_NUMBER = <span className="text-gray-400">+12025551234</span></p>
              </div>
            </div>
            <CopyField value={`${WEBHOOK_BASE}/api/voice/incoming`} label="Step 2 — Twilio phone number → Voice & Fax → Incoming Call (Webhook)" />
            <CopyField value={`${WEBHOOK_BASE}/api/voice/status`} label="Step 3 — Twilio phone number → Call Status Callback (optional)" />
            <CopyField value={WS_URL} label="Step 4 — Railway WebSocket URL (used internally by voice/incoming)" />
          </div>
        </div>

        {/* WhatsApp setup */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">💬 WhatsApp Setup</h2>
          <p className="text-sm text-gray-500 mb-5">Connect Twilio WhatsApp Business / Sandbox</p>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 mb-3">Step 1 — Add to Vercel environment variables:</p>
              <div className="space-y-2 font-mono text-xs text-gray-700">
                <p>TWILIO_WHATSAPP_NUMBER = <span className="text-gray-400">whatsapp:+14155238886</span></p>
              </div>
            </div>
            <CopyField value={`${WEBHOOK_BASE}/api/whatsapp/webhook`} label="Step 2 — Twilio WhatsApp Sandbox / Sender → When a message comes in (Webhook)" />
            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <strong>Sandbox:</strong> Go to Twilio Console → Messaging → Try it out → Send a WhatsApp Message → Sandbox settings → paste the webhook URL above.
            </div>
          </div>
        </div>

        {/* Web chat embed */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">🌐 Web Chat</h2>
          <p className="text-sm text-gray-500 mb-4">Embed the AI chat on any website</p>
          <CopyField
            label="Embed URL — open in an iframe or link patients directly"
            value={WEBHOOK_BASE}
          />
          <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <strong>Iframe embed:</strong>
            <code className="block mt-1 text-xs text-gray-500 break-all">{`<iframe src="${WEBHOOK_BASE}" width="400" height="600" frameborder="0"></iframe>`}</code>
          </div>
        </div>

        {/* Outbound calls */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">🔒 Outbound AI Calls (Protected)</h2>
          <p className="text-sm text-gray-500 mb-4">Initiate an AI call to a patient — requires your secret header</p>
          <div className="bg-gray-900 rounded-lg p-4">
            <code className="text-xs text-green-400 block">
              {`curl -X POST ${WEBHOOK_BASE}/api/voice/outbound \\`}<br />
              {`  -H "Content-Type: application/json" \\`}<br />
              {`  -H "x-outbound-secret: YOUR_OUTBOUND_CALL_SECRET" \\`}<br />
              {`  -d '{"to":"+12025551234"}'`}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
