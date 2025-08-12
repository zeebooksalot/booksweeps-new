import { useState, useCallback, useRef } from 'react'

interface LoadingState {
  isLoading: boolean
  error: string | null
  retryCount: number
  lastRetryTime: number | null
}

interface UseLoadingStateOptions {
  maxRetries?: number
  retryDelay?: number
  onError?: (error: string) => void
  onSuccess?: () => void
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onSuccess
  } = options

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    lastRetryTime: null
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ 
      ...prev, 
      error, 
      isLoading: false,
      lastRetryTime: error ? Date.now() : null
    }))
    
    if (error && onError) {
      onError(error)
    }
  }, [onError])

  const clearError = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      error: null,
      retryCount: 0,
      lastRetryTime: null
    }))
  }, [])

  const retry = useCallback(async (operation: () => Promise<void>) => {
    if (state.retryCount >= maxRetries) {
      setError(`Maximum retry attempts (${maxRetries}) exceeded`)
      return
    }

    setState(prev => ({ 
      ...prev, 
      retryCount: prev.retryCount + 1,
      isLoading: true,
      error: null
    }))

    try {
      await operation()
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        retryCount: 0,
        lastRetryTime: null
      }))
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
    }
  }, [state.retryCount, maxRetries, setError, onSuccess])

  const executeWithRetry = useCallback(async (operation: () => Promise<void>) => {
    clearError()
    setLoading(true)

    try {
      await operation()
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        retryCount: 0,
        lastRetryTime: null
      }))
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
    }
  }, [clearError, setLoading, setError, onSuccess])

  const executeWithDelay = useCallback(async (operation: () => Promise<void>, delay: number = retryDelay) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      await executeWithRetry(operation)
    }, delay)
  }, [executeWithRetry, retryDelay])

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setState({
      isLoading: false,
      error: null,
      retryCount: 0,
      lastRetryTime: null
    })
  }, [])

  return {
    isLoading: state.isLoading,
    error: state.error,
    retryCount: state.retryCount,
    lastRetryTime: state.lastRetryTime,
    setLoading,
    setError,
    clearError,
    retry,
    executeWithRetry,
    executeWithDelay,
    reset,
    canRetry: state.retryCount < maxRetries,
    hasError: !!state.error
  }
}

// Specialized hooks for common use cases
export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  options: UseLoadingStateOptions = {}
) {
  const loadingState = useLoadingState(options)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async () => {
    try {
      const result = await operation()
      setData(result)
      return result
    } catch (error) {
      throw error
    }
  }, [operation])

  const executeWithLoading = useCallback(async () => {
    await loadingState.executeWithRetry(async () => {
      await execute()
    })
    return data
  }, [loadingState, execute, data])

  return {
    ...loadingState,
    data,
    setData,
    execute: executeWithLoading
  }
}

export function usePolling<T>(
  operation: () => Promise<T>,
  interval: number = 5000,
  options: UseLoadingStateOptions = {}
) {
  const loadingState = useLoadingState(options)
  const [data, setData] = useState<T | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const poll = async () => {
      try {
        const result = await operation()
        setData(result)
        loadingState.clearError()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Polling failed'
        loadingState.setError(errorMessage)
      }
    }

    // Initial call
    poll()
    
    // Set up interval
    intervalRef.current = setInterval(poll, interval)
  }, [operation, interval, loadingState])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  return {
    ...loadingState,
    data,
    setData,
    startPolling,
    stopPolling,
    isPolling: !!intervalRef.current
  }
}
