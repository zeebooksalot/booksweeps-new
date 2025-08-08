import { useState, useCallback, useRef } from 'react'

interface ApiResponse<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    loading: false,
    error: null
  })

  // Use useRef to store the setState function to avoid dependency issues
  const setStateRef = useRef(setState)
  setStateRef.current = setState

  const fetchData = useCallback(async (url: string, options?: RequestInit) => {
    setStateRef.current(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch(url, options)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      
      setStateRef.current({ data, loading: false, error: null })
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      setStateRef.current({ data: null, loading: false, error: errorMessage })
      throw error
    }
  }, [])

  return { ...state, fetchData }
} 