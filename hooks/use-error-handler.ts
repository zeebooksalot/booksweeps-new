'use client'

import { useCallback, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  onError?: (error: Error) => void
}

interface ErrorState {
  error: string | null
  hasError: boolean
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    showToast = true,
    logError = true,
    onError
  } = options

  const { toast } = useToast()
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasError: false
  })

  const handleError = useCallback((error: unknown, context?: string) => {
    let errorMessage: string
    let errorObj: Error

    // Parse different error formats
    if (error instanceof Error) {
      errorMessage = error.message
      errorObj = error
    } else if (typeof error === 'string') {
      errorMessage = error
      errorObj = new Error(error)
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message
      errorObj = new Error(errorMessage)
    } else {
      errorMessage = 'An unexpected error occurred'
      errorObj = new Error(errorMessage)
    }

    // Add context if provided
    if (context) {
      errorMessage = `${context}: ${errorMessage}`
    }

    // Log error if enabled
    if (logError) {
      console.error('Hook Error:', {
        message: errorMessage,
        context,
        error: errorObj
      })
    }

    // Show toast if enabled
    if (showToast) {
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    }

    // Update error state
    setErrorState({
      error: errorMessage,
      hasError: true
    })

    // Call custom error handler
    if (onError) {
      onError(errorObj)
    }

    return errorMessage
  }, [showToast, logError, onError, toast])

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      hasError: false
    })
  }, [])

  const handleAsyncError = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      const result = await operation()
      clearError()
      return result
    } catch (error) {
      handleError(error, context)
      return null
    }
  }, [handleError, clearError])

  return {
    ...errorState,
    handleError,
    clearError,
    handleAsyncError
  }
}

// Specialized hook for API errors
export function useApiErrorHandler(options: ErrorHandlerOptions = {}) {
  const errorHandler = useErrorHandler(options)

  const handleApiError = useCallback((error: unknown, endpoint?: string) => {
    const context = endpoint ? `API Error (${endpoint})` : 'API Error'
    return errorHandler.handleError(error, context)
  }, [errorHandler])

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint?: string
  ): Promise<T | null> => {
    const context = endpoint ? `API Call (${endpoint})` : 'API Call'
    return errorHandler.handleAsyncError(apiCall, context)
  }, [errorHandler])

  return {
    ...errorHandler,
    handleApiError,
    handleApiCall
  }
}

// Hook for form validation errors
export function useFormErrorHandler(options: ErrorHandlerOptions = {}) {
  const errorHandler = useErrorHandler(options)

  const handleValidationError = useCallback((field: string, message: string) => {
    const context = `Validation Error (${field})`
    return errorHandler.handleError(new Error(message), context)
  }, [errorHandler])

  const handleSubmitError = useCallback((error: unknown, formName?: string) => {
    const context = formName ? `Form Submit Error (${formName})` : 'Form Submit Error'
    return errorHandler.handleError(error, context)
  }, [errorHandler])

  return {
    ...errorHandler,
    handleValidationError,
    handleSubmitError
  }
}
