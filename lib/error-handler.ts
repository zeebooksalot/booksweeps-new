import { NextRequest, NextResponse } from 'next/server'
import { ValidationError, SecurityError } from './validation'

// Error types for categorization
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  SECURITY = 'SECURITY',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  DATABASE = 'DATABASE',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  INTERNAL = 'INTERNAL',
  UNKNOWN = 'UNKNOWN'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Error context for logging
export interface ErrorContext {
  requestId?: string
  userId?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  method?: string
  timestamp?: string
  requestBody?: unknown
  queryParams?: Record<string, unknown>
  sessionId?: string
  correlationId?: string
  requestDuration?: number
  userType?: string
  platform?: string
}

// Sanitized error response
export interface SanitizedError {
  type: ErrorType
  message: string
  code?: string
  details?: Record<string, unknown>
  retryAfter?: number
}

// Internal error for logging
export interface InternalError {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  originalError: unknown
  context: ErrorContext
  stack?: string
  timestamp: string
  correlationId: string
  sessionId?: string
}

// External logging service interface
interface ExternalLoggingService {
  captureException(error: InternalError): Promise<void>
  captureMessage(message: string, level: 'info' | 'warn' | 'error', context?: Record<string, unknown>): Promise<void>
  setUser(userId: string, userData?: Record<string, unknown>): void
  setTag(key: string, value: string): void
}

// Simple console-based external logging service
class ConsoleLoggingService implements ExternalLoggingService {
  async captureException(error: InternalError): Promise<void> {
    const logEntry = {
      timestamp: error.timestamp,
      correlationId: error.correlationId,
      sessionId: error.sessionId,
      type: error.type,
      severity: error.severity,
      message: error.message,
      context: error.context,
      stack: error.stack
    }
    
    console.error('🚨 EXTERNAL LOGGING - Exception:', JSON.stringify(logEntry, null, 2))
  }
  
  async captureMessage(message: string, level: 'info' | 'warn' | 'error', context?: Record<string, unknown>): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    }
    
    switch (level) {
      case 'error':
        console.error('🔴 EXTERNAL LOGGING - Error:', JSON.stringify(logEntry, null, 2))
        break
      case 'warn':
        console.warn('🟡 EXTERNAL LOGGING - Warning:', JSON.stringify(logEntry, null, 2))
        break
      case 'info':
        console.log('🟢 EXTERNAL LOGGING - Info:', JSON.stringify(logEntry, null, 2))
        break
    }
  }
  
  setUser(userId: string, userData?: Record<string, unknown>): void {
    console.log('👤 EXTERNAL LOGGING - Set User:', { userId, userData })
  }
  
  setTag(key: string, value: string): void {
    console.log('🏷️ EXTERNAL LOGGING - Set Tag:', { key, value })
  }
}

// Initialize external logging service
let externalLoggingService: ExternalLoggingService | null = null

// Initialize external logging service based on environment
function initializeExternalLogging(): ExternalLoggingService {
  if (externalLoggingService) {
    return externalLoggingService
  }
  
  // Check for Sentry configuration
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      // For now, use console logging as fallback
      // Sentry integration can be added later with proper module resolution
      console.log('⚠️ Sentry DSN found but integration not yet configured')
    } catch (error) {
      console.warn('⚠️ Failed to initialize Sentry, falling back to console logging:', error)
    }
  }
  
  // Fallback to console logging
  externalLoggingService = new ConsoleLoggingService()
  console.log('✅ Console logging service initialized')
  return externalLoggingService
}

// Generate correlation ID for request tracing
function generateCorrelationId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate session ID
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Categorize error by type
 */
export function categorizeError(error: unknown): ErrorType {
  if (error instanceof ValidationError) {
    return ErrorType.VALIDATION
  }
  
  if (error instanceof SecurityError) {
    return ErrorType.SECURITY
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return ErrorType.RATE_LIMIT
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return ErrorType.NOT_FOUND
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return ErrorType.AUTHENTICATION
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return ErrorType.AUTHORIZATION
    }
    
    if (message.includes('database') || message.includes('sql') || message.includes('supabase')) {
      return ErrorType.DATABASE
    }
    
    if (message.includes('external') || message.includes('api') || message.includes('service')) {
      return ErrorType.EXTERNAL_SERVICE
    }
  }
  
  return ErrorType.UNKNOWN
}

/**
 * Determine error severity
 */
export function determineSeverity(errorType: ErrorType, error: unknown): ErrorSeverity {
  switch (errorType) {
    case ErrorType.SECURITY:
    case ErrorType.AUTHENTICATION:
      return ErrorSeverity.CRITICAL
      
    case ErrorType.AUTHORIZATION:
    case ErrorType.RATE_LIMIT:
      return ErrorSeverity.HIGH
      
    case ErrorType.VALIDATION:
    case ErrorType.DATABASE:
      return ErrorSeverity.MEDIUM
      
    case ErrorType.NOT_FOUND:
    case ErrorType.EXTERNAL_SERVICE:
      return ErrorSeverity.LOW
      
    default:
      return ErrorSeverity.MEDIUM
  }
}

