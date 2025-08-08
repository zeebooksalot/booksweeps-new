"use client"

import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  title?: string
  message?: string
  error?: Error | string | null
  onRetry?: () => void
  onGoHome?: () => void
  onGoBack?: () => void
  showDetails?: boolean
  className?: string
  variant?: "default" | "compact" | "full"
}

export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
  error,
  onRetry,
  onGoHome,
  onGoBack,
  showDetails = false,
  className,
  variant = "default"
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (variant === "full") {
    return (
      <div className={cn("min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900", className)}>
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {message}
            </p>
            
            {errorMessage && showDetails && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 mb-2">
                  Error details
                </summary>
                <pre className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded overflow-auto">
                  {errorMessage}
                </pre>
              </details>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              {onRetry && (
                <Button onClick={onRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              {onGoBack && (
                <Button onClick={onGoBack} variant="outline" className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              )}
              {onGoHome && (
                <Button onClick={onGoHome} variant="outline" className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        
        {errorMessage && showDetails && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 mb-2">
              Error details
            </summary>
            <pre className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded overflow-auto">
              {errorMessage}
            </pre>
          </details>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {onGoHome && (
            <Button onClick={onGoHome} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface NetworkErrorProps {
  onRetry?: () => void
  className?: string
}

export function NetworkError({ onRetry, className }: NetworkErrorProps) {
  return (
    <ErrorState
      title="Network Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      className={className}
    />
  )
}

interface NotFoundErrorProps {
  title?: string
  message?: string
  onGoHome?: () => void
  className?: string
}

export function NotFoundError({ 
  title = "Page Not Found", 
  message = "The page you're looking for doesn't exist.",
  onGoHome,
  className 
}: NotFoundErrorProps) {
  return (
    <ErrorState
      title={title}
      message={message}
      onGoHome={onGoHome}
      className={className}
    />
  )
}

interface ServerErrorProps {
  onRetry?: () => void
  className?: string
}

export function ServerError({ onRetry, className }: ServerErrorProps) {
  return (
    <ErrorState
      title="Server Error"
      message="Something went wrong on our end. We're working to fix it."
      onRetry={onRetry}
      className={className}
    />
  )
}
