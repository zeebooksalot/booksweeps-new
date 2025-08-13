import { useState, useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthProvider-refactored'
import { useCsrf } from './useCsrf'

interface ApiResponse<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>() {
  const { user } = useAuth()
  const { fetchWithCsrf } = useCsrf()
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    loading: false,
    error: null
  })

  const fetchData = useCallback(async (url: string, options?: RequestInit) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // Use CSRF-protected fetch for authenticated users, regular fetch for public endpoints
      const response = user ? await fetchWithCsrf(url, options) : await fetch(url, options)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      setState({ data: null, loading: false, error: errorMessage })
      throw error
    }
  }, [user, fetchWithCsrf])

  return { ...state, fetchData }
} 