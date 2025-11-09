'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [status, setStatus] = useState('Testing connection...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Test 1: Basic connection without querying tables
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus('Failed')
          setError(error.message)
        } else {
          setStatus('Successful!')
          setError(null)
        }
      } catch (err) {
        setStatus('Failed')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className={`p-4 rounded-lg mb-6 ${
        status === 'Successful!' ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
      }`}>
        <p className="font-semibold">Connection Status: {status}</p>
        {error && (
          <pre className="mt-2 text-sm bg-white p-2 rounded border">
            Error: {error}
          </pre>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="font-bold mb-2">Troubleshooting Steps:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Check .env.local file exists in project root</li>
          <li>Verify Supabase URL and Anon Key are correct</li>
          <li>Ensure no spaces after = in .env.local</li>
          <li>Restart dev server after changing .env.local</li>
        </ol>
      </div>
    </div>
  )
}