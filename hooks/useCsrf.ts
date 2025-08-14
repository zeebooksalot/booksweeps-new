'use client'

import { useState, useCallback } from 'react'

interface UseCsrfReturn {
  csrfToken: string | null
  fetchWithCsrf: (url: string, options?: RequestInit) => Promise<Response>
  isLoading: boolean
}

export function useCsrf(): UseCsrfReturn {
  const [isLoading, setIsLoading] = useState(false)
  
  // Since CSRF protection is disabled, we just return a dummy token
  const csrfToken = 'csrf-disabled'

  const fetchWithCsrf = useCallback(async (url: string, options: RequestInit = {}) => {
    setIsLoading(true)
    
    try {
      // Since CSRF is disabled, we just make a regular fetch
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          // No CSRF token needed since protection is disabled
        },
      })
      
      return response
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    csrfToken,
    fetchWithCsrf,
    isLoading,
  }
}
