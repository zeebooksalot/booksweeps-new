import { NextRequest } from 'next/server'
import { getClientIP } from '@/lib/client-ip'

export interface SecurityRateLimitConfig {
  // Basic rate limiting
  windowMs: number
  maxRequests: number
  
  // Advanced rate limiting
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  
  // Security features
  blockSuspiciousIPs?: boolean
  maxConcurrentRequests?: number
  maxRequestsPerMinute?: number
  
  // Custom limits
  customLimits?: {
    [key: string]: {
      windowMs: number
      maxRequests: number
    }
  }
  
  // Whitelist/blacklist
  whitelist?: string[]
  blacklist?: string[]
  
  // Response customization
  message?: string
  statusCode?: number
}

interface RateLimitEntry {
  count: number
  firstRequest: number
  lastRequest: number
  blocked: boolean
  suspicious: boolean
}

class SecurityRateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private suspiciousIPs = new Set<string>()
  private concurrentRequests = new Map<string, number>()
  
  constructor(private config: SecurityRateLimitConfig) {
    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 300000)
  }
  
  private cleanup() {
    const now = Date.now()
    const maxAge = this.config.windowMs * 2 // Keep entries for 2x the window
    
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.lastRequest > maxAge) {
        this.store.delete(key)
      }
    }
    
    // Clean up concurrent requests
    for (const [key, count] of this.concurrentRequests.entries()) {
      if (count === 0) {
        this.concurrentRequests.delete(key)
      }
    }
  }
  
  private isSuspicious(ip: string, entry: RateLimitEntry): boolean {
    const now = Date.now()
    const timeDiff = now - entry.firstRequest
    
    // Check for rapid-fire requests (more than 10 requests in 1 second)
    if (timeDiff < 1000 && entry.count > 10) {
      return true
    }
    
    // Check for burst patterns (more than 50 requests in 10 seconds)
    if (timeDiff < 10000 && entry.count > 50) {
      return true
    }
    
    // Check for consistent high rate (more than 100 requests in 1 minute)
    if (timeDiff < 60000 && entry.count > 100) {
      return true
    }
    
    return false
  }
  
  private getKey(request: NextRequest): string {
    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    const path = new URL(request.url).pathname
    
    // Create a composite key for more granular rate limiting
    return `${ip}:${path}:${userAgent.slice(0, 50)}`
  }
  
  private checkBlacklist(ip: string): boolean {
    if (this.config.blacklist?.includes(ip)) {
      return true
    }
    
    return this.suspiciousIPs.has(ip)
  }
  
  private checkWhitelist(ip: string): boolean {
    return this.config.whitelist?.includes(ip) || false
  }
  
  async check(request: NextRequest): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
    reason?: string
  }> {
    const ip = getClientIP(request)
    const key = this.getKey(request)
    const now = Date.now()
    
    // Check blacklist
    if (this.checkBlacklist(ip)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + this.config.windowMs,
        reason: 'IP address is blocked'
      }
    }
    
    // Check whitelist
    if (this.checkWhitelist(ip)) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs
      }
    }
    
    // Get or create entry
    let entry = this.store.get(key)
    if (!entry) {
      entry = {
        count: 0,
        firstRequest: now,
        lastRequest: now,
        blocked: false,
        suspicious: false
      }
      this.store.set(key, entry)
    }
    
    // Update entry
    entry.count++
    entry.lastRequest = now
    
    // Check for suspicious behavior
    if (this.isSuspicious(ip, entry)) {
      entry.suspicious = true
      this.suspiciousIPs.add(ip)
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + this.config.windowMs,
        reason: 'Suspicious activity detected'
      }
    }
    
    // Check concurrent requests
    if (this.config.maxConcurrentRequests) {
      const concurrent = this.concurrentRequests.get(ip) || 0
      if (concurrent >= this.config.maxConcurrentRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: now + 60000, // 1 minute
          reason: 'Too many concurrent requests'
        }
      }
      
      this.concurrentRequests.set(ip, concurrent + 1)
      
      // Clean up after request (simplified - in real implementation, you'd track this per request)
      setTimeout(() => {
        const current = this.concurrentRequests.get(ip) || 0
        if (current > 0) {
          this.concurrentRequests.set(ip, current - 1)
        }
      }, 30000) // Assume 30 second request timeout
    }
    
    // Check rate limit
    const timeDiff = now - entry.firstRequest
    const windowStart = now - this.config.windowMs
    
    // Reset count if window has passed
    if (entry.firstRequest < windowStart) {
      entry.count = 1
      entry.firstRequest = now
    }
    
    const remaining = Math.max(0, this.config.maxRequests - entry.count)
    const resetTime = entry.firstRequest + this.config.windowMs
    
    if (entry.count > this.config.maxRequests) {
      entry.blocked = true
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000),
        reason: 'Rate limit exceeded'
      }
    }
    
    return {
      allowed: true,
      remaining,
      resetTime
    }
  }
  
  // Get current status for an IP
  getStatus(ip: string): {
    isBlocked: boolean
    isSuspicious: boolean
    requestCount: number
    lastRequest: number
  } {
    const entry = Array.from(this.store.values())
      .find(e => e.lastRequest > Date.now() - this.config.windowMs)
    
    return {
      isBlocked: entry?.blocked || false,
      isSuspicious: this.suspiciousIPs.has(ip),
      requestCount: entry?.count || 0,
      lastRequest: entry?.lastRequest || 0
    }
  }
  
  // Manually block an IP
  blockIP(ip: string, reason: string = 'Manually blocked'): void {
    this.suspiciousIPs.add(ip)
    
    // Add to blacklist if not already there
    if (!this.config.blacklist?.includes(ip)) {
      this.config.blacklist = [...(this.config.blacklist || []), ip]
    }
  }
  
  // Unblock an IP
  unblockIP(ip: string): void {
    this.suspiciousIPs.delete(ip)
    
    if (this.config.blacklist) {
      this.config.blacklist = this.config.blacklist.filter(i => i !== ip)
    }
  }
  
  // Get statistics
  getStats(): {
    totalIPs: number
    blockedIPs: number
    suspiciousIPs: number
    totalRequests: number
  } {
    const now = Date.now()
    const recentEntries = Array.from(this.store.values())
      .filter(e => now - e.lastRequest < this.config.windowMs)
    
    return {
      totalIPs: recentEntries.length,
      blockedIPs: recentEntries.filter(e => e.blocked).length,
      suspiciousIPs: this.suspiciousIPs.size,
      totalRequests: recentEntries.reduce((sum, e) => sum + e.count, 0)
    }
  }
}

// Pre-configured rate limiters
export const securityRateLimiter = new SecurityRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  maxConcurrentRequests: 10, // 10 concurrent requests
  blockSuspiciousIPs: true,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  customLimits: {
    '/api/auth/login': {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5 // 5 login attempts per 15 minutes
    },
    '/api/auth/register': {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3 // 3 registrations per hour
    },
    '/api/comments': {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10 // 10 comments per minute
    }
  },
  blacklist: process.env.BLOCKED_IPS?.split(',') || [],
  whitelist: process.env.WHITELISTED_IPS?.split(',') || []
})

// Middleware function for API routes
export function withSecurityRateLimit(
  handler: (req: NextRequest) => Promise<Response>,
  customConfig?: Partial<SecurityRateLimitConfig>
) {
  return async (req: NextRequest): Promise<Response> => {
    const config = customConfig 
      ? { ...securityRateLimiter['config'], ...customConfig }
      : securityRateLimiter['config']
    
    const limiter = new SecurityRateLimiter(config)
    const result = await limiter.check(req)
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: result.reason || 'Too many requests',
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            ...(result.retryAfter && { 'Retry-After': result.retryAfter.toString() })
          }
        }
      )
    }
    
    // Add rate limit headers to successful responses
    const response = await handler(req)
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
    
    return response
  }
}
