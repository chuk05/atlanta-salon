'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'

interface WorkingHours {
  id: string
  staff_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

interface Staff {
  id: string
  profile?: {
    full_name: string
  }
}

const daysOfWeek = [
  { id: 0, name: 'Sunday' },
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
]

function StaffScheduleContent() {
  const searchParams = useSearchParams()
  const staffId = searchParams.get('id')
  
  const [staff, setStaff] = useState<Staff | null>(null)
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (staffId) {
      fetchStaffAndSchedule()
    }
  }, [staffId])

  const fetchStaffAndSchedule = async () => {
    try {
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
        .order('day_of_week')

      if (hoursError) throw hoursError
      setWorkingHours(hoursData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateWorkingHours = async (dayOfWeek: number, startTime: string, endTime: string, isActive: boolean) => {
    try {
      const existingHours = workingHours.find(h => h.day_of_week === dayOfWeek)
      
      if (existingHours) {
        // Update existing hours
        const { error } = await supabase
          .from('working_hours')
          .update({
            start_time: startTime,
            end_time: endTime,
            is_active: isActive
          })
          .eq('id', existingHours.id)

        if (error) throw error
      } else {
        // Create new hours
        const { error } = await supabase
          .from('working_hours')
          .insert({
            staff_id: staffId!,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            is_active: isActive
          })

        if (error) throw error
      }

      // Refresh data
      fetchStaffAndSchedule()
    } catch (error) {
      console.error('Error updating working hours:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">Loading schedule...</div>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">Staff member not found.</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Schedule for {staff.profile?.full_name}
        </h1>
        <p className="text-gray-600">Set working hours for each day of the week</p>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {daysOfWeek.map((day) => {
            const dayHours = workingHours.find(h => h.day_of_week === day.id)
            const isActive = dayHours?.is_active ?? false
            const startTime = dayHours?.start_time || '09:00'
            const endTime = dayHours?.end_time || '17:00'

            return (
              <div key={day.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => updateWorkingHours(day.id, startTime, endTime, e.target.checked)}
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-900 min-w-24">
                      {day.name}
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">From:</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => updateWorkingHours(day.id, e.target.value, endTime, isActive)}
                        disabled={!isActive}
                        className="border border-gray-300 rounded px-3 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">To:</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => updateWorkingHours(day.id, startTime, e.target.value, isActive)}
                        disabled={!isActive}
                        className="border border-gray-300 rounded px-3 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <a 
          href="/admin/staff"
          className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
        >
          Back to Staff
        </a>
        <a 
          href="/admin"
          className="bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-700 transition duration-200"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  )
}

export default function StaffSchedule() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">Loading...</div>
      </div>
    }>
      <StaffScheduleContent />
    </Suspense>
  )
}