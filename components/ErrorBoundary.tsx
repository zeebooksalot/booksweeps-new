// Re-export from the unified error boundary system
export { 
  ErrorBoundary as default,
  AuthErrorBoundary,
  DashboardErrorBoundary,
  GiveawayErrorBoundary,
  AuthorErrorBoundary,
  BookErrorBoundary,
  useErrorHandler
} from './ErrorBoundary/index'

// Named export for ErrorBoundary
export { ErrorBoundary } from './ErrorBoundary/index'