import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Redirect to home page after successful sign out
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SUPABASE_URL!))
  } catch (error: any) {
    console.error('Server error during sign out:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}