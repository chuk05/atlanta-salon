'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function BookingPage() {
  const [step, setStep] = useState(1)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
          <p className="text-xl text-gray-600">
            Ready to experience luxury? Book your appointment in just a few steps.
          </p>
        </div>

        {/* Booking Steps */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNumber ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNumber}
                </div>
                <span className="text-sm mt-2 text-gray-600">Step {stepNumber}</span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
              <p className="text-gray-600 mb-8">
                Please sign in to book your appointment. Don't have an account? 
                You can create one during booking.
              </p>
              <div className="space-y-4">
                <Link 
                  href="/auth/signin?redirect=/booking/select-service"
                  className="block w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition duration-200"
                >
                  Sign In to Continue
                </Link>
                <Link 
                  href="/auth/signup?redirect=/booking/select-service"
                  className="block w-full border border-pink-600 text-pink-600 py-3 rounded-lg font-semibold hover:bg-pink-50 transition duration-200"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Need help? Call us at <strong>(404) 555-0123</strong> or{' '}
            <a href="mailto:info@atlantaelegantsalon.com" className="text-pink-600 hover:text-pink-700">
              send us an email
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}