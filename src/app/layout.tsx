import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { supabase } from '@/lib/supabase'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Atlanta Elegant Salon',
  description: 'Premium salon services in Atlanta',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-pink-600">
                  Atlanta Elegant Salon
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                {session ? (
                  <form action="/auth/signout" method="post">
                    <button 
                      type="submit"
                      className="text-gray-700 hover:text-pink-600"
                    >
                      Sign Out
                    </button>
                  </form>
                ) : (
                  <>
                    <a href="/auth/signin" className="text-gray-700 hover:text-pink-600">
                      Sign In
                    </a>
                    <a 
                      href="/auth/signup" 
                      className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
                    >
                      Sign Up
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}