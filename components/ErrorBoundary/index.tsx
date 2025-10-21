'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  context?: 'auth' | 'dashboard' | 'giveaways' | 'authors' | 'books' | 'general'
  showRetry?: boolean
  showHome?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({ errorInfo })
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { context = 'general', showRetry = true, showHome = true } = this.props
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {this.getContextTitle(context)}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {this.getContextDescription(context)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-sm text-gray-500">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                {showRetry && (
                  <Button 
                    onClick={this.handleRetry}
                    className="flex items-center gap-2"
                    variant="default"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                )}
                
                {showHome && (
                  <Button 
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Go Home
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }

  private getContextTitle(context: string): string {
    const titles = {
      auth: 'Authentication Error',
      dashboard: 'Dashboard Error',
      giveaways: 'Giveaway Error',
      authors: 'Author Page Error',
      books: 'Book Page Error',
      general: 'Something went wrong'
    }
    return titles[context as keyof typeof titles] || titles.general
  }

  private getContextDescription(context: string): string {
    const descriptions = {
      auth: 'There was a problem with the authentication system. Please try again.',
      dashboard: 'We encountered an error loading your dashboard. Please refresh the page.',
      giveaways: 'There was an error loading the giveaway. Please try again.',
      authors: 'We had trouble loading the author information. Please refresh the page.',
      books: 'There was an error loading the book details. Please try again.',
      general: 'An unexpected error occurred. Please try refreshing the page.'
    }
    return descriptions[context as keyof typeof descriptions] || descriptions.general
  }
}

// Specialized error boundaries for different contexts
export const AuthErrorBoundary = ({ children, ...props }: Omit<ErrorBoundaryProps, 'context'>) => (
  <ErrorBoundary context="auth" {...props}>
    {children}
  </ErrorBoundary>
)

export const DashboardErrorBoundary = ({ children, ...props }: Omit<ErrorBoundaryProps, 'context'>) => (
  <ErrorBoundary context="dashboard" {...props}>
    {children}
  </ErrorBoundary>
)

export const GiveawayErrorBoundary = ({ children, ...props }: Omit<ErrorBoundaryProps, 'context'>) => (
  <ErrorBoundary context="giveaways" {...props}>
    {children}
  </ErrorBoundary>
)

export const AuthorErrorBoundary = ({ children, ...props }: Omit<ErrorBoundaryProps, 'context'>) => (
  <ErrorBoundary context="authors" {...props}>
    {children}
  </ErrorBoundary>
)

export const BookErrorBoundary = ({ children, ...props }: Omit<ErrorBoundaryProps, 'context'>) => (
  <ErrorBoundary context="books" {...props}>
    {children}
  </ErrorBoundary>
)

// Hook for error boundary integration
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error)
    
    // You can add error reporting here
    // e.g., send to error tracking service
  }

  return { handleError }
}

export default ErrorBoundary
