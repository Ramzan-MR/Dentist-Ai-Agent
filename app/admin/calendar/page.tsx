'use client'

import { useState, useEffect } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { Appointment } from '@/lib/types'

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-600',
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMonth, setViewMonth] = useState(new Date())
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetch('/api/admin/appointments/list')
      .then(r => r.json())
      .then(d => setAppointments(d.appointments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const days = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) })
  const startWeekday = startOfMonth(viewMonth).getDay()

  const getAptsForDay = (day: Date) =>
    appointments.filter(a => isSameDay(parseISO(a.appointment_date), day))

  const filtered = appointments.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus
    const q = searchQuery.toLowerCase()
    const matchQ = !q || a.patient_name?.toLowerCase().includes(q) || a.phone?.toLowerCase().includes(q) || a.service?.toLowerCase().includes(q)
    return matchStatus && matchQ
  })

  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    await fetch('/api/admin/appointments/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointment_id: id, status }),
    })
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev)
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-500 mt-1">All appointments across channels</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-1 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setViewMonth(m => subMonths(m, 1))} className="p-1 hover:bg-gray-100 rounded">‹</button>
            <span className="font-semibold text-gray-800">{format(viewMonth, 'MMMM yyyy')}</span>
            <button onClick={() => setViewMonth(m => addMonths(m, 1))} className="p-1 hover:bg-gray-100 rounded">›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startWeekday }).map((_, i) => <div key={`e-${i}`} />)}
            {days.map(day => {
              const apts = getAptsForDay(day)
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setViewMonth(day)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-colors relative
                    ${isToday(day) ? 'bg-teal-600 text-white font-bold' : 'hover:bg-gray-50 text-gray-700'}
                  `}
                >
                  {format(day, 'd')}
                  {apts.length > 0 && (
                    <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isToday(day) ? 'bg-white' : 'bg-teal-500'}`} />
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs font-medium text-gray-500 mb-2">Status Legend</p>
            <div className="space-y-1">
              {Object.entries(STATUS_COLORS).map(([s, cls]) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-100">
            <div className="flex gap-3 mb-3">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone or service..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all','confirmed','pending','completed','cancelled','no_show'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {s.replace('_',' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[540px]">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No appointments found</div>
            ) : filtered.map(apt => (
              <div
                key={apt.id}
                onClick={() => setSelected(apt)}
                className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm shrink-0">
                  {apt.patient_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{apt.patient_name}</p>
                  <p className="text-xs text-gray-500 truncate">{apt.service}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-700 font-medium">{format(parseISO(apt.appointment_date), 'MMM d')}</p>
                  <p className="text-xs text-gray-500">{apt.start_time}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_COLORS[apt.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Appointment Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-5">
              {[
                ['Patient', selected.patient_name],
                ['Ref #', selected.booking_reference],
                ['Service', selected.service],
                ['Date', `${format(parseISO(selected.appointment_date), 'MMM d, yyyy')} at ${selected.start_time}`],
                ['Phone', selected.phone],
                ['Email', selected.email],
                ['Type', selected.patient_type],
                ['Urgency', selected.urgency],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-gray-400 text-xs">{k}</p>
                  <p className="font-medium text-gray-800">{v || '—'}</p>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div className="mb-5 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">{selected.notes}</div>
            )}
            <div className="flex flex-wrap gap-2">
              {(['pending','confirmed','completed','no_show','cancelled'] as Appointment['status'][]).map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(selected.id, s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selected.status === s ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {s.replace('_',' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
