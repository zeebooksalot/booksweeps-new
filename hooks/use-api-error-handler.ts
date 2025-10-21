'use client'

import { useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useLoadingState } from '@/hooks/use-loading-state'

interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

interface UseApiErrorHandlerOptions {
  showToast?: boolean
  maxRetries?: number
  retryDelay?: number
  onError?: (error: ApiError) => void
  onSuccess?: () => void
}

export function useApiErrorHandler(options: UseApiErrorHandlerOptions = {}) {
  const {
    showToast = true,
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onSuccess
  } = options

  const { toast } = useToast()
  const loadingState = useLoadingState({ 
    maxRetries, 
    retryDelay, 
    onError: onError ? (error: string) => onError({ message: error, status: 500 }) : undefined, 
    onSuccess 
  })

  const handleError = useCallback((error: any) => {
    let apiError: ApiError

    // Parse different error formats
    if (error?.response?.data) {
      // Axios-style error
      apiError = {
        message: error.response.data.message || error.response.data.error || 'Request failed',
        status: error.response.status,
        code: error.response.data.code,
        details: error.response.data.details
      }
    } else if (error?.message) {
      // Standard Error object
      apiError = {
        message: error.message,
        status: error.status,
        code: error.code,
        details: error.details
      }
    } else if (typeof error === 'string') {
      // String error
      apiError = {
        message: error,
        status: 500
      }
    } else {
      // Unknown error
      apiError = {
        message: 'An unexpected error occurred',
        status: 500
      }
    }

    // Show toast notification
    if (showToast) {
      const isNetworkError = apiError.status === 0 || apiError.status === undefined
      const isServerError = apiError.status && apiError.status >= 500
      const isClientError = apiError.status && apiError.status >= 400 && apiError.status < 500

      if (isNetworkError) {
        toast({
          title: 'Connection Error',
          description: 'Unable to connect to the server. Please check your internet connection.',
          variant: 'destructive'
        })
      } else if (isServerError) {
        toast({
          title: 'Server Error',
          description: 'Something went wrong on our end. We\'re working to fix it.',
          variant: 'destructive'
        })
      } else if (isClientError) {
        toast({
          title: 'Request Failed',
          description: apiError.message,
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Error',
          description: apiError.message,
          variant: 'destructive'
        })
      }
    }

    // Call custom error handler
    if (onError) {
      onError(apiError)
    }

    // Set error in loading state
    loadingState.setError(apiError.message)

    return apiError
  }, [toast, showToast, onError, loadingState])

  const handleSuccess = useCallback(() => {
    if (showToast) {
      toast({
        title: 'Success',
        description: 'Operation completed successfully',
        variant: 'default'
      })
    }

    if (onSuccess) {
      onSuccess()
    }

    loadingState.clearError()
  }, [toast, showToast, onSuccess, loadingState])

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    try {
      loadingState.setLoading(true)
      const result = await operation()
      
      if (successMessage && showToast) {
        toast({
          title: 'Success',
          description: successMessage,
          variant: 'default'
        })
      }
      
      loadingState.clearError()
      return result
    } catch (error) {
      handleError(error)
      return null
    } finally {
      loadingState.setLoading(false)
    }
  }, [loadingState, handleError, showToast, toast])

  const retryWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    return executeWithErrorHandling(operation)
  }, [executeWithErrorHandling])

  return {
    ...loadingState,
    handleError,
    handleSuccess,
    executeWithErrorHandling,
    retryWithErrorHandling
  }
}

// Specialized hook for API calls with automatic error handling
export function useApiCall<T>(
  apiCall: () => Promise<T>,
  options: UseApiErrorHandlerOptions = {}
) {
  const errorHandler = useApiErrorHandler(options)

  const execute = useCallback(async (): Promise<T | null> => {
    return errorHandler.executeWithErrorHandling(apiCall)
  }, [errorHandler, apiCall])

  const retry = useCallback(async (): Promise<T | null> => {
    return errorHandler.retryWithErrorHandling(apiCall)
  }, [errorHandler, apiCall])

  return {
    ...errorHandler,
    execute,
    retry
  }
}

// Hook for handling multiple API calls
export function useBatchApiCalls<T>(
  apiCalls: (() => Promise<T>)[],
  options: UseApiErrorHandlerOptions = {}
) {
  const errorHandler = useApiErrorHandler(options)

  const executeAll = useCallback(async (): Promise<(T | null)[]> => {
    const results = await Promise.allSettled(
      apiCalls.map(call => errorHandler.executeWithErrorHandling(call))
    )

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : null
    )
  }, [errorHandler, apiCalls])

  const executeSequential = useCallback(async (): Promise<(T | null)[]> => {
    const results: (T | null)[] = []
    
    for (const call of apiCalls) {
      const result = await errorHandler.executeWithErrorHandling(call)
      results.push(result)
    }
    
    return results
  }, [errorHandler, apiCalls])

  return {
    ...errorHandler,
    executeAll,
    executeSequential
  }
}
