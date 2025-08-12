'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-md w-full rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">An unexpected error occurred. You can try again.</p>
        <div className="flex gap-3">
          <button
            className="h-10 px-4 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
            onClick={() => reset()}
          >
            Try again
          </button>
          <Link href="/" className="h-10 px-4 rounded-full border-2 border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-orange-500 flex items-center">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}