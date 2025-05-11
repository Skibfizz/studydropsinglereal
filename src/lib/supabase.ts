import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database.types'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Regular client for non-auth operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Client for browser components with auth
export const createClient_browser = () => {
  return createClientComponentClient<Database>()
}

// Server component helper
export const createServerClient = async () => {
  const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs')
  const { cookies } = await import('next/headers')
  
  return createServerComponentClient<Database>({ cookies })
}

// Server action helper
export const createActionClient = async () => {
  const { createServerActionClient } = await import('@supabase/auth-helpers-nextjs')
  const { cookies } = await import('next/headers')
  
  return createServerActionClient<Database>({ cookies })
} 