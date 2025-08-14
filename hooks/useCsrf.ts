import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

export function useCsrf() {
  const { user, sessionEstablished } = useAuth()
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Generate CSRF token when user is authenticated and session is established
  const generateToken = useCallback(async () => {
    if (!user?.id || !sessionEstablished) {
      setCsrfToken(null)
      return
    }

    // Check browser compatibility for Web Crypto API
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('Web Crypto API not supported in this browser')
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
        console.warn('Failed to generate CSRF token:', response.status, response.statusText)
        // Don't set error state - just retry later
        setCsrfToken(null)
      }
    } catch (error) {
      console.warn('Error generating CSRF token:', error)
      // Don't set error state - just retry later
      setCsrfToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, sessionEstablished])

  // Generate token when user and session are established
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    
    if (user && sessionEstablished) {
      // Add a small delay to ensure session is fully propagated
      timeoutId = setTimeout(() => {
        generateToken()
      }, 100)
    } else {
      setCsrfToken(null)
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [user, sessionEstablished, generateToken])

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
