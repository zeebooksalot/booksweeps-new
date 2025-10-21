import { NextRequest, NextResponse } from 'next/server'

export interface CacheConfig {
  // Cache duration in seconds
  maxAge: number
  // Whether to cache in CDN
  sMaxAge?: number
  // Whether to revalidate on stale
  staleWhileRevalidate?: number
  // Cache tags for invalidation
  tags?: string[]
  // Whether to vary by specific headers
  vary?: string[]
}

// Cache configurations for different content types
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Static content - cache for 1 year
  static: {
    maxAge: 31536000, // 1 year
    sMaxAge: 31536000,
    tags: ['static']
  },
  
  // API responses - cache for 5 minutes
  api: {
    maxAge: 300, // 5 minutes
    sMaxAge: 300,
    staleWhileRevalidate: 3600, // 1 hour
    tags: ['api']
  },
  
  // User-specific content - cache for 1 minute
  user: {
    maxAge: 60, // 1 minute
    sMaxAge: 60,
    staleWhileRevalidate: 300, // 5 minutes
    tags: ['user'],
    vary: ['Authorization', 'Cookie']
  },
  
  // Database queries - cache for 2 minutes
  database: {
    maxAge: 120, // 2 minutes
    sMaxAge: 120,
    staleWhileRevalidate: 600, // 10 minutes
    tags: ['database']
  },
  
  // Images - cache for 1 month
  images: {
    maxAge: 2592000, // 30 days
    sMaxAge: 2592000,
    tags: ['images']
  },
  
  // Sitemaps - cache for 1 hour
  sitemaps: {
    maxAge: 3600, // 1 hour
    sMaxAge: 3600,
    tags: ['sitemaps']
  }
}

// In-memory cache for API responses (in production, use Redis)
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number; tags: string[] }>()
  
  set(key: string, data: any, ttl: number, tags: string[] = []) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl * 1000,
      tags
    })
  }
  
  get(key: string) {
    const entry = this.cache.get(key)
    if (!entry || Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }
    return entry.data
  }
  
  invalidateByTag(tag: string) {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key)
      }
    }
  }
  
  clear() {
    this.cache.clear()
  }
  
  size() {
    return this.cache.size
  }
}

export const memoryCache = new MemoryCache()

// Cache key generators
export function generateCacheKey(prefix: string, params: Record<string, any> = {}): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|')
  
  return `${prefix}:${sortedParams}`
}

// Cache middleware for API routes
export function withCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: CacheConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Generate cache key from request
    const url = new URL(request.url)
    const cacheKey = generateCacheKey(url.pathname, {
      search: url.search,
      method: request.method
    })
    
    // Check cache first
    const cached = memoryCache.get(cacheKey)
    if (cached) {
      const response = new NextResponse(JSON.stringify(cached), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'Cache-Control': `max-age=${config.maxAge}${config.sMaxAge ? `, s-maxage=${config.sMaxAge}` : ''}${config.staleWhileRevalidate ? `, stale-while-revalidate=${config.staleWhileRevalidate}` : ''}`,
          ...(config.tags && { 'Cache-Tags': config.tags.join(',') }),
          ...(config.vary && { 'Vary': config.vary.join(', ') })
        }
      })
      return response
    }
    
    // Execute handler
    const response = await handler(request)
    
    // Clone response to read body
    const responseClone = response.clone()
    const data = await responseClone.json()
    
    // Cache the response
    memoryCache.set(cacheKey, data, config.maxAge, config.tags)
    
    // Add cache headers to response
    const headers = new Headers(response.headers)
    headers.set('X-Cache', 'MISS')
    headers.set('Cache-Control', `max-age=${config.maxAge}${config.sMaxAge ? `, s-maxage=${config.sMaxAge}` : ''}${config.staleWhileRevalidate ? `, stale-while-revalidate=${config.staleWhileRevalidate}` : ''}`)
    
    if (config.tags) {
      headers.set('Cache-Tags', config.tags.join(','))
    }
    
    if (config.vary) {
      headers.set('Vary', config.vary.join(', '))
    }
    
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    })
  }
}

// Cache invalidation utilities
export function invalidateCacheByTag(tag: string) {
  memoryCache.invalidateByTag(tag)
}

export function invalidateAllCache() {
  memoryCache.clear()
}

// Database query caching
export async function withDatabaseCache<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 120, // 2 minutes default
  tags: string[] = ['database']
): Promise<T> {
  const cached = memoryCache.get(key)
  if (cached) {
    return cached
  }
  
  const result = await queryFn()
  memoryCache.set(key, result, ttl, tags)
  return result
}

// API response caching with automatic key generation
export function withApiCache<T>(
  handler: () => Promise<T>,
  config: CacheConfig = CACHE_CONFIGS.api
): Promise<T> {
  const key = generateCacheKey('api', { timestamp: Math.floor(Date.now() / (config.maxAge * 1000)) })
  
  return withDatabaseCache(key, handler, config.maxAge, config.tags)
}

// Cache statistics
export function getCacheStats() {
  return {
    size: memoryCache.size(),
    hitRate: 0, // Would need to track hits/misses for this
    memoryUsage: process.memoryUsage()
  }
}

// Clean up expired entries periodically
setInterval(() => {
  // This is handled automatically by the get method
}, 60000) // Check every minute
