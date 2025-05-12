import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Properly await cookies
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch subscription data for the user
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    // Log the query results for debugging
    console.log('Subscription query results:', {
      userId: session.user.id,
      subscription,
      error: subscriptionError
    })

    // Don't treat missing subscription as an error - new users won't have one
    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subscriptionError)
      return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
    }

    // Calculate usage limits based on plan type
    let limit = 250 // Default free tier limit (words)
    if (subscription?.plan_type === 'beginner') limit = 5000
    else if (subscription?.plan_type === 'pro') limit = 25000
    else if (subscription?.plan_type === 'ultimate') limit = 100000

    // For new users or those without a subscription, return free tier defaults
    const defaultSubscription = { plan_type: 'free', status: 'active' }

    // Get current word count usage for the current period
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    const { data: usageData, error: usageError } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('period_start', startOfMonth)
      .lte('period_end', endOfMonth)
      .single()

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error fetching usage:', usageError)
      return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
    }

    // If no current period exists, create one
    if (!usageData) {
      const { error: createError } = await supabase
        .from('usage_limits')
        .insert({
          user_id: session.user.id,
          word_count: 0,
          max_words_allowed: limit,
          period_start: startOfMonth,
          period_end: endOfMonth,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })

      if (createError) {
        console.error('Error creating usage period:', createError)
        return NextResponse.json({ error: 'Failed to initialize usage tracking' }, { status: 500 })
      }
    } 
    // If user is on free tier and max_words_allowed is not 250, update it
    else if ((!subscription || subscription?.plan_type === 'free') && 
             usageData && 
             typeof usageData.max_words_allowed === 'number' && 
             usageData.max_words_allowed !== 250) {
      console.log('Updating word limit for free tier user:', {
        userId: session.user.id,
        currentLimit: usageData.max_words_allowed,
        newLimit: 250
      })
      
      const { error: updateError } = await supabase
        .from('usage_limits')
        .update({
          max_words_allowed: 250,
          updated_at: now.toISOString()
        })
        .eq('id', usageData.id)

      if (updateError) {
        console.error('Error updating word limit:', updateError)
      }
    }

    return NextResponse.json({
      subscription: subscription || defaultSubscription,
      usage: {
        used: usageData?.word_count || 0,
        limit,
        period_start: startOfMonth,
        period_end: endOfMonth
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 