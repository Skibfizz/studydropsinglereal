'use client'

import { useAuth } from '@/components/providers/auth-provider'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

export const Header = () => {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  
  // Don't show header on auth pages
  if (pathname.startsWith('/auth/')) return null

  return (
    <header className='w-full py-4 border-b'>
      <div className='container mx-auto px-4 flex justify-between items-center'>
        <Link href="/">
          <h1 className='text-2xl font-bold'>StudyDrop</h1>
        </Link>
        <nav>
          <ul className='flex space-x-4 items-center'>
            <li>
              <Link href='/' className='hover:underline'>
                Home
              </Link>
            </li>
            <li>
              <Link href='/pricing' className='hover:underline'>
                Pricing
              </Link>
            </li>
            {user && (
              <>
                <li>
                  <Link href='/history' className='hover:underline'>
                    History
                  </Link>
                </li>
                <li>
                  {user.user_metadata?.avatar_url ? (
                    <Link href='/dashboard'>
                      <div className="w-8 h-8 rounded-full overflow-hidden border">
                        <Image 
                          src={user.user_metadata.avatar_url} 
                          alt="Profile" 
                          width={32} 
                          height={32}
                          className="object-cover"
                        />
                      </div>
                    </Link>
                  ) : (
                    <Link href='/dashboard'>
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm">{user.user_metadata?.name?.[0] || user.email?.[0] || '?'}</span>
                      </div>
                    </Link>
                  )}
                </li>
              </>
            )}
            {!user && !loading && (
              <li>
                <Button variant='outline' asChild>
                  <Link href='/auth/signin'>Sign In</Link>
                </Button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
} 