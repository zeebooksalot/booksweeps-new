'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useEffect, useState } from 'react'
import { shouldRedirectUser, getPlatformHosts } from '@/lib/config/platform'
import { Info } from 'lucide-react'

export function PlatformRedirect() {
  const { user, userType, loading } = useAuth()
  const [showSuggestion, setShowSuggestion] = useState(false)

  useEffect(() => {
    if (loading || !userType) return

    const hostname = window.location.hostname
    const hosts = getPlatformHosts()
    
    // Check if user should be redirected
    const redirectCheck = shouldRedirectUser(userType, hostname)
    
    if (redirectCheck.shouldRedirect && redirectCheck.targetUrl) {
      window.location.href = redirectCheck.targetUrl
    }
    
    // Show suggestion for author users on main site
    if (userType === 'author' && hostname === hosts.mainSite) {
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
            <Info className="h-5 w-5 text-blue-400" />
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
