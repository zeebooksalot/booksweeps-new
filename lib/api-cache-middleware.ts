import { NextRequest, NextResponse } from 'next/server'
import { withCache, CACHE_CONFIGS, generateCacheKey } from '@/lib/cache-strategy'

// Cache middleware for different API route types
export function withApiCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  cacheType: 'api' | 'user' | 'database' | 'static' = 'api'
) {
  const config = CACHE_CONFIGS[cacheType]
  return withCache(handler, config)
}

// Specialized cache middleware for public API routes
export function withPublicApiCache(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withApiCache(handler, 'api')
}

// Specialized cache middleware for user-specific routes
export function withUserApiCache(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withApiCache(handler, 'user')
}

// Specialized cache middleware for database-heavy routes
export function withDatabaseCache(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withApiCache(handler, 'database')
}

// Cache middleware for static content
export function withStaticCache(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withApiCache(handler, 'static')
}

// Enhanced API handler with caching
export function withCachedApiHandler(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  options: {
    auth?: 'none' | 'optional' | 'required'
    clientType?: 'service' | 'authenticated'
    cacheType?: 'api' | 'user' | 'database' | 'static'
  } = {}
) {
  const { cacheType = 'api', ...handlerOptions } = options
  
  return withApiCache(
    async (req: NextRequest): Promise<NextResponse> => {
      // Import the original withApiHandler
      const { withApiHandler } = await import('@/lib/api-middleware')
      
      // Wrap the handler with the original middleware
      const wrappedHandler = withApiHandler(handler, handlerOptions)
      
      // Execute the wrapped handler
      const response = await wrappedHandler(req)
      
      // Ensure we return a NextResponse
      return response instanceof NextResponse ? response : NextResponse.json(await response.json(), {
        status: response.status,
        headers: response.headers
      })
    },
    cacheType
  )
}

// Cache invalidation for specific routes
export function invalidateApiCache(route: string, tags?: string[]) {
  const { invalidateCacheByTag } = require('@/lib/cache-strategy')
  
  if (tags) {
    tags.forEach(tag => invalidateCacheByTag(tag))
  } else {
    // Invalidate all API cache
    invalidateCacheByTag('api')
  }
}

// Cache warming utilities
export async function warmCache(urls: string[]) {
  const responses = await Promise.allSettled(
    urls.map(url => fetch(url))
  )
  
  return responses.map((result, index) => ({
    url: urls[index],
    success: result.status === 'fulfilled',
    error: result.status === 'rejected' ? result.reason : null
  }))
}

// Cache statistics endpoint
export function getCacheStats() {
  const { getCacheStats } = require('@/lib/cache-strategy')
  return getCacheStats()
}
