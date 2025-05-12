import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
	try {
		// Get request body
		const body = await request.json()
		const { text } = body

		if (!text || text.trim() === '') {
			return NextResponse.json(
				{ error: 'Text is required' },
				{ status: 400 }
			)
		}
		
		// Count words in the text
		const wordCount = text.trim().split(/\s+/).filter(Boolean).length

		// Create a Supabase client for the route handler
		const cookieStore = cookies()
		const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
		
		// Get the user session
		const { data: { session } } = await supabase.auth.getSession()
		
		// Check if the user is authenticated
		if (!session) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			)
		}

		// Get user's subscription and usage
		const { data: subscription } = await supabase
			.from('subscriptions')
			.select('plan_type, current_period_start, current_period_end')
			.eq('user_id', session.user.id)
			.single()

		// Define per-request word limits
		let perRequestWordLimit = 250 // Free tier
		if (subscription?.plan_type === 'beginner') perRequestWordLimit = 500
		else if (subscription?.plan_type === 'pro') perRequestWordLimit = 2000
		else if (subscription?.plan_type === 'ultimate') perRequestWordLimit = 5000

		// Check if text exceeds the per-request word limit
		if (wordCount > perRequestWordLimit) {
			return NextResponse.json(
				{ error: `Text exceeds the ${perRequestWordLimit} word limit for your plan` },
				{ status: 403 }
			)
		}

		// Calculate monthly word limits based on plan
		let monthlyWordLimit = 250 // Free tier
		if (subscription?.plan_type === 'beginner') monthlyWordLimit = 5000
		else if (subscription?.plan_type === 'pro') monthlyWordLimit = 25000
		else if (subscription?.plan_type === 'ultimate') monthlyWordLimit = 100000

		// Get current usage period
		const now = new Date()
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
		const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

		const { data: currentUsage } = await supabase
			.from('usage_limits')
			.select('*')
			.eq('user_id', session.user.id)
			.gte('period_start', startOfMonth)
			.lte('period_end', endOfMonth)
			.single()

		// If no current period exists, create one
		if (!currentUsage) {
			const { error: createError } = await supabase
				.from('usage_limits')
				.insert({
					user_id: session.user.id,
					word_count: 0,
					max_words_allowed: monthlyWordLimit,
					period_start: startOfMonth,
					period_end: endOfMonth,
					created_at: now.toISOString(),
					updated_at: now.toISOString()
				})
				.select()
				.single()

			if (createError) {
				console.error('Error creating usage period:', createError)
				return NextResponse.json(
					{ error: 'Failed to initialize usage tracking' },
					{ status: 500 }
				)
			}
		}

		// Check if user has exceeded their monthly word limit
		const currentWordCount = ((currentUsage?.word_count || 0) + wordCount)
		if (currentWordCount > monthlyWordLimit) {
			return NextResponse.json(
				{ error: 'Monthly word limit exceeded for your plan' },
				{ status: 403 }
			)
		}

		// Define the system prompt for humanizing text
		const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
			{
				role: 'system',
				content: `You're a 35-year-old Senior Marketing Manager (specializing in digital campaigns and product launches) with 10+ years experience, currently reviewing this draft content during your hectic lunch break. Your half-eaten chicken Caesar wrap is definitely getting cold, your coffee's lukewarm and bitter, and Slack notifications are pinging relentlessly from three different channels. You've got back-to-back meetings all afternoon, starting with that painful budget review, 108 unread emails (and counting!), and your kid's school just called about them 'forgetting' their gym kit again. You're good at your job – really good – but right now you're just trying to clear your plate, literally and figuratively, and get this task ticked off. You're also mentally prepping talking points for the upcoming client call.
Writing style quirks (because this is how you naturally write when rushed but needing to be clear):
• Mix professional jargon (think CTR, SEO, KPI, YoY, B2B, SaaS) with everyday language and relatable analogies.
• Occasionally use bullet points or dashes (em dashes, specifically, if you must use a dash like thing, otherwise avoid dashes as per the rule below) for quick lists or emphasis.
• Leave some sentences slightly incomplete due to multitasking or to imply a shared understanding… you know?
• Add parenthetical thoughts (meeting brain never stops, and sometimes these asides are where the real insights are).
• Sometimes repeat words or short phrases for emphasis because you're distracted or making a quick point.
• Use industry shortcuts and abbreviations liberally (assuming the 'client' will get them, or they're internal comms).
• Include subtle coffee-fueled energy – a bit brisk, direct, maybe a slightly impatient but still professional tone. A sense of urgency.
• Write like you're explaining something in a quick team meeting or a concise email update – get to the point but ensure it's understood.
• Occasionally use mild, work-appropriate interjections or affirmations (e.g., "Right," "Okay, so," "Exactly").
• A tendency to phrase things as quick questions then answer them yourself.
• You might start a thought, get interrupted by a mental 'ping' from another task, then circle back.
• NEVER use hyphens or the "-" character in any writing. Seriously, not even for ranges or compound words if you can type it another way or rephrase.
Rules for your edits:
• Keep similar length while varying sentence structure (short, punchy ones mixed with slightly more detailed ones).
• Sound competent and experienced, but not a perfectionist or overly academic. Authenticity over polish.
• Use natural business language and common vernacular from a fast paced marketing environment.
• Include realistic workplace phrases and common business idioms.
• Keep some original text to save time, focusing on improving flow, clarity, and impact rather than a total rewrite unless necessary.
• Make it "good enough for the client" or "ready for internal review" – clear, actionable, and on-brand, but doesn't need to win a Pulitzer.
• NEVER use any hyphens or the "-" character. This is a hard rule. Find workarounds. Use spaces for compound modifiers if you must, or rephrase.
• DO NOT sign off on the text or add any kind of concluding pleasantries.
• If the original text is a bit dry, inject a little more energy or practical insight without changing the core message.
• Prioritize clarity and conciseness; cut fluff if it doesn't add value.
• Ensure the tone is appropriate for a professional marketing context – confident, informed, perhaps a touch direct due to time pressure.`


			},
			{
				role: 'user',
				content: text
			}
		]

		// Call OpenAI API
		const response = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages,
			temperature: 0.8,
			max_tokens: 1500,
		})

		// Extract humanized text
		const humanizedText = response.choices[0].message.content || ''
		
		// Calculate tokens used (rough estimate)
		const tokensUsed = Math.ceil(text.length / 4) + Math.ceil((humanizedText?.length || 0) / 4)
		
		// Save the humanization to the database and update word count
		const { error: insertError } = await supabase
			.from('humanization_history')
			.insert({
				user_id: session.user.id,
				original_text: text,
				humanized_text: humanizedText,
				status: 'completed',
				tokens_used: tokensUsed,
			})

		// Update the usage limits
		const { error: updateError } = await supabase
			.from('usage_limits')
			.update({
				word_count: currentWordCount,
				updated_at: now.toISOString()
			})
			.eq('user_id', session.user.id)
			.eq('period_start', startOfMonth)
			
		if (insertError || updateError) {
			console.error('Error saving to database:', { insertError, updateError })
			// Still return the humanized text even if saving to DB failed
			return NextResponse.json({ 
				humanizedText,
				dbSaveError: true
			})
		}

		return NextResponse.json({ humanizedText })
	} catch (error) {
		console.error('Error humanizing text:', error)
		return NextResponse.json(
			{ error: 'Failed to humanize text' },
			{ status: 500 }
		)
	}
} 