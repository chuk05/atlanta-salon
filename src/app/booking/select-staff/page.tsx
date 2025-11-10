'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams, useRouter } from 'next/navigation'

interface Staff {
  id: string
  user_id: string
  bio: string | null
  specialization: string | null
  is_active: boolean
  full_name?: string
  email?: string
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

function SelectStaffContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const serviceId = searchParams.get('serviceId')
  
  const [service, setService] = useState<Service | null>(null)
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState<string>('')

  useEffect(() => {
    if (serviceId) {
      fetchServiceAndStaff()
    }
  }, [serviceId])

  const fetchServiceAndStaff = async () => {
    try {
      // Fetch service details
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single()

      if (serviceError) throw serviceError
      setService(serviceData)

      // Get staff IDs that offer this service
      const { data: staffServices, error: staffServicesError } = await supabase
        .from('staff_services')
        .select('staff_id')
        .eq('service_id', serviceId)

      if (staffServicesError) throw staffServicesError

      if (staffServices && staffServices.length > 0) {
        const staffIds = staffServices.map(item => item.staff_id)
        
        // Fetch staff members
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .in('id', staffIds)
          .eq('is_active', true)

        if (staffError) throw staffError

        // Fetch profiles separately
        if (staffData) {
          const userIds = staffData.map(staff => staff.user_id)
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds)

          if (profilesError) throw profilesError

          // Combine staff with profile data
          const staffWithProfiles: Staff[] = staffData.map(staff => {
            const profile = profilesData?.find(p => p.id === staff.user_id)
            return {
              ...staff,
              full_name: profile?.full_name || 'Staff Member',
              email: profile?.email || ''
            }
          })

          setStaff(staffWithProfiles)
        }
      } else {
        setStaff([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    if (selectedStaff && serviceId) {
      router.push(`/booking/select-date-time?serviceId=${serviceId}&staffId=${selectedStaff}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          Loading...
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          Service not found.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Select Your Stylist</h1>
          <p className="text-xl text-gray-600 mb-2">
            For: <strong>{service.name}</strong>
          </p>
          <p className="text-gray-500">
            {service.duration} minutes • ${service.price}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Stylists
          </h2>
          
          <div className="space-y-4">
            {staff.map((staffMember) => (
              <div
                key={staffMember.id}
                className={`p-4 border rounded-lg cursor-pointer transition duration-200 ${
                  selectedStaff === staffMember.id
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-300'
                }`}
                onClick={() => setSelectedStaff(staffMember.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {staffMember.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {staffMember.specialization || 'General Stylist'}
                    </p>
                    {staffMember.bio && (
                      <p className="text-sm text-gray-500 mt-1">{staffMember.bio}</p>
                    )}
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedStaff === staffMember.id
                      ? 'bg-pink-500 border-pink-500'
                      : 'border-gray-300'
                  }`} />
                </div>
              </div>
            ))}
          </div>

          {staff.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No staff members available for this service.
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
          >
            Back to Services
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedStaff}
            className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
          >
            Select Date & Time
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SelectStaff() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          Loading...
        </div>
      </div>
    }>
      <SelectStaffContent />
    </Suspense>
  )
}