import { createClient } from '@/lib/supabase'

export default async function AdminDashboard() {
  const supabase = createClient()

  // Get stats for dashboard
  const { data: services } = await supabase
    .from('services')
    .select('*', { count: 'exact' })

  const { data: staff } = await supabase
    .from('staff')
    .select('*', { count: 'exact' })

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact' })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to your salon management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Services</h3>
          <p className="text-3xl font-bold text-pink-600">{services?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Staff Members</h3>
          <p className="text-3xl font-bold text-pink-600">{staff?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Appointments</h3>
          <p className="text-3xl font-bold text-pink-600">{appointments?.length || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a 
            href="/admin/services/new" 
            className="bg-pink-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 transition duration-200"
          >
            Add New Service
          </a>
          <a 
            href="/admin/staff/new" 
            className="bg-pink-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-pink-700 transition duration-200"
          >
            Add Staff Member
          </a>
          <a 
            href="/admin/appointments" 
            className="bg-white text-pink-600 text-center py-3 px-4 rounded-lg font-semibold border border-pink-600 hover:bg-pink-50 transition duration-200"
          >
            View Appointments
          </a>
          <a 
            href="/" 
            className="bg-white text-gray-700 text-center py-3 px-4 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition duration-200"
          >
            View Website
          </a>
        </div>
      </div>
    </div>
  )
}