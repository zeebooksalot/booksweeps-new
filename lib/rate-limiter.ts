import { NextRequest, NextResponse } from 'next/server'
import { getClientIP } from './client-ip'

/**
 * Comprehensive rate limiting system for the application
 * Handles both basic rate limiting and Next.js middleware integration
 */

export interface RateLimitEntry {
  count: number
  resetTime: number
}

export interface RateLimitConfig {
  limit: number
  window: number // in seconds
}

export interface RateLimitOptions {
  limit: number
  window: number
  identifier?: string
  errorMessage?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

/**
 * Core rate limiter class with in-memory storage
 */
export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if a request is within rate limits
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @param limit - Maximum number of requests allowed
   * @param window - Time window in seconds
   * @returns RateLimitResult with detailed information
   */
  async checkLimit(identifier: string, limit: number, window: number): Promise<RateLimitResult> {
    const now = Date.now()
    const resetTime = now + (window * 1000)
    
    const entry = this.store.get(identifier)
    
    if (!entry) {
      // First request for this identifier
      this.store.set(identifier, { count: 1, resetTime })
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: resetTime - now
      }
    }
    
    if (now > entry.resetTime) {
      // Window has expired, reset counter
      this.store.set(identifier, { count: 1, resetTime })
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: resetTime - now
      }
    }
    
    if (entry.count >= limit) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime - now
      }
    }
    
    // Increment counter
    entry.count++
    return {
      allowed: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime - now
    }
  }

  /**
   * Get current count for an identifier
   * @param identifier - Unique identifier
   * @returns Current count or 0 if not found
   */
  getCount(identifier: string): number {
    const entry = this.store.get(identifier)
    if (!entry || Date.now() > entry.resetTime) {
      return 0
    }
    return entry.count
  }

  /**
   * Get time remaining until reset for an identifier
   * @param identifier - Unique identifier
   * @returns Time remaining in milliseconds, or 0 if not found/expired
   */
  getTimeRemaining(identifier: string): number {
    const entry = this.store.get(identifier)
    if (!entry) return 0
    
    const remaining = entry.resetTime - Date.now()
    return Math.max(0, remaining)
  }

  /**
   * Reset the counter for an identifier
   * @param identifier - Unique identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier)
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [identifier, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(identifier)
      }
    }
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store.clear()
  }
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // General API endpoints
  API_GENERAL: { limit: 100, window: 60 }, // 100 requests per minute
  
  // Authentication endpoints
  AUTH_LOGIN: { limit: 5, window: 300 }, // 5 login attempts per 5 minutes
  AUTH_SIGNUP: { limit: 3, window: 3600 }, // 3 signup attempts per hour
  
  // Download endpoints
  DOWNLOAD_BOOK: { limit: 5, window: 3600 }, // 5 downloads per hour per book
  DOWNLOAD_GENERAL: { limit: 20, window: 3600 }, // 20 total downloads per hour
  
  // Vote endpoints
  VOTE: { limit: 10, window: 60 }, // 10 votes per minute
  
  // Comment endpoints
  COMMENT: { limit: 5, window: 300 }, // 5 comments per 5 minutes
  
  // Campaign/Entry endpoints
  CAMPAIGN_ENTRY: { limit: 3, window: 3600 }, // 3 entries per hour per campaign
} as const

// Global rate limiter instance
export const rateLimiter = new RateLimiter()

/**
 * Helper function to create rate limit identifier
 */
export function createRateLimitIdentifier(
  type: 'ip' | 'user' | 'email',
  value: string,
  endpoint?: string
): string {
  const parts = [type, value]
  if (endpoint) {
    parts.push(endpoint)
  }
  return parts.join(':')
}

/**
 * Check rate limit with proper error handling
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    return await rateLimiter.checkLimit(identifier, config.limit, config.window)
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Allow request to proceed if rate limiting fails
    return { allowed: true, remaining: config.limit, resetTime: 0 }
  }
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

/**
 * Enhanced rate limiting for API middleware
 */
export async function checkApiRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier: string
): Promise<RateLimitResult> {
  try {
    return await checkRateLimit(identifier, config)
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Allow request to proceed if rate limiting fails
    return { allowed: true, remaining: config.limit, resetTime: 0 }
  }
}