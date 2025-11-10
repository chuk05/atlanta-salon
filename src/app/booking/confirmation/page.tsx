'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const appointmentTime = searchParams.get('appointment')
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null)

  useEffect(() => {
    if (appointmentTime) {
      setAppointmentDate(new Date(appointmentTime))
    }
  }, [appointmentTime])

  if (!appointmentDate) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          Loading confirmation...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your appointment has been successfully scheduled.
          </p>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600 mb-2">
                {format(appointmentDate, 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="text-lg text-gray-600 mb-4">
                at {format(appointmentDate, 'h:mm a')}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-gray-600 mb-2">
                  We've sent a confirmation email with all the details.
                </p>
                <p className="text-sm text-gray-500">
                  Please arrive 10 minutes before your appointment time.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="block bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition duration-200"
            >
              Back to Home
            </Link>
            <Link
              href="/my-appointments"
              className="block border border-pink-600 text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-pink-50 transition duration-200"
            >
              View My Appointments
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Confirmation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          Loading...
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}