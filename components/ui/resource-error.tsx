'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

interface ResourceErrorProps {
  error: string | null
  onRetry?: () => void
  className?: string
}

export function ResourceError({ error, onRetry, className = '' }: ResourceErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  if (!error) return null

  const handleRetry = async () => {
    if (!onRetry) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>System Resources Unavailable</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{error}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            Refresh Page
          </Button>
        </div>
        <p className="text-xs mt-2 opacity-75">
          If the problem persists, try closing other browser tabs or restarting your browser.
        </p>
      </AlertDescription>
    </Alert>
  )
}
