'use client'

import { useRouter } from 'next/navigation'
import { Database } from '@/lib/database.types'

type HistoryItemProps = {
  item: Database['public']['Tables']['humanization_history']['Row']
}

export function HistoryItem({ item }: HistoryItemProps) {
  const router = useRouter()

  const handleClick = () => {
    localStorage.setItem('studydrop_original_text', item.original_text)
    localStorage.setItem('studydrop_humanized_text', item.humanized_text)
    router.push('/')
  }

  return (
    <div
      onClick={handleClick}
      className='block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 cursor-pointer'
    >
      <div className='flex justify-between items-start mb-4'>
        <div className='flex items-center space-x-2'>
          <span className={`px-2 py-1 text-xs rounded ${
            item.status === 'completed' ? 'bg-green-100 text-green-800' :
            item.status === 'failed' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
          <span className='text-sm text-gray-500'>
            {new Date(item.created_at).toLocaleDateString()}
          </span>
        </div>
        <span className='text-sm text-gray-500'>
          {item.tokens_used} tokens
        </span>
      </div>

      <div className='space-y-2'>
        <div>
          <h3 className='text-sm font-medium text-gray-500'>Original Text</h3>
          <p className='text-gray-800 line-clamp-2'>{item.original_text}</p>
        </div>
        <div>
          <h3 className='text-sm font-medium text-gray-500'>Humanized Text</h3>
          <p className='text-gray-800 line-clamp-2'>{item.humanized_text}</p>
        </div>
      </div>
    </div>
  )
} 