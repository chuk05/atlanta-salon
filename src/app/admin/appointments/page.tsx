'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: string
  service: {
    name: string
    price: number
  }
  staff: {
    profile?: {
      full_name: string
    }
  }
  customer: {
    profile?: {
      full_name: string
      email: string
      phone: string
    }
  }
}

export default function AppointmentsManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, past, cancelled

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          service:services(name, price),
          staff:staff(profile:profiles(full_name)),
          customer:profiles!appointments_customer_id_fkey(full_name, email, phone)
        `)
        .order('start_time', { ascending: false })

      // Apply filters
      const now = new Date().toISOString()
      if (filter === 'upcoming') {
        query = query.gte('start_time', now).in('status', ['confirmed', 'pending'])
      } else if (filter === 'past') {
        query = query.lt('start_time', now).in('status', ['completed', 'cancelled', 'no-show'])
      } else if (filter === 'cancelled') {
        query = query.eq('status', 'cancelled')
      } else if (filter === 'confirmed') {
        query = query.eq('status', 'confirmed')
      }

      const { data, error } = await query

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)

      if (error) throw error
      fetchAppointments() // Refresh the list
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('Error updating appointment. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">Loading appointments...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Appointments Management</h1>
        <p className="text-gray-600">Manage all salon appointments</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex space-x-4">
          {[
            { value: 'all', label: 'All Appointments' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'past', label: 'Past' },
            { value: 'cancelled', label: 'Cancelled' }
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === filterOption.value
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer & Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.customer.profile?.full_name || 'Customer'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.customer.profile?.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.customer.profile?.phone}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {appointment.service.name} - ${appointment.service.price}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {appointment.staff.profile?.full_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(appointment.start_time), 'MMM d, yyyy')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(appointment.start_time), 'h:mm a')} -{' '}
                    {format(new Date(appointment.end_time), 'h:mm a')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : appointment.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {appointment.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                    <span className="text-gray-400">No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {appointments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No appointments found.</p>
          </div>
        )}
      </div>
    </div>
  )
}