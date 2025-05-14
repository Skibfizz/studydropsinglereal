'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

// Define schema for form validation
const formSchema = z.object({
	text: z.string().refine((text) => {
		const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
		return wordCount >= 50;
	}, {
		message: 'Text must be at least 50 words.',
	}),
})

export function Humanizer() {
	const [isHumanizing, setIsHumanizing] = useState(false)
	const [humanizedText, setHumanizedText] = useState('')
	const [wordCount, setWordCount] = useState(0)
	const [maxWordsPerRequest, setMaxWordsPerRequest] = useState(250) // Default to free tier
	const router = useRouter()
	const { user } = useAuth()

	// Initialize form
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			text: '',
		},
		mode: 'onSubmit', // Only validate on submit
	})

	// Fetch user subscription data
	useEffect(() => {
		const fetchSubscription = async () => {
			try {
				const response = await fetch('/api/subscription')
				if (!response.ok) return
				
				const data = await response.json()
				
				// Set max words per request from the API response
				if (data.usage && data.usage.per_request_limit) {
					setMaxWordsPerRequest(data.usage.per_request_limit)
				} else {
					// Fallback logic if per_request_limit is not available
					const planType = data.subscription?.plan_type || 'free'
					if (planType === 'beginner') {
						setMaxWordsPerRequest(500)
					} else if (planType === 'pro') {
						setMaxWordsPerRequest(2000)
					} else if (planType === 'ultimate') {
						setMaxWordsPerRequest(5000)
					} else {
						setMaxWordsPerRequest(250) // Free tier
					}
				}
			} catch (error) {
				console.error('Error fetching subscription:', error)
			}
		}
		
		fetchSubscription()
	}, [])

	// Read from localStorage on mount
	useEffect(() => {
		const originalText = localStorage.getItem('studydrop_original_text')
		const humanizedResult = localStorage.getItem('studydrop_humanized_text')
		
		if (originalText) {
			form.setValue('text', originalText)
			setWordCount(countWords(originalText))
			// Clear after reading to prevent showing on future visits
			localStorage.removeItem('studydrop_original_text')
		}
		
		if (humanizedResult) {
			setHumanizedText(humanizedResult)
			// Clear after reading to prevent showing on future visits
			localStorage.removeItem('studydrop_humanized_text')
		}
	}, [form])

	// Function to count words in text
	const countWords = (text: string) => {
		return text.trim().split(/\s+/).filter(Boolean).length
	}

	// Update word count when input changes
	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const text = e.target.value
		setWordCount(countWords(text))
	}

	// Handle form submission
	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		// Check if user is logged in
		if (!user) {
			// Redirect to sign in page if not authenticated
			router.push('/auth/signin')
			return;
		}
		
		// Check if text exceeds the word limit for the current plan
		if (wordCount > maxWordsPerRequest) {
			toast.error(`Text exceeds the ${maxWordsPerRequest} word limit for your plan. Please reduce the text or upgrade your plan.`)
			return
		}
		
		try {
			setIsHumanizing(true)
			
			// API call to humanize text
			const response = await fetch('/api/humanize', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ text: values.text }),
			})

			if (response.status === 401) {
				// User is not authenticated
				toast.error('Please sign in to humanize text')
				router.push('/auth/signin')
				return
			}
			
			if (response.status === 403) {
				// Handle limit exceeded errors
				const error = await response.json()
				toast.error(error.error || 'Word limit exceeded. Please upgrade your plan.')
				return
			}

			if (!response.ok) {
				throw new Error('Failed to humanize text')
			}

			const data = await response.json()
			setHumanizedText(data.humanizedText)
			
			if (data.dbSaveError) {
				toast.warning('Text humanized but could not save to history. Your session may have expired.')
			} else {
				toast.success('Text successfully humanized!')
			}
		} catch (error) {
			console.error('Error humanizing text:', error)
			toast.error('Failed to humanize text. Please try again.')
		} finally {
			setIsHumanizing(false)
		}
	}

	const copyToClipboard = () => {
		navigator.clipboard.writeText(humanizedText)
		toast.success('Copied to clipboard!')
	}

	return (
		<div className={`w-full ${humanizedText ? 'max-w-6xl' : 'max-w-4xl'}`}>
			<div className={`flex flex-col ${humanizedText ? 'lg:flex-row' : ''} gap-6`}>
				<div className={`w-full ${humanizedText ? 'lg:w-1/2' : ''}`}>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<Card className='h-full'>
								<CardHeader className='pb-4'>
									<div className='flex justify-between items-center'>
										<h3 className='text-lg font-medium'>Your Text</h3>
										<span className='text-sm text-gray-500'>
											{wordCount} / {maxWordsPerRequest} words
										</span>
									</div>
								</CardHeader>
								<CardContent>
									<FormField
										control={form.control}
										name='text'
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Textarea
														placeholder='Paste your text here...'
														className='min-h-[400px] resize-none'
														{...field}
														onChange={(e) => {
															field.onChange(e)
															handleInputChange(e)
														}}
													/>
												</FormControl>
												{form.formState.isSubmitted && (
													<FormMessage className="text-red-500">
														Minimum 50 words required
													</FormMessage>
												)}
											</FormItem>
										)}
									/>
								</CardContent>
								<CardFooter className='flex justify-end'>
									<Button 
										type='submit' 
										disabled={isHumanizing}
										onClick={(e) => {
											if (!user) {
												e.preventDefault();
												router.push('/auth/signin');
											}
										}}
									>
										{isHumanizing ? 'Humanizing...' : 'Humanize'}
									</Button>
								</CardFooter>
							</Card>
						</form>
					</Form>
				</div>

				{humanizedText && (
					<div className='w-full lg:w-1/2'>
						<Card className='h-full'>
							<CardHeader className='pb-4'>
								<h3 className='text-lg font-medium'>Humanized Result</h3>
							</CardHeader>
							<CardContent>
								<div className='p-4 bg-gray-50 rounded-md min-h-32'>
									{humanizedText}
								</div>
							</CardContent>
							<CardFooter className='flex justify-end'>
								<Button onClick={copyToClipboard}>Copy to Clipboard</Button>
							</CardFooter>
						</Card>
					</div>
				)}
			</div>
		</div>
	)
} 