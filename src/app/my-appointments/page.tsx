'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import Link from 'next/link'

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
  staff: {
    profile?: {
      full_name: string
    }
  }
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(name, duration, price),
          staff:staff(profile:profiles(full_name))
        `)
        .eq('customer_id', session.user.id)
        .order('start_time', { ascending: true })

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)

      if (error) throw error
      fetchAppointments() // Refresh the list
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Error cancelling appointment. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading your appointments...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Appointments</h1>
          <p className="text-xl text-gray-600">
            Manage your upcoming and past appointments
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center bg-white rounded-lg shadow-md p-12">
            <p className="text-gray-500 mb-6">You don't have any appointments yet.</p>
            <Link
              href="/booking"
              className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition duration-200"
            >
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {appointment.service.name}
                    </h3>
                    <p className="text-gray-600">
                      with {appointment.staff.profile?.full_name}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {format(new Date(appointment.start_time), 'EEEE, MMMM d, yyyy')} at{' '}
                      {format(new Date(appointment.start_time), 'h:mm a')}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {appointment.service.duration} minutes • ${appointment.service.price}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    
                    {appointment.status === 'confirmed' && 
                     new Date(appointment.start_time) > new Date() && (
                      <button
                        onClick={() => cancelAppointment(appointment.id)}
                        className="block mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/booking"
            className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition duration-200"
          >
            Book New Appointment
          </Link>
        </div>
      </div>
    </div>
  )
}