import { Humanizer } from '@/components/humanizer'

export default function Home() {
	return (
		<main className='min-h-screen flex flex-col items-center'>
			<div className='container mx-auto px-4 py-12 flex-1 flex flex-col items-center'>
				<div className='max-w-3xl w-full text-center mb-12'>
					<h2 className='text-4xl font-bold mb-4'>
						Humanize AI Text & Outsmart AI Detectors
					</h2>
					<p className='text-xl text-gray-600'>
						Transform AI-generated content into natural human-like text with
						our advanced humanizing technology.
					</p>
				</div>

				<Humanizer />
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
