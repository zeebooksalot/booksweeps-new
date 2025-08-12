import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, createRateLimitIdentifier, RATE_LIMITS } from './rate-limiter'

interface RateLimitOptions {
  limit: number
  window: number
  identifier?: string
  errorMessage?: string
}

/**
 * Middleware function to apply rate limiting to API routes
 */
export async function withRateLimit(
  request: NextRequest,
  options: RateLimitOptions,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get client IP
    const clientIP = getClientIP(request)
    
    // Create rate limit identifier
    const identifier = options.identifier || createRateLimitIdentifier('ip', clientIP)
    
    // Check rate limit
    const { allowed, remaining, resetTime } = await checkRateLimit(identifier, {
      limit: options.limit,
      window: options.window
    })
    
    if (!allowed) {
      // Rate limit exceeded
      const response = NextResponse.json(
        { 
          error: options.errorMessage || 'Rate limit exceeded',
          retryAfter: Math.ceil(resetTime / 1000)
        },
        { status: 429 }
      )
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', options.limit.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', new Date(Date.now() + resetTime).toISOString())
      response.headers.set('Retry-After', Math.ceil(resetTime / 1000).toString())
      
      return response
    }
    
    // Rate limit check passed, execute the handler
    const response = await handler(request)
    
    // Add rate limit headers to successful response
    response.headers.set('X-RateLimit-Limit', options.limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(Date.now() + resetTime).toISOString())
    
    return response
  } catch (error) {
    console.error('Rate limiting error:', error)
    // If rate limiting fails, allow the request to proceed
    return await handler(request)
  }
}

/**
 * Predefined rate limit wrappers for common endpoints
 */
export const rateLimitWrappers = {
  // General API rate limiting
  api: (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return (request: NextRequest) => withRateLimit(request, RATE_LIMITS.API_GENERAL, handler)
  },
  
  // Authentication rate limiting
  auth: (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return (request: NextRequest) => withRateLimit(request, RATE_LIMITS.AUTH_LOGIN, handler)
  },
  
  // Download rate limiting
  download: (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return (request: NextRequest) => withRateLimit(request, RATE_LIMITS.DOWNLOAD_GENERAL, handler)
  },
  
  // Vote rate limiting
  vote: (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return (request: NextRequest) => withRateLimit(request, RATE_LIMITS.VOTE, handler)
  },
  
  // Comment rate limiting
  comment: (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return (request: NextRequest) => withRateLimit(request, RATE_LIMITS.COMMENT, handler)
  },
  
  // Campaign entry rate limiting
  campaignEntry: (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return (request: NextRequest) => withRateLimit(request, RATE_LIMITS.CAMPAIGN_ENTRY, handler)
  }
}

/**
 * Custom rate limit wrapper with specific configuration
 */
export function withCustomRateLimit(
  options: RateLimitOptions
) {
  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return (request: NextRequest) => withRateLimit(request, options, handler)
  }
}
