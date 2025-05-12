import { Humanizer } from '@/components/humanizer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
	return (
		<main className='min-h-screen flex flex-col items-center'>
			<div className='container mx-auto px-4 py-12 flex-1 flex flex-col items-center'>
				<div className='max-w-3xl w-full text-center mb-8'>
					<h2 className='text-4xl font-bold mb-4'>
						Make AI Content Undetectable in Seconds
					</h2>
					<p className='text-xl text-gray-600 mb-6'>
						Our advanced humanizer bypasses AI detection tools by transforming 
						computer-generated text into authentic, human-like writing 
					</p>
					
					<Button asChild className="text-2xl px-12 py-8 mb-8 rounded-xl">
						<Link href="/pricing">Humanize More</Link>
					</Button>
				</div>

				<Humanizer />
			</div>

			<footer className='w-full py-4 border-t'>
				<div className='container mx-auto px-4'>
					<div className='flex justify-center items-center space-x-4'>
						<a href='/pricing' className='text-sm hover:underline'>
							Pricing
						</a>
						<a href='mailto:help@studydrop.io' className='text-sm hover:underline'>
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
