'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

interface UseCsrfReturn {
  csrfToken: string | null
  fetchWithCsrf: (url: string, options?: RequestInit) => Promise<Response>
  isLoading: boolean
  error: string | null
}

export function useCsrf(): UseCsrfReturn {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, sessionEstablished } = useAuth()

  // Generate CSRF token when user is authenticated
  useEffect(() => {
    const generateToken = async () => {
      if (!sessionEstablished || !user) {
        setCsrfToken(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/csrf/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to generate CSRF token')
        }

        const data = await response.json()
        setCsrfToken(data.token)
      } catch (err) {
        console.error('CSRF token generation error:', err)
        setError(err instanceof Error ? err.message : 'Failed to generate CSRF token')
        setCsrfToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    generateToken()
  }, [user, sessionEstablished])

  const fetchWithCsrf = useCallback(async (url: string, options: RequestInit = {}) => {
    setIsLoading(true)
    
    try {
      // Add CSRF token to headers if available
      const headers: Record<string, string> = {
        ...options.headers as Record<string, string>,
      }

      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })
      
      return response
    } catch (err) {
      console.error('CSRF fetch error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [csrfToken])

  return {
    csrfToken,
    fetchWithCsrf,
    isLoading,
    error,
  }
}
