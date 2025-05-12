'use client'

import { useAuth } from '@/components/providers/auth-provider'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Menu, X } from 'lucide-react'

export const Header = () => {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Don't show header on auth pages
  if (pathname.startsWith('/auth/')) return null

  return (
    <header className='w-full py-6 border-b border-gray-400'>
      <div className='container mx-auto px-4 flex justify-between items-center'>
        <Link href="/" className='flex items-center gap-2'>
          <div className='relative w-8 h-8'>
            <Image 
              src="/mascot.png" 
              alt="StudyDrop Mascot" 
              width={32} 
              height={32}
              className="object-contain"
            />
          </div>
          <h1 className='text-2xl font-bold'>StudyDrop</h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className='hidden md:block'>
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
        
        {/* Mobile Menu Button */}
        <div className='md:hidden'>
          <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <Dialog.Trigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </Dialog.Trigger>
            
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
              <Dialog.Content className="fixed top-0 left-0 right-0 bg-white z-50 p-6 shadow-lg flex flex-col border-b border-gray-300 animate-in slide-in-from-top">
                <Dialog.Title className="sr-only">Navigation Menu</Dialog.Title>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className='relative w-8 h-8'>
                      <Image 
                        src="/mascot.png" 
                        alt="StudyDrop Mascot" 
                        width={32} 
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <h2 className='text-xl font-bold'>StudyDrop</h2>
                  </div>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </Dialog.Close>
                </div>
                
                <nav>
                  <ul className="flex flex-col space-y-4">
                    <li>
                      <Link 
                        href='/' 
                        className='block py-2 hover:underline text-lg'
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href='/pricing' 
                        className='block py-2 hover:underline text-lg'
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Pricing
                      </Link>
                    </li>
                    {user && (
                      <li>
                        <Link 
                          href='/history' 
                          className='block py-2 hover:underline text-lg'
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          History
                        </Link>
                      </li>
                    )}
                    {user ? (
                      <li>
                        <Link 
                          href='/dashboard' 
                          className='flex items-center gap-2 py-2 text-lg mt-2 border-t border-gray-200 pt-4'
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {user.user_metadata?.avatar_url ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden border">
                              <Image 
                                src={user.user_metadata.avatar_url} 
                                alt="Profile" 
                                width={32} 
                                height={32}
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm">{user.user_metadata?.name?.[0] || user.email?.[0] || '?'}</span>
                            </div>
                          )}
                          <span>Dashboard</span>
                        </Link>
                      </li>
                    ) : !loading && (
                      <li className="mt-2 pt-4 border-t border-gray-200">
                        <Button variant='outline' className="w-full justify-center" asChild>
                          <Link 
                            href='/auth/signin'
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Sign In
                          </Link>
                        </Button>
                      </li>
                    )}
                  </ul>
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  )
} 