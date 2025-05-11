'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/providers/auth-provider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const PRICING_PLANS = [
	{
		id: 'beginner',
		name: 'Beginner',
		description: 'Enhanced humanization for regular users',
		monthlyPrice: 5.99,
		annualPrice: 50, // Flat annual price
		features: [
			'5,000 words per month',
			'Enhanced humanization quality',
			'Maximum 500 words per request',
			'Priority support',
		],
		monthlyStripePriceId: 'price_1RNekUHgxuRkr4erU5JAMHDW',
		annualStripePriceId: 'price_1RNgs0HgxuRkr4er2mlEkigH',
	},
	{
		id: 'pro',
		name: 'Pro',
		description: 'Professional humanization with advanced features',
		monthlyPrice: 15.99,
		annualPrice: 130, // Flat annual price
		features: [
			'12,000 words per month',
			'Premium humanization quality',
			'Maximum 2,000 words per request',
			'Priority support',
			'Custom tone settings',
		],
		monthlyStripePriceId: 'price_1RNekWHgxuRkr4erYHsBIi8J',
		annualStripePriceId: 'price_1RNgs0HgxuRkr4er2mlEkigH',
	},
	{
		id: 'ultimate',
		name: 'Ultimate',
		description: 'Enterprise-grade humanization with all features',
		monthlyPrice: 29.99,
		annualPrice: 245, // Flat annual price
		features: [
			'30,000 words per month',
			'Ultimate humanization quality',
			'Maximum 5,000 words per request',
			'Priority support',
			'Custom tone & style settings',
			'API access',
			'Advanced analytics'
		],
		monthlyStripePriceId: 'price_1RNekaHgxuRkr4erxRTzT4wB',
		annualStripePriceId: 'price_1RNgs5HgxuRkr4erHAS3knLs',
	},
]

export default function PricingPage() {
	const router = useRouter()
	const { user } = useAuth()
	const [isLoading, setIsLoading] = useState<string | null>(null)
	const [isAnnual, setIsAnnual] = useState(false)

	const handleSubscription = async (plan: typeof PRICING_PLANS[0]) => {
		if (!user) {
			// Redirect to sign in if not logged in
			return router.push('/auth/signin?callbackUrl=/pricing')
		}

		if (plan.id === 'free') {
			// Handle free tier subscription
			toast.success('You are now on the Free plan!')
			return
		}

		try {
			setIsLoading(plan.id)
			
			// Call Stripe API to create checkout session
			const response = await fetch('/api/stripe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					priceId: isAnnual ? plan.annualStripePriceId : plan.monthlyStripePriceId 
				}),
			})

			if (!response.ok) {
				throw new Error('Failed to create checkout session')
			}

			const data = await response.json()
			
			// Redirect to Stripe checkout
			window.location.href = data.url
		} catch (error) {
			console.error('Error handling subscription:', error)
			toast.error('Failed to process subscription. Please try again.')
		} finally {
			setIsLoading(null)
		}
	}

	const formatPrice = (price: number) => {
		return price % 1 === 0 ? `$${Math.round(price)}` : `$${price.toFixed(2)}`
	}

	return (
		<main className='min-h-screen flex flex-col'>
			<div className='container mx-auto px-4 py-12 flex-1'>
				<div className='max-w-4xl mx-auto'>
					<div className='text-center mb-12'>
						<h2 className='text-4xl font-bold mb-4'>Pricing Plans</h2>
						<p className='text-xl text-gray-600 mb-8'>
							Choose the perfect plan for your humanization needs
						</p>
						
						<div className="flex items-center justify-center gap-4 mb-8">
							<Label htmlFor="billing-toggle" className={cn("transition-colors", isAnnual ? "text-gray-500" : "font-medium")}>Monthly</Label>
							<div className="flex items-center">
								<Switch
									id="billing-toggle"
									checked={isAnnual}
									onCheckedChange={setIsAnnual}
								/>
							</div>
							<div className="flex items-center gap-2">
								<Label htmlFor="billing-toggle" className={cn("transition-colors", isAnnual ? "font-medium" : "text-gray-500")}>Annual</Label>
								<span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded">Save 30%</span>
							</div>
						</div>
					</div>

					<div className='grid md:grid-cols-3 gap-8'>
						{PRICING_PLANS.map((plan) => (
							<Card key={plan.id} className='flex flex-col'>
								<CardHeader>
									<CardTitle>{plan.name}</CardTitle>
									<CardDescription>{plan.description}</CardDescription>
								</CardHeader>
								<CardContent className='flex-1'>
									<div className='mb-4'>
										<span className='text-3xl font-bold'>
											{formatPrice(isAnnual ? plan.annualPrice / 12 : plan.monthlyPrice)}
										</span>
										<span className='text-gray-500'>/month</span>
										{isAnnual && (
											<div className="text-sm text-gray-500 mt-1">
												Billed as {formatPrice(plan.annualPrice)} annually
											</div>
										)}
									</div>
									<ul className='space-y-2'>
										{plan.features.map((feature, index) => (
											<li key={index} className='flex items-center'>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													className='h-5 w-5 text-green-500 mr-2'
													viewBox='0 0 20 20'
													fill='currentColor'
												>
													<path
														fillRule='evenodd'
														d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
														clipRule='evenodd'
													/>
												</svg>
												{feature}
											</li>
										))}
									</ul>
								</CardContent>
								<CardFooter>
									<Button
										className='w-full'
										onClick={() => handleSubscription(plan)}
										disabled={isLoading === plan.id}
									>
										{isLoading === plan.id
											? 'Processing...'
											: plan.monthlyPrice === 0
											? 'Get Started'
											: 'Subscribe'}
									</Button>
								</CardFooter>
							</Card>
						))}
					</div>
				</div>
			</div>

			<footer className='w-full py-4 border-t'>
				<div className='container mx-auto px-4'>
					<div className='flex justify-center items-center space-x-4'>
						<a href='/pricing' className='text-sm hover:underline'>
							Pricing
						</a>
						<a href='/contact' className='text-sm hover:underline'>
							Contact
						</a>
						<a href='/privacy' className='text-sm hover:underline'>
							Privacy Policy
						</a>
						<a href='/terms' className='text-sm hover:underline'>
							Terms of Service
						</a>
					</div>
					<p className='text-center text-sm mt-2'>
						© {new Date().getFullYear()} StudyDrop Humanizer
					</p>
				</div>
			</footer>
		</main>
	)
} 