/**
 * Sanitize error for client response
 */
export function sanitizeError(error: unknown, context: ErrorContext): SanitizedError {
  const errorType = categorizeError(error)
  const severity = determineSeverity(errorType, error)
  
  // Log the full error internally
  logInternalError(error, errorType, severity, context)
  
  // Return sanitized error based on type
  switch (errorType) {
    case ErrorType.VALIDATION:
      if (error instanceof ValidationError) {
        return {
          type: ErrorType.VALIDATION,
          message: 'Invalid request data',
          details: error.issues ? { fields: error.issues.map(i => i.field) } : undefined
        }
      }
      return {
        type: ErrorType.VALIDATION,
        message: 'Invalid request data'
      }
      
    case ErrorType.SECURITY:
      return {
        type: ErrorType.SECURITY,
        message: 'Access denied'
      }
      
    case ErrorType.AUTHENTICATION:
      return {
        type: ErrorType.AUTHENTICATION,
        message: 'Authentication required'
      }
      
    case ErrorType.AUTHORIZATION:
      return {
        type: ErrorType.AUTHORIZATION,
        message: 'Insufficient permissions'
      }
      
    case ErrorType.NOT_FOUND:
      return {
        type: ErrorType.NOT_FOUND,
        message: 'Resource not found'
      }
      
    case ErrorType.RATE_LIMIT:
      return {
        type: ErrorType.RATE_LIMIT,
        message: 'Too many requests',
        retryAfter: 60 // Default 1 minute
      }
      
    case ErrorType.DATABASE:
      return {
        type: ErrorType.DATABASE,
        message: 'Service temporarily unavailable'
      }
      
    case ErrorType.EXTERNAL_SERVICE:
      return {
        type: ErrorType.EXTERNAL_SERVICE,
        message: 'External service unavailable'
      }
      
    case ErrorType.INTERNAL:
    case ErrorType.UNKNOWN:
    default:
      return {
        type: ErrorType.INTERNAL,
        message: 'Internal server error'
      }
  }
}

/**
 * Log internal error with full details and external service integration
 */
function logInternalError(
  error: unknown,
  type: ErrorType,
  severity: ErrorSeverity,
  context: ErrorContext
): void {
  const correlationId = context.correlationId || generateCorrelationId()
  const sessionId = context.sessionId || generateSessionId()
  
  const internalError: InternalError = {
    type,
    severity,
    message: error instanceof Error ? error.message : String(error),
    originalError: error,
    context: {
      ...context,
      correlationId,
      sessionId,
      timestamp: new Date().toISOString()
    },
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    correlationId,
    sessionId
  }
  
  // Log based on severity
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      console.error('🚨 CRITICAL ERROR:', internalError)
      break
      
    case ErrorSeverity.HIGH:
      console.error('🔴 HIGH SEVERITY ERROR:', internalError)
      break
      
    case ErrorSeverity.MEDIUM:
      console.warn('🟡 MEDIUM SEVERITY ERROR:', internalError)
      break
      
    case ErrorSeverity.LOW:
      console.log('🟢 LOW SEVERITY ERROR:', internalError)
      break
  }
  
  // Send to external logging service
  try {
    const loggingService = initializeExternalLogging()
    
    // Set user context if available
    if (context.userId) {
      loggingService.setUser(context.userId, {
        userType: context.userType,
        platform: context.platform,
        ip: context.ip
      })
    }
    
    // Set correlation and session tags
    loggingService.setTag('correlationId', correlationId)
    loggingService.setTag('sessionId', sessionId)
    loggingService.setTag('errorType', type)
    loggingService.setTag('severity', severity)
    
    // Capture the exception
    loggingService.captureException(internalError)
  } catch (loggingError) {
    console.error('Failed to send error to external logging service:', loggingError)
  }
}

/**
 * Create error response with proper HTTP status
 */
export function createErrorResponse(
  sanitizedError: SanitizedError,
  status: number = 500
): NextResponse {
  const response = NextResponse.json(
    {
      error: sanitizedError.message,
      type: sanitizedError.type,
      ...(sanitizedError.code && { code: sanitizedError.code }),
      ...(sanitizedError.details && { details: sanitizedError.details }),
      ...(sanitizedError.retryAfter && { retryAfter: sanitizedError.retryAfter })
    },
    { status }
  )
  
  // Add appropriate headers
  if (sanitizedError.retryAfter) {
    response.headers.set('Retry-After', sanitizedError.retryAfter.toString())
  }
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  return response
}

/**
 * Wrapper function for API route error handling with request tracing
 */
export function withErrorHandling<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now()
    const correlationId = generateCorrelationId()
    const sessionId = generateSessionId()
    
    try {
      // Extract context from request if available
      const context: ErrorContext = {
        correlationId,
        sessionId,
        timestamp: new Date().toISOString()
      }
      
      // Try to extract request context
      if (args[0] instanceof Request) {
        const request = args[0] as Request
        context.method = request.method
        context.endpoint = new URL(request.url).pathname
        context.userAgent = request.headers.get('user-agent') || undefined
        context.ip = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.headers.get('cf-connecting-ip') || 
                    undefined
      }
      
      const result = await handler(...args)
      
      // Log successful request
      const duration = Date.now() - startTime
      if (duration > 1000) { // Log slow requests
        const loggingService = initializeExternalLogging()
        loggingService.captureMessage(
          `Slow request detected: ${context.endpoint} took ${duration}ms`,
          'warn',
          { ...context, requestDuration: duration }
        )
      }
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Extract context from request if available
      const context: ErrorContext = {
        correlationId,
        sessionId,
        requestDuration: duration,
        timestamp: new Date().toISOString()
      }
      
      // Try to extract request context
      if (args[0] instanceof Request) {
        const request = args[0] as Request
        context.method = request.method
        context.endpoint = new URL(request.url).pathname
        context.userAgent = request.headers.get('user-agent') || undefined
        context.ip = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.headers.get('cf-connecting-ip') || 
                    undefined
      }
      
      const sanitizedError = sanitizeError(error, context)
      
      // If this is an API route, return proper error response
      if (typeof window === 'undefined' && args[0] instanceof Request) {
        const status = getHttpStatus(sanitizedError.type)
        throw createErrorResponse(sanitizedError, status)
      }
      
      // For other contexts, re-throw the sanitized error
      throw new Error(sanitizedError.message)
    }
  }
}

/**
 * Get appropriate HTTP status code for error type
 */
function getHttpStatus(errorType: ErrorType): number {
  switch (errorType) {
    case ErrorType.VALIDATION:
      return 400
      
    case ErrorType.AUTHENTICATION:
      return 401
      
    case ErrorType.AUTHORIZATION:
      return 403
      
    case ErrorType.NOT_FOUND:
      return 404
      
    case ErrorType.RATE_LIMIT:
      return 429
      
    case ErrorType.SECURITY:
      return 403
      
    case ErrorType.DATABASE:
    case ErrorType.EXTERNAL_SERVICE:
    case ErrorType.INTERNAL:
    case ErrorType.UNKNOWN:
    default:
      return 500
  }
}

/**
 * Extract error context from NextRequest with enhanced information
 */
export function extractErrorContext(request: NextRequest): ErrorContext {
  const correlationId = generateCorrelationId()
  const sessionId = generateSessionId()
  
  return {
    method: request.method,
    endpoint: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        request.headers.get('cf-connecting-ip') || 
        undefined,
    correlationId,
    sessionId,
    timestamp: new Date().toISOString(),
    platform: request.nextUrl.hostname
  }
}

/**
 * Handle specific error types with custom logic
 */
export function handleSpecificError(error: unknown, _context: ErrorContext): SanitizedError | null {
  // Handle Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string }
    
    switch (supabaseError.code) {
      case 'PGRST116': // No rows returned
        return {
          type: ErrorType.NOT_FOUND,
          message: 'Resource not found'
        }
        
      case '23505': // Unique violation
        return {
          type: ErrorType.VALIDATION,
          message: 'Resource already exists'
        }
        
      case '23503': // Foreign key violation
        return {
          type: ErrorType.VALIDATION,
          message: 'Invalid reference'
        }
        
      case '42P01': // Undefined table
      case '42703': // Undefined column
        return {
          type: ErrorType.DATABASE,
          message: 'Service temporarily unavailable'
        }
    }
  }
  
  return null
}

/**
 * Log security events
 */
export function logSecurityEvent(
  event: string,
  severity: ErrorSeverity,
  context: ErrorContext,
  details?: Record<string, unknown>
): void {
  const loggingService = initializeExternalLogging()
  
  loggingService.captureMessage(
    `Security Event: ${event}`,
    severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH ? 'error' : 'warn',
    {
      ...context,
      securityEvent: event,
      severity,
      details
    }
  )
}

/**
 * Log performance metrics
 */
export function logPerformanceMetric(
  metric: string,
  value: number,
  unit: string,
  context: ErrorContext
): void {
  const loggingService = initializeExternalLogging()
  
  loggingService.captureMessage(
    `Performance Metric: ${metric} = ${value}${unit}`,
    'info',
    {
      ...context,
      performanceMetric: metric,
      value,
      unit
    }
  )
}
