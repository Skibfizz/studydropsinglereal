'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignOutPage() {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <main className='min-h-screen flex flex-col items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold text-center'>
            Sign Out
          </CardTitle>
          <CardDescription className='text-center'>
            Are you sure you want to sign out?
          </CardDescription>
        </CardHeader>
        <CardContent className='flex justify-center space-x-4'>
          <Button onClick={handleSignOut}>
            Yes, Sign Out
          </Button>
          <Button variant='outline' onClick={() => router.back()}>
            Cancel
          </Button>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Button variant='link' onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
} 