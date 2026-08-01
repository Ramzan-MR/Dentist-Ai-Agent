'use client'

import { useState, useEffect } from 'react'
import { Appointment } from '@/lib/types'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchField, setSearchField] = useState<'patient_name' | 'phone' | 'email'>('patient_name')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // In a real app, this would fetch from an admin API
      // For now, we'll show a placeholder message
      setAppointments([])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load appointments'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadAppointments()
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/appointments/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, field: searchField }),
      })

      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/appointments/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId, status: newStatus }),
      })

      if (!response.ok) throw new Error('Update failed')
      loadAppointments()
      setSelectedAppointment(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filterStatus === 'all') return true
    return apt.status === filterStatus
  })

  const stats = {
    today: appointments.filter(a => a.appointment_date === format(new Date(), 'yyyy-MM-dd')).length,
    upcoming: appointments.filter(a => new Date(a.appointment_date) > new Date() && a.status !== 'cancelled').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-dental-600 to-dental-700 text-white p-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-dental-100">Manage dental appointments</p>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Today's Appointments", value: stats.today },
            { label: 'Upcoming Appointments', value: stats.upcoming },
            { label: 'Pending Appointments', value: stats.pending },
            { label: 'Cancelled Appointments', value: stats.cancelled },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-dental-600">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Search Appointments</h2>
          <div className="flex gap-2 mb-4">
            <select
              value={searchField}
              onChange={e => setSearchField(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="patient_name">Patient Name</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-dental-600 text-white rounded-lg hover:bg-dental-700"
            >
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {['all', 'confirmed', 'pending', 'cancelled', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-dental-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading appointments...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No appointments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Patient</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(apt => (
                    <tr key={apt.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{apt.patient_name}</td>
                      <td className="px-6 py-4 text-sm">{apt.service}</td>
                      <td className="px-6 py-4 text-sm">
                        {format(new Date(apt.appointment_date), 'MMM dd, yyyy')} at {apt.start_time}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>{apt.phone}</div>
                        <div className="text-gray-500 text-xs">{apt.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            apt.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : apt.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : apt.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className="text-dental-600 hover:text-dental-700 font-medium"
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
      </div>

      {/* Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-dental-600 to-dental-700 text-white p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">Appointment Details</h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-white hover:text-dental-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Patient Name</p>
                  <p className="font-semibold">{selectedAppointment.patient_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="font-semibold">{selectedAppointment.booking_reference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{selectedAppointment.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{selectedAppointment.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-semibold">{selectedAppointment.service}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold">
                    {format(new Date(selectedAppointment.appointment_date), 'MMM dd, yyyy')} at{' '}
                    {selectedAppointment.start_time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Patient Type</p>
                  <p className="font-semibold capitalize">{selectedAppointment.patient_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Urgency</p>
                  <p className="font-semibold capitalize">{selectedAppointment.urgency}</p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="bg-gray-50 p-3 rounded">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="border-t pt-6">
                <p className="text-sm text-gray-600 mb-3">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {['pending', 'confirmed', 'completed', 'no_show', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedAppointment.id, status)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedAppointment.status === status
                          ? 'bg-dental-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
