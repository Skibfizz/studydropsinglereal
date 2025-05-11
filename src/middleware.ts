import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh session if expired
  await supabase.auth.getSession()
  
  return res
}

// Add routes that need auth verification here
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/stripe/:path*',
    '/api/humanize',
    '/history',
    // Add other protected routes as needed
  ],
} 