import { supabase } from '@/lib/supabase'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  category: string
  is_active: boolean
  created_at: string
}

export default async function ServicesPage() {
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('category')

  const servicesByCategory = services?.reduce((acc: Record<string, Service[]>, service: Service) => {
    const category = service.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive range of beauty and wellness services 
            designed to pamper and transform.
          </p>
        </div>

        {servicesByCategory && Object.entries(servicesByCategory).map(([category, categoryServices]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
              {category} Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(categoryServices as Service[]).map((service: Service) => (
                <div key={service.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-pink-600">${service.price}</span>
                    <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {service.duration} min
                    </span>
                  </div>
                  <button className="w-full bg-pink-600 text-white py-2 rounded-lg font-semibold hover:bg-pink-700 transition duration-200">
                    Book This Service
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}