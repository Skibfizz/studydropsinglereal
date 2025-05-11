'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Suspense } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/providers/auth-provider'

// Define schema for form validation
const formSchema = z.object({
	email: z.string().email({
		message: 'Please enter a valid email address.',
	}),
})

function SignInContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
	const [isLoading, setIsLoading] = useState(false)
	const { signIn } = useAuth()

	// Initialize form
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
		},
	})

	// Handle form submission
	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			setIsLoading(true)
			
			// Sign in with email
			await signIn.email(values.email, callbackUrl)

			toast.success('Check your email for a sign in link!')
			router.push('/auth/verify-request')
		} catch (error) {
			console.error('Error signing in:', error)
			toast.error('Failed to sign in. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	// Social sign in handlers
	const handleGoogleSignIn = async () => {
		try {
			await signIn.google(callbackUrl)
		} catch (error) {
			console.error('Error signing in with Google:', error)
			toast.error('Failed to sign in with Google.')
		}
	}

	const handleGitHubSignIn = async () => {
		try {
			await signIn.github(callbackUrl)
		} catch (error) {
			console.error('Error signing in with GitHub:', error)
			toast.error('Failed to sign in with GitHub.')
		}
	}

	return (
		<main className='min-h-screen flex flex-col items-center justify-center p-4'>
			<Card className='w-full max-w-md'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold text-center'>Sign In</CardTitle>
					<CardDescription className='text-center'>
						Enter your email to sign in to your account
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder='name@example.com'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button className='w-full' type='submit' disabled={isLoading}>
								{isLoading ? 'Signing in...' : 'Sign In with Email'}
							</Button>
						</form>
					</Form>

					<div className='relative'>
						<div className='absolute inset-0 flex items-center'>
							<span className='w-full border-t' />
						</div>
						<div className='relative flex justify-center text-xs uppercase'>
							<span className='bg-background px-2 text-muted-foreground'>
								Or continue with
							</span>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<Button
							variant='outline'
							onClick={handleGoogleSignIn}
							disabled={isLoading}
						>
							Google
						</Button>
						<Button
							variant='outline'
							onClick={handleGitHubSignIn}
							disabled={isLoading}
						>
							GitHub
						</Button>
					</div>
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

export default function SignInPage() {
	return (
		<Suspense fallback={
			<main className='min-h-screen flex flex-col items-center justify-center p-4'>
				<Card className='w-full max-w-md'>
					<CardHeader className='space-y-1'>
						<CardTitle className='text-2xl font-bold text-center'>Sign In</CardTitle>
						<CardDescription className='text-center'>
							Loading sign in page...
						</CardDescription>
					</CardHeader>
				</Card>
			</main>
		}>
			<SignInContent />
		</Suspense>
	)
} 