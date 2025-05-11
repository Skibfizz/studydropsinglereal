import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription & {
          current_period_start: number;
          current_period_end: number;
        }
        const customerId = subscription.customer as string
        const userId = subscription.metadata.userId
        const status = subscription.status
        const priceId = subscription.items.data[0].price.id

        // Debug logging
        console.log('Processing subscription webhook:', {
          eventType: event.type,
          customerId,
          userId,
          status,
          priceId,
          metadata: subscription.metadata,
          items: subscription.items.data
        })

        // Map price ID to plan type
        let planType = 'free'
        // Production mode monthly price IDs
        if (priceId === 'price_1RNekUHgxuRkr4erU5JAMHDW') planType = 'beginner'
        else if (priceId === 'price_1RNekWHgxuRkr4erYHsBIi8J') planType = 'pro'
        else if (priceId === 'price_1RNekaHgxuRkr4erxRTzT4wB') planType = 'ultimate'
        // Production mode annual price IDs
        else if (priceId === 'price_1RNgs0HgxuRkr4er2mlEkigH') planType = 'beginner'
        else if (priceId === 'price_1RNgs5HgxuRkr4erHAS3knLs') planType = 'ultimate'
        // Legacy test mode price IDs (keeping for backward compatibility)
        else if (priceId === 'price_1RNdxFHgxuRkr4ermKL0dGiZ') planType = 'beginner'
        else if (priceId === 'price_1RNdxQHgxuRkr4er81wRoSKX') planType = 'pro'
        else if (priceId === 'price_1RNdxaHgxuRkr4erBYHrE4gz') planType = 'ultimate'

        console.log('Mapped plan type:', planType)

        // Add created_at if not exists
        const subscriptionData = {
          id: crypto.randomUUID(),
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          plan_type: planType,
          status: status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }

        console.log('Attempting to upsert subscription data:', subscriptionData)

        // Update subscription in database using service role client
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert(subscriptionData)

        if (upsertError) {
          console.error('Error upserting subscription:', {
            error: upsertError,
            details: upsertError.details,
            hint: upsertError.hint,
            code: upsertError.code
          })
          throw upsertError
        }

        console.log('Successfully upserted subscription')
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription status to canceled
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Error updating subscription:', updateError)
          throw updateError
        }

        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription: string | null;
        }
        const subscriptionId = invoice.subscription?.toString()
        
        if (subscriptionId) {
          // Update subscription status to active
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscriptionId)

          if (updateError) {
            console.error('Error updating subscription:', updateError)
            throw updateError
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription: string | null;
        }
        const subscriptionId = invoice.subscription?.toString()

        if (subscriptionId) {
          // Update subscription status to past_due
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscriptionId)

          if (updateError) {
            console.error('Error updating subscription:', updateError)
            throw updateError
          }
        }

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
} 