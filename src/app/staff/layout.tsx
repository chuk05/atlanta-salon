import { supabase } from '@/lib/supabase'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-pink-600">Staff App</h1>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">{session?.user?.email}</span>
              <form action="/auth/signout" method="post">
                <button 
                  type="submit"
                  className="text-sm text-gray-500 hover:text-pink-600"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
          
          {/* Mobile navigation */}
          <div className="flex space-x-4 mt-3 overflow-x-auto">
            <a href="/staff/schedule" className="text-sm font-medium text-pink-600 whitespace-nowrap">
              My Schedule
            </a>
            <a href="/staff/profile" className="text-sm font-medium text-gray-500 hover:text-gray-700 whitespace-nowrap">
              Profile
            </a>
          </div>
        </div>
      </nav>
      
      <main className="pb-20"> {/* Extra padding for mobile */}
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
        <div className="flex justify-around">
          <a href="/staff/schedule" className="flex flex-col items-center text-pink-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs mt-1">Schedule</span>
          </a>
          <a href="/" className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </a>
        </div>
      </div>
    </div>
  )
}