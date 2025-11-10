'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignOut() {
  const router = useRouter()

  useEffect(() => {
    const performSignOut = async () => {
      try {
        const response = await fetch('/auth/api/signout', {  // Updated URL
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          router.push('/')
          router.refresh() // Refresh to update auth state
        } else {
          console.error('Sign out failed')
          router.push('/')
        }
      } catch (error) {
        console.error('Error during sign out:', error)
        router.push('/')
      }
    }

    performSignOut()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
          <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-gray-900">Signing out...</h2>
        <p className="mt-1 text-sm text-gray-500">Please wait while we sign you out.</p>
      </div>
    </div>
  )
}