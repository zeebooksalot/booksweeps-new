/**
 * Shared error handling utilities
 * Provides consistent error creation, logging, and handling patterns
 */

export interface ErrorContext {
  userId?: string
  requestId?: string
  timestamp?: Date
  metadata?: Record<string, unknown>
}

export interface ErrorOptions {
  context?: ErrorContext
  cause?: Error
  code?: string
  statusCode?: number
}

/**
 * Custom error classes for different error types
 */
export class ValidationError extends Error {
  public readonly code = 'VALIDATION_ERROR'
  public readonly statusCode = 400
  public readonly context?: ErrorContext

  constructor(message: string, options?: ErrorOptions) {
    super(message)
    this.name = 'ValidationError'
    this.context = options?.context
  }
}

export class SecurityError extends Error {
  public readonly code = 'SECURITY_ERROR'
  public readonly statusCode = 403
  public readonly context?: ErrorContext

  constructor(message: string, options?: ErrorOptions) {
    super(message)
    this.name = 'SecurityError'
    this.context = options?.context
  }
}

export class RateLimitError extends Error {
  public readonly code = 'RATE_LIMIT_ERROR'
  public readonly statusCode = 429
  public readonly context?: ErrorContext

  constructor(message: string, options?: ErrorOptions) {
    super(message)
    this.name = 'RateLimitError'
    this.context = options?.context
  }
}

export class DatabaseError extends Error {
  public readonly code = 'DATABASE_ERROR'
  public readonly statusCode = 500
  public readonly context?: ErrorContext

  constructor(message: string, options?: ErrorOptions) {
    super(message)
    this.name = 'DatabaseError'
    this.context = options?.context
  }
}

export class ConfigurationError extends Error {
  public readonly code = 'CONFIGURATION_ERROR'
  public readonly statusCode = 500
  public readonly context?: ErrorContext

  constructor(message: string, options?: ErrorOptions) {
    super(message)
    this.name = 'ConfigurationError'
    this.context = options?.context
  }
}

/**
 * Error logging utility
 */
export function logError(error: Error, context?: ErrorContext): void {
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error occurred:', errorInfo)
  } else {
    // In production, you might want to send to external logging service
    console.error('Error occurred:', {
      name: error.name,
      message: error.message,
      timestamp: errorInfo.timestamp,
      context
    })
  }
}

/**
 * Safe error handling wrapper
 */
export function safeExecute<T>(
  fn: () => T | Promise<T>,
  fallback?: T,
  context?: ErrorContext
): T | undefined {
  try {
    const result = fn()
    if (result instanceof Promise) {
      return result.catch((error) => {
        logError(error, context)
        return fallback
      }) as T
    }
    return result
  } catch (error) {
    logError(error as Error, context)
    return fallback
  }
}

/**
 * Async safe error handling wrapper
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallback?: T,
  context?: ErrorContext
): Promise<T | undefined> {
  try {
    return await fn()
  } catch (error) {
    logError(error as Error, context)
    return fallback
  }
}

/**
 * Error response formatter
 */
export function formatErrorResponse(error: Error, includeStack = false) {
  const baseResponse = {
    error: error.name,
    message: error.message,
    timestamp: new Date().toISOString()
  }

  if (includeStack && process.env.NODE_ENV === 'development') {
    return {
      ...baseResponse,
      stack: error.stack
    }
  }

  return baseResponse
}

/**
 * Type guard for custom errors
 */
export function isCustomError(error: unknown): error is ValidationError | SecurityError | RateLimitError | DatabaseError | ConfigurationError {
  return error instanceof ValidationError ||
         error instanceof SecurityError ||
         error instanceof RateLimitError ||
         error instanceof DatabaseError ||
         error instanceof ConfigurationError
}

/**
 * Get error status code
 */
export function getErrorStatusCode(error: Error): number {
  if (isCustomError(error)) {
    return error.statusCode
  }
  
  // Default status codes for common errors
  if (error.name === 'ValidationError') return 400
  if (error.name === 'SecurityError') return 403
  if (error.name === 'RateLimitError') return 429
  if (error.name === 'DatabaseError') return 500
  if (error.name === 'ConfigurationError') return 500
  
  return 500
}
