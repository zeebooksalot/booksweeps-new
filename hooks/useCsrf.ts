import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthProvider-refactored'

export function useCsrf() {
  const { user } = useAuth()
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Generate CSRF token when user is authenticated
  const generateToken = useCallback(async () => {
    if (!user?.id) {
      setCsrfToken(null)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/csrf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setCsrfToken(data.token)
      } else {
        console.error('Failed to generate CSRF token:', response.status, response.statusText)
        setCsrfToken(null)
      }
    } catch (error) {
      console.error('Error generating CSRF token:', error)
      setCsrfToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Generate token on mount and when user changes
  useEffect(() => {
    generateToken()
  }, [generateToken])

  // Add CSRF token to fetch requests
  const fetchWithCsrf = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    const headers = new Headers(options.headers)
    
    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken)
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    })
  }, [csrfToken])

  // Refresh CSRF token
  const refreshToken = useCallback(() => {
    generateToken()
  }, [generateToken])

  return {
    csrfToken,
    isLoading,
    fetchWithCsrf,
    refreshToken,
  }
}
