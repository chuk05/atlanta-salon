import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .limit(6)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Atlanta's Premier<br />
              <span className="text-pink-600">Beauty Experience</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover luxury beauty services in the heart of Atlanta. 
              Professional stylists, premium products, and unforgettable experiences.
            </p>
            <div className="space-x-4">
              <Link 
                href="/booking"
                className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition duration-200"
              >
                Book Now
              </Link>
              <Link 
                href="/services"
                className="border border-pink-600 text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-pink-50 transition duration-200"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From classic cuts to luxurious treatments, we offer a wide range of services 
              to make you look and feel your best.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services?.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-pink-600">${service.price}</span>
                  <span className="text-gray-500">{service.duration}min</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/services"
              className="text-pink-600 font-semibold hover:text-pink-700"
            >
              View All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-pink-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready for Your Transformation?</h2>
          <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
            Book your appointment today and experience the Atlanta Elegant Salon difference.
          </p>
          <Link 
            href="/booking"
            className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-pink-50 transition duration-200"
          >
            Book Your Appointment
          </Link>
        </div>
      </section>
    </div>
  )
}