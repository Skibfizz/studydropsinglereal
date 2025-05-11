'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/components/providers/auth-provider'

export default function DashboardPage() {
	const { user, loading, signOut } = useAuth()
	const router = useRouter()
	const [usage, setUsage] = useState({
		used: 0,
		limit: 3,
		subscription: 'Free',
		status: 'active',
		period_start: '',
		period_end: ''
	})
	const [isLoading, setIsLoading] = useState(true)

	// Redirect if not authenticated
	useEffect(() => {
		if (!loading && !user) {
			router.push('/auth/signin?callbackUrl=/dashboard')
		}
	}, [user, loading, router])

	// Fetch user subscription and usage data
	useEffect(() => {
		async function fetchSubscriptionData() {
			if (user?.id) {
				try {
					const response = await fetch('/api/subscription')
					if (!response.ok) throw new Error('Failed to fetch subscription data')
					
					const data = await response.json()
					setUsage({
						used: data.usage.used,
						limit: data.usage.limit,
						subscription: data.subscription.plan_type.charAt(0).toUpperCase() + data.subscription.plan_type.slice(1),
						status: data.subscription.status,
						period_start: data.usage.period_start,
						period_end: data.usage.period_end
					})
				} catch (error) {
					console.error('Error fetching subscription:', error)
					// Keep default values on error
				} finally {
					setIsLoading(false)
				}
			}
		}

		fetchSubscriptionData()
	}, [user])

	// Handle sign out
	const handleSignOut = async () => {
		await signOut()
		router.push('/auth/signin')
	}

	// Handle subscription upgrade
	const handleUpgradeSubscription = () => {
		router.push('/pricing')
	}

	if (loading || isLoading) {
		return (
			<main className='min-h-screen flex flex-col items-center justify-center p-4'>
				<p>Loading...</p>
			</main>
		)
	}

	return (
		<main className='min-h-screen flex flex-col'>
			<div className='container mx-auto px-4 py-12 flex-1'>
				<div className='max-w-5xl mx-auto'>
					{/* Wide box at the top with user info */}
					<Card className="w-full mb-6">
						<CardHeader>
							<CardTitle>Account Information</CardTitle>
							<CardDescription>Your personal details</CardDescription>
						</CardHeader>
						<CardContent>
							<p className='text-2xl font-bold'>{user?.user_metadata?.name || 'User'}</p>
							<p className='text-gray-500'>{user?.email}</p>
							<div className="mt-4">
								<Button 
									variant="destructive" 
									onClick={handleSignOut}
									className="w-full sm:w-auto"
								>
									Log Out
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Two boxes side by side */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-12'>
						{/* Left box - Balance */}
						<Card>
							<CardHeader>
								<CardTitle>Usage</CardTitle>
								<CardDescription>Your current usage stats</CardDescription>
							</CardHeader>
							<CardContent>
								<p className='text-3xl font-bold'>
									{usage.used} / {usage.limit}
								</p>
								<p className='text-gray-500'>Words used this month</p>
								<p className='text-sm text-gray-400 mt-2'>
									Period: {new Date(usage.period_start).toLocaleDateString()} - {new Date(usage.period_end).toLocaleDateString()}
								</p>
							</CardContent>
						</Card>
						
						{/* Right box - Subscription */}
						<Card>
							<CardHeader>
								<CardTitle>Subscription</CardTitle>
								<CardDescription>Your current plan</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div>
									<p className='text-2xl font-bold'>{usage.subscription} Plan</p>
									<p className='text-sm text-gray-500 capitalize'>Status: {usage.status}</p>
								</div>
								{(usage.subscription === 'Free' || usage.status !== 'active') && (
									<Button onClick={handleUpgradeSubscription}>
										{usage.subscription === 'Free' ? 'Upgrade Plan' : 'Manage Subscription'}
									</Button>
								)}
							</CardContent>
						</Card>
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