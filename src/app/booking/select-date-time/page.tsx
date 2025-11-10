'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation'
import { format, addDays, isToday, isTomorrow, parseISO, isAfter, setHours, setMinutes } from 'date-fns'

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

interface Staff {
  id: string
  profile?: {
    full_name: string
  }
}

interface WorkingHours {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

interface Appointment {
  start_time: string
  end_time: string
}

function SelectDateTimeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const serviceId = searchParams.get('serviceId')
  const staffId = searchParams.get('staffId')
  
  const [service, setService] = useState<Service | null>(null)
  const [staff, setStaff] = useState<Staff | null>(null)
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (serviceId && staffId) {
      fetchData()
    }
  }, [serviceId, staffId])

  useEffect(() => {
    if (service && staff && workingHours.length > 0) {
      generateAvailableSlots()
    }
  }, [selectedDate, service, staff, workingHours, appointments])

  const fetchData = async () => {
    try {
      // Fetch service details
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single()

      if (serviceError) throw serviceError
      setService(serviceData)

      // Fetch staff details
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select(`
          *,
          profile:profiles(full_name)
        `)
        .eq('id', staffId)
        .single()

      if (staffError) throw staffError
      setStaff(staffData)

      // Fetch working hours
      const { data: hoursData, error: hoursError } = await supabase
        .from('working_hours')
        .select('*')
        .eq('staff_id', staffId)
        .eq('is_active', true)

      if (hoursError) throw hoursError
      setWorkingHours(hoursData || [])

      // Fetch existing appointments for the next 7 days
      const startDate = new Date()
      const endDate = addDays(startDate, 7)
      
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('staff_id', staffId)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .in('status', ['confirmed', 'pending'])

      if (appointmentsError) throw appointmentsError
      setAppointments(appointmentsData || [])

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAvailableSlots = () => {
    if (!service) return

    const dayOfWeek = selectedDate.getDay()
    const dayHours = workingHours.find(h => h.day_of_week === dayOfWeek)
    
    if (!dayHours || !dayHours.is_active) {
      setAvailableSlots([])
      return
    }

    const slots: string[] = []
    const [startHour, startMinute] = dayHours.start_time.split(':').map(Number)
    const [endHour, endMinute] = dayHours.end_time.split(':').map(Number)

    const startTime = setMinutes(setHours(selectedDate, startHour), startMinute)
    const endTime = setMinutes(setHours(selectedDate, endHour), endMinute)

    let currentTime = startTime

    while (isAfter(endTime, currentTime)) {
      const slotEnd = new Date(currentTime.getTime() + service.duration * 60000)
      
      // Check if slot doesn't go beyond working hours
      if (slotEnd <= endTime) {
        // Check if slot doesn't conflict with existing appointments
        const slotConflicts = appointments.some(appointment => {
          const apptStart = parseISO(appointment.start_time)
          const apptEnd = parseISO(appointment.end_time)
          return (currentTime < apptEnd && slotEnd > apptStart)
        })

        if (!slotConflicts && isAfter(currentTime, new Date())) {
          slots.push(currentTime.toISOString())
        }
      }

      // Move to next slot (30-minute intervals)
      currentTime = new Date(currentTime.getTime() + 30 * 60000)
    }

    setAvailableSlots(slots)
  }

  const handleBooking = async () => {
    if (!selectedTime || !service || !staff) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/signin?redirect=' + encodeURIComponent(window.location.href))
        return
      }

      const startTime = new Date(selectedTime)
      const endTime = new Date(startTime.getTime() + service.duration * 60000)

      const { error } = await supabase
        .from('appointments')
        .insert({
          customer_id: session.user.id,
          staff_id: staffId,
          service_id: serviceId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'confirmed'
        })

      if (error) throw error

      router.push('/booking/confirmation?appointment=' + encodeURIComponent(selectedTime))
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('Error creating appointment. Please try again.')
    }
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEE, MMM d')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          Loading...
        </div>
      </div>
    )
  }

  if (!service || !staff) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          Service or staff not found.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Select Date & Time</h1>
          <p className="text-xl text-gray-600 mb-2">
            {service.name} with {staff.profile?.full_name}
          </p>
          <p className="text-gray-500">
            {service.duration} minutes • ${service.price}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-6">
            {Array.from({ length: 7 }).map((_, index) => {
              const date = addDays(new Date(), index)
              const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
              const dayHours = workingHours.find(h => h.day_of_week === date.getDay())
              const isAvailable = dayHours?.is_active

              return (
                <button
                  key={index}
                  onClick={() => isAvailable && setSelectedDate(date)}
                  disabled={!isAvailable}
                  className={`p-3 rounded-lg text-center ${
                    isSelected
                      ? 'bg-pink-600 text-white'
                      : isAvailable
                      ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="text-sm font-medium">{format(date, 'EEE')}</div>
                  <div className="text-lg font-semibold">{format(date, 'd')}</div>
                  <div className="text-xs">{getDateLabel(date)}</div>
                </button>
              )
            })}
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Times</h2>
          
          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(selectedTime === slot ? '' : slot)}
                  className={`p-3 rounded-lg text-center border-2 transition duration-200 ${
                    selectedTime === slot
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-pink-300'
                  }`}
                >
                  {format(new Date(slot), 'h:mm a')}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No available time slots for this date.
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
          >
            Back to Stylist
          </button>
          <button
            onClick={handleBooking}
            disabled={!selectedTime}
            className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SelectDateTime() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          Loading...
        </div>
      </div>
    }>
      <SelectDateTimeContent />
    </Suspense>
  )
}