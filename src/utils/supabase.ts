import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY')
if (!supabaseServiceKey) throw new Error('Missing VITE_SUPABASE_SERVICE_ROLE_KEY')

// Regular client for normal operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin client for privileged operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Public client for unauthenticated operations
export const publicClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
}) 