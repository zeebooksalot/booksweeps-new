interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  limit: number
  window: number // in seconds
}

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
   * @returns true if request is allowed, false if rate limited
   */
  async checkLimit(identifier: string, limit: number, window: number): Promise<boolean> {
    const now = Date.now()
    const resetTime = now + (window * 1000)
    
    const entry = this.store.get(identifier)
    
    if (!entry) {
      // First request for this identifier
      this.store.set(identifier, { count: 1, resetTime })
      return true
    }
    
    if (now > entry.resetTime) {
      // Window has expired, reset counter
      this.store.set(identifier, { count: 1, resetTime })
      return true
    }
    
    if (entry.count >= limit) {
      // Rate limit exceeded
      return false
    }
    
    // Increment counter
    entry.count++
    return true
  }

  /**
   * Increment the counter for an identifier
   * @param identifier - Unique identifier
   */
  async increment(identifier: string): Promise<void> {
    const now = Date.now()
    const entry = this.store.get(identifier)
    
    if (entry && now <= entry.resetTime) {
      entry.count++
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

// Helper function to get client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return 'unknown'
}

// Helper function to create rate limit identifier
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

// Helper function to check rate limit with proper error handling
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const allowed = await rateLimiter.checkLimit(identifier, config.limit, config.window)
  const remaining = allowed ? config.limit - rateLimiter.getCount(identifier) : 0
  const resetTime = rateLimiter.getTimeRemaining(identifier)
  
  return { allowed, remaining, resetTime }
}
