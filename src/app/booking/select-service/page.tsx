import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  category: string
}

interface ServicesByCategory {
  [category: string]: Service[]
}

export default async function SelectService() {
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('category')

  const servicesByCategory: ServicesByCategory = {}
  
  services?.forEach((service: Service) => {
    const category = service.category || 'other'
    if (!servicesByCategory[category]) {
      servicesByCategory[category] = []
    }
    servicesByCategory[category].push(service)
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Select a Service</h1>
          <p className="text-xl text-gray-600">
            Choose the service you'd like to book
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <div key={category} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 capitalize">
                {category} Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryServices.map((service) => (
                  <Link
                    key={service.id}
                    href={`/booking/select-staff?serviceId=${service.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                      <span className="text-lg font-bold text-pink-600">${service.price}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{service.duration} minutes</span>
                      <span className="text-pink-600 font-semibold">Book Now →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/services"
            className="text-pink-600 font-semibold hover:text-pink-700"
          >
            View All Service Details →
          </Link>
        </div>
      </div>
    </div>
  )
}