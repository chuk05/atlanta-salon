'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'

interface Service {
  id: string
  name: string
}

interface Staff {
  id: string
  profile?: {
    full_name: string
  }
}

function AssignServicesContent() {
  const searchParams = useSearchParams()
  const staffId = searchParams.get('id')
  
  const [staff, setStaff] = useState<Staff | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [assignedServices, setAssignedServices] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (staffId) {
      fetchData()
    }
  }, [staffId])

  const fetchData = async () => {
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

      // Fetch all services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (servicesError) throw servicesError
      setServices(servicesData || [])

      // Fetch currently assigned services
      const { data: assignedData, error: assignedError } = await supabase
        .from('staff_services')
        .select('service_id')
        .eq('staff_id', staffId)

      if (assignedError) throw assignedError
      setAssignedServices(assignedData?.map(item => item.service_id) || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleService = (serviceId: string) => {
    setAssignedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const saveAssignments = async () => {
    setSaving(true)
    try {
      // First remove all existing assignments
      const { error: deleteError } = await supabase
        .from('staff_services')
        .delete()
        .eq('staff_id', staffId!)

      if (deleteError) throw deleteError

      // Then add new assignments
      if (assignedServices.length > 0) {
        const assignments = assignedServices.map(serviceId => ({
          staff_id: staffId!,
          service_id: serviceId
        }))

        const { error: insertError } = await supabase
          .from('staff_services')
          .insert(assignments)

        if (insertError) throw insertError
      }

      alert('Services assigned successfully!')
    } catch (error) {
      console.error('Error saving assignments:', error)
      alert('Error saving assignments. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">Loading...</div>
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
          Assign Services to {staff.profile?.full_name}
        </h1>
        <p className="text-gray-600">Select which services this staff member can perform</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={`p-4 border rounded-lg cursor-pointer transition duration-200 ${
                assignedServices.includes(service.id)
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleService(service.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{service.name}</span>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  assignedServices.includes(service.id)
                    ? 'bg-pink-500 border-pink-500'
                    : 'border-gray-300'
                }`} />
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No services found. Please create services first.
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <a 
          href="/admin/staff"
          className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition duration-200"
        >
          Back to Staff
        </a>
        <button
          onClick={saveAssignments}
          disabled={saving}
          className="bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
        >
          {saving ? 'Saving...' : 'Save Assignments'}
        </button>
      </div>
    </div>
  )
}

export default function AssignServices() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">Loading...</div>
      </div>
    }>
      <AssignServicesContent />
    </Suspense>
  )
}