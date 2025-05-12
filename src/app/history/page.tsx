import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from '@/lib/database.types'
import Link from 'next/link'
import { HistoryItem } from '@/components/history-item'

export default async function HistoryPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  const { data: humanizations } = await supabase
    .from('humanization_history')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className='min-h-screen flex flex-col items-center'>
      <div className='container mx-auto px-4 py-12 flex-1'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-3xl font-bold mb-8'>Your Humanization History</h1>
          
          <div className='space-y-4'>
            {humanizations?.map((item) => (
              <HistoryItem key={item.id} item={item} />
            ))}

            {humanizations?.length === 0 && (
              <div className='text-center py-12 text-gray-500'>
                No humanization history yet. Try humanizing some text!
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className='w-full py-4 border-t'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-center items-center space-x-4'>
            <Link href='/pricing' className='text-sm hover:underline'>
              Pricing
            </Link>
            <Link href='mailto:help@studydrop.io' className='text-sm hover:underline'>
              Contact
            </Link>
            <Link href='/privacy' className='text-sm hover:underline'>
              Privacy Policy
            </Link>
            <Link href='/terms' className='text-sm hover:underline'>
              Terms of Service
            </Link>
          </div>
          <p className='text-center text-sm mt-2'>
            © {new Date().getFullYear()} StudyDrop Humanizer
          </p>
        </div>
      </footer>
    </main>
  )
} 