'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function VerifyRequestPage() {
	const router = useRouter()

	return (
		<main className='min-h-screen flex flex-col items-center justify-center p-4'>
			<Card className='w-full max-w-md'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold text-center'>
						Check Your Email
					</CardTitle>
					<CardDescription className='text-center'>
						A sign in link has been sent to your email address
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4 text-center'>
					<p>
						Click the link in the email to sign in to your account. If you don&apos;t
						see the email, check your spam folder.
					</p>
					<p>
						The link will expire after 24 hours. If you need a new link, you can
						request another one.
					</p>
				</CardContent>
				<CardFooter className='flex justify-center'>
					<Button variant='link' onClick={() => router.push('/auth/signin')}>
						Back to Sign In
					</Button>
				</CardFooter>
			</Card>
		</main>
	)
} 