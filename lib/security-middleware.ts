import { NextRequest, NextResponse } from 'next/server'
import { securityHeaders } from '@/lib/security-headers'
import { corsHandler } from '@/lib/cors-config'
import { withSecurityRateLimit } from '@/lib/security-rate-limiter'
import { sanitizeInput, CommonSchemas } from '@/lib/input-sanitizer'

export interface SecurityMiddlewareConfig {
  // Enable/disable features
  enableCors?: boolean
  enableRateLimit?: boolean
  enableSecurityHeaders?: boolean
  enableInputSanitization?: boolean
  
  // Custom configurations
  corsConfig?: any
  rateLimitConfig?: any
  securityHeadersConfig?: any
  
  // Input validation
  validateInput?: boolean
  allowedContentTypes?: string[]
  maxBodySize?: number
}

const DEFAULT_CONFIG: SecurityMiddlewareConfig = {
  enableCors: true,
  enableRateLimit: true,
  enableSecurityHeaders: true,
  enableInputSanitization: true,
  validateInput: true,
  allowedContentTypes: [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain'
  ],
  maxBodySize: 1024 * 1024 // 1MB
}

export function createSecurityMiddleware(config: SecurityMiddlewareConfig = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  
  return function securityMiddleware(request: NextRequest) {
    const response = NextResponse.next()
    
    // Apply security headers
    if (mergedConfig.enableSecurityHeaders) {
      const headersMiddleware = securityHeaders
      headersMiddleware(request)
    }
    
    // Apply CORS
    if (mergedConfig.enableCors) {
      const corsMiddleware = corsHandler
      corsMiddleware(request)
    }
    
    return response
  }
}

// Enhanced API handler with security
export function withSecurity(
  handler: (req: NextRequest) => Promise<Response>,
  config: SecurityMiddlewareConfig = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  
  return async (request: NextRequest): Promise<Response> => {
    try {
      // 1. Input validation and sanitization
      if (mergedConfig.enableInputSanitization) {
        await validateAndSanitizeRequest(request, mergedConfig)
      }
      
      // 2. Rate limiting
      if (mergedConfig.enableRateLimit) {
        const rateLimitedHandler = withSecurityRateLimit(
          handler,
          mergedConfig.rateLimitConfig
        )
        return await rateLimitedHandler(request)
      }
      
      // 3. Execute handler
      const response = await handler(request)
      
      // 4. Add security headers to response
      if (mergedConfig.enableSecurityHeaders) {
        addSecurityHeadersToResponse(response)
      }
      
      return response
      
    } catch (error) {
      console.error('Security middleware error:', error)
      
      return new Response(
        JSON.stringify({
          error: 'Security validation failed',
          message: 'Request blocked by security middleware'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
  }
}

async function validateAndSanitizeRequest(
  request: NextRequest,
  config: SecurityMiddlewareConfig
): Promise<void> {
  // Check content type
  const contentType = request.headers.get('content-type') || ''
  if (config.allowedContentTypes && !config.allowedContentTypes.some(type => 
    contentType.includes(type)
  )) {
    throw new Error('Invalid content type')
  }
  
  // Check body size
  const contentLength = request.headers.get('content-length')
  if (contentLength && config.maxBodySize) {
    const size = parseInt(contentLength, 10)
    if (size > config.maxBodySize) {
      throw new Error('Request body too large')
    }
  }
  
  // Sanitize URL parameters
  const url = new URL(request.url)
  const params = url.searchParams
  
  for (const [key, value] of params.entries()) {
    const sanitized = sanitizeInput(value, {
      maxLength: 100,
      stripHtml: true,
      trim: true
    })
    
    if (sanitized !== value) {
      url.searchParams.set(key, sanitized)
    }
  }
  
  // Sanitize request body for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const body = await request.json()
      const sanitizedBody = sanitizeRequestBody(body)
      
      // Create new request with sanitized body
      const sanitizedRequest = new NextRequest(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(sanitizedBody)
      })
      
      // Replace the original request (this is a simplified approach)
      Object.assign(request, sanitizedRequest)
    } catch (error) {
      // If JSON parsing fails, it might be form data or other content type
      // In a real implementation, you'd handle different content types
      console.warn('Could not parse request body for sanitization:', error)
    }
  }
}

function sanitizeRequestBody(body: any): any {
  if (typeof body === 'string') {
    return sanitizeInput(body, {
      maxLength: 1000,
      stripHtml: true,
      trim: true
    })
  }
  
  if (Array.isArray(body)) {
    return body.map(item => sanitizeRequestBody(item))
  }
  
  if (typeof body === 'object' && body !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(body)) {
      const sanitizedKey = sanitizeInput(key, {
        maxLength: 50,
        stripHtml: true,
        trim: true
      })
      sanitized[sanitizedKey] = sanitizeRequestBody(value)
    }
    return sanitized
  }
  
  return body
}

function addSecurityHeadersToResponse(response: Response): void {
  // Add additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
}

// Pre-configured security middleware for different use cases
export const apiSecurityMiddleware = createSecurityMiddleware({
  enableCors: true,
  enableRateLimit: true,
  enableSecurityHeaders: true,
  enableInputSanitization: true,
  validateInput: true,
  maxBodySize: 5 * 1024 * 1024, // 5MB for API requests
  allowedContentTypes: [
    'application/json',
    'application/x-www-form-urlencoded'
  ]
})

export const publicSecurityMiddleware = createSecurityMiddleware({
  enableCors: true,
  enableRateLimit: true,
  enableSecurityHeaders: true,
  enableInputSanitization: false, // Less strict for public content
  validateInput: false
})

export const authSecurityMiddleware = createSecurityMiddleware({
  enableCors: true,
  enableRateLimit: true,
  enableSecurityHeaders: true,
  enableInputSanitization: true,
  validateInput: true,
  maxBodySize: 1024 * 1024, // 1MB for auth requests
  allowedContentTypes: ['application/json']
})

// Security middleware for Next.js middleware.ts
export function createNextSecurityMiddleware(config: SecurityMiddlewareConfig = {}) {
  const middleware = createSecurityMiddleware(config)
  
  return function nextSecurityMiddleware(request: NextRequest) {
    return middleware(request)
  }
}

// Export the default security middleware
export const securityMiddleware = createSecurityMiddleware()
