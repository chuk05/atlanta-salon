'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'

interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: string
  service: {
    name: string
    duration: number
    price: number
  }
  customer: {
    profile?: {
      full_name: string
      phone: string
    }
  }
  notes: string | null
}

export default function StaffSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    fetchAppointments()
  }, [selectedDate])

  const fetchAppointments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setLoading(false)
        return
      }

      // Get staff ID for the current user
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (staffError) throw staffError

      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(name, duration, price),
          customer:profiles!appointments_customer_id_fkey(full_name, phone)
        `)
        .eq('staff_id', staffData.id)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .in('status', ['confirmed', 'pending'])
        .order('start_time', { ascending: true })

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

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEE, MMM d')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-8">Loading your schedule...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Mobile-friendly header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Schedule</h1>
        
        {/* Date selector */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[-2, -1, 0, 1, 2, 3, 4].map((offset) => {
            const date = new Date()
            date.setDate(date.getDate() + offset)
            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            
            return (
              <button
                key={offset}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${
                  isSelected
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <div>{format(date, 'EEE')}</div>
                <div>{format(date, 'd')}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Appointments list */}
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">No appointments for {getDateLabel(selectedDate)}</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {appointment.customer.profile?.full_name || 'Customer'}
                  </h3>
                  <p className="text-sm text-gray-600">{appointment.service.name}</p>
                  <p className="text-xs text-gray-500">
                    {format(parseISO(appointment.start_time), 'h:mm a')} -{' '}
                    {format(parseISO(appointment.end_time), 'h:mm a')}
                  </p>
                  {appointment.customer.profile?.phone && (
                    <p className="text-xs text-blue-600 mt-1">
                      📞 {appointment.customer.profile.phone}
                    </p>
                  )}
                  {appointment.notes && (
                    <p className="text-xs text-gray-500 mt-1">📝 {appointment.notes}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 mt-3">
                {appointment.status === 'confirmed' && (
                  <button
                    onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-medium"
                  >
                    Mark Complete
                  </button>
                )}
                <button
                  onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                  className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick stats */}
      <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
        <h3 className="font-semibold text-gray-900 mb-3">Today's Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-pink-600">{appointments.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter(a => a.status === 'confirmed').length}
            </div>
            <div className="text-xs text-gray-500">Confirmed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter(a => a.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>
      </div>
    </div>
  )
}