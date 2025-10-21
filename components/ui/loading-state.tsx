'use client'

import { ReactNode } from 'react'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  isLoading: boolean
  error?: string | null
  retryCount?: number
  maxRetries?: number
  onRetry?: () => void
  onClearError?: () => void
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: ReactNode
  className?: string
  showRetryButton?: boolean
  retryButtonText?: string
  loadingText?: string
  errorText?: string
}

export function LoadingState({
  isLoading,
  error,
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  onClearError,
  children,
  fallback,
  errorFallback,
  className,
  showRetryButton = true,
  retryButtonText = 'Try Again',
  loadingText = 'Loading...',
  errorText = 'Something went wrong'
}: LoadingStateProps) {
  // Show error state
  if (error) {
    if (errorFallback) {
      return <>{errorFallback}</>
    }

    return (
      <div className={cn("flex flex-col items-center justify-center p-6", className)}>
        <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
          {errorText}
        </p>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mb-4 text-center">
            {error}
          </p>
        )}
        {showRetryButton && onRetry && retryCount < maxRetries && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {retryButtonText}
          </Button>
        )}
        {retryCount >= maxRetries && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Maximum retry attempts reached
          </p>
        )}
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className={cn("flex flex-col items-center justify-center p-6", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {loadingText}
        </p>
      </div>
    )
  }

  // Show content
  return <>{children}</>
}

interface SkeletonLoadingProps {
  count?: number
  className?: string
  variant?: 'default' | 'card' | 'list' | 'table'
}

export function SkeletonLoading({ 
  count = 3, 
  className,
  variant = 'default' 
}: SkeletonLoadingProps) {
  if (variant === 'card') {
    return (
      <div className={cn("grid gap-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/5" />
          </div>
        ))}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  )
}

interface AsyncContentProps<T> {
  data: T | null
  isLoading: boolean
  error?: string | null
  onRetry?: () => void
  children: (data: T) => ReactNode
  fallback?: ReactNode
  errorFallback?: ReactNode
  className?: string
}

export function AsyncContent<T>({
  data,
  isLoading,
  error,
  onRetry,
  children,
  fallback,
  errorFallback,
  className
}: AsyncContentProps<T>) {
  return (
    <LoadingState
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      fallback={fallback}
      errorFallback={errorFallback}
      className={className}
    >
      {data ? children(data) : null}
    </LoadingState>
  )
}

interface LoadingButtonProps {
  isLoading: boolean
  loadingText?: string
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function LoadingButton({
  isLoading,
  loadingText = 'Loading...',
  children,
  onClick,
  disabled,
  variant = 'default',
  size = 'default',
  className
}: LoadingButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
