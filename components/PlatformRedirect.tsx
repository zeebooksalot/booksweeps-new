'use client'

import { useUserType } from '@/hooks/useUserType'
import { useEffect, useState } from 'react'
import { shouldRedirectUser, getPlatformHosts } from '@/lib/config'

export function PlatformRedirect() {
  const { userType, loading } = useUserType()
  const [showSuggestion, setShowSuggestion] = useState(false)

  useEffect(() => {
    if (loading) return

    const hostname = window.location.hostname
    const hosts = getPlatformHosts()
    
    // Check if user should be redirected or shown suggestion
    const redirectCheck = shouldRedirectUser(userType, hostname)
    
    if (redirectCheck.shouldRedirect && redirectCheck.targetUrl) {
      window.location.href = redirectCheck.targetUrl
    } else if (redirectCheck.suggestion && redirectCheck.targetUrl) {
      setShowSuggestion(true)
    }
  }, [userType, loading])

  if (loading) {
    return <div>Loading...</div>
  }

  if (showSuggestion) {
    return (
      <div className="fixed top-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-sm z-50">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Author Platform Available
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>As an author, you have access to the dedicated author platform with additional tools.</p>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_AUTHOR_URL || 'https://app.booksweeps.com'}/dashboard`}
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
              >
                Go to Author Platform
              </button>
              <button
                onClick={() => setShowSuggestion(false)}
                className="text-blue-600 hover:text-blue-800 text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
