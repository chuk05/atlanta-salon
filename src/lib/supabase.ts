import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create and export the supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// If you need a createClient function for some components, export it with a different name
export const createSupabaseClient = () => supabase