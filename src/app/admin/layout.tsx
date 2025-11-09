import { createClient } from '@/lib/supabase'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-pink-600">Admin Dashboard</h1>
              <div className="hidden md:flex space-x-4">
                <a href="/admin" className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md">
                  Overview
                </a>
                <a href="/admin/services" className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md">
                  Services
                </a>
                <a href="/admin/staff" className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md">
                  Staff
                </a>
                <a href="/admin/appointments" className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md">
                  Appointments
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {session?.user?.email}</span>
              <form action="/auth/signout" method="post">
                <button 
                  type="submit"
                  className="text-gray-700 hover:text-pink-600"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-6">
        {children}
      </main>
    </div>
  )
}