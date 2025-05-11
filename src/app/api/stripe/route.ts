import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2025-04-30.basil',
})

export async function POST(request: Request) {
	try {
		const supabase = createRouteHandlerClient({ cookies })
		const { data: { session } } = await supabase.auth.getSession()

		if (!session || !session.user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			)
		}

		const body = await request.json()
		const { priceId } = body

		if (!priceId) {
			return NextResponse.json(
				{ error: 'Price ID is required' },
				{ status: 400 }
			)
		}

		// Create a checkout session
		const stripeSession = await stripe.checkout.sessions.create({
			customer_email: session.user.email!,
			client_reference_id: session.user.id,
			mode: 'subscription',
			payment_method_types: ['card'],
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			subscription_data: {
				metadata: {
					userId: session.user.id,
				},
			},
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
			metadata: {
				userId: session.user.id,
			},
		})

		return NextResponse.json({ url: stripeSession.url })
	} catch (error) {
		console.error('Error creating checkout session:', error)
		return NextResponse.json(
			{ error: 'Failed to create checkout session' },
			{ status: 500 }
		)
	}
} 