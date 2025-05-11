'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'

function AuthErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Unknown error'

  return (
    <main className='min-h-screen flex flex-col items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold text-center'>
            Authentication Error
          </CardTitle>
          <CardDescription className='text-center'>
            There was a problem with authentication
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-red-500'>
            {error}
          </p>
          <p>
            Please try again or contact support if the problem persists.
          </p>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Button onClick={() => router.push('/auth/signin')}>
            Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <main className='min-h-screen flex flex-col items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl font-bold text-center'>
              Authentication Error
            </CardTitle>
            <CardDescription className='text-center'>
              Loading error details...
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    }>
      <AuthErrorContent />
    </Suspense>
  )
} 