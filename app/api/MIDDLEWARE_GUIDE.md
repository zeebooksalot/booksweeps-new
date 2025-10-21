# Middleware Guide

## Overview

The API uses a comprehensive middleware system that provides authentication, caching, security, and error handling. This guide explains how to use and extend the middleware system.

## Core Middleware

### `withApiHandler`

The primary middleware wrapper that provides:

- **Authentication**: Optional, required, or none
- **Client Management**: Service or authenticated Supabase client
- **Error Handling**: Automatic error catching and formatting
- **Request Parsing**: Body and query parameter validation
- **Rate Limiting**: IP and user-based rate limiting
- **Logging**: Request/response logging

```typescript
import { withApiHandler } from '@/lib/api-middleware'

export const GET = withApiHandler(
  async (req, { supabase, query, user }) => {
    // Your handler logic here
    const { data, error } = await supabase
      .from('table')
      .select('*')
    
    if (error) throw error
    
    return successResponse(data)
  },
  {
    auth: 'optional',        // 'none' | 'optional' | 'required'
    clientType: 'service'    // 'service' | 'authenticated'
  }
)
```

### `withCachedApiHandler`

Enhanced middleware that adds caching capabilities:

```typescript
import { withCachedApiHandler } from '@/lib/api-cache-middleware'

export const GET = withCachedApiHandler(
  async (req, { supabase, query }) => {
    // Your handler logic here
  },
  {
    auth: 'none',
    clientType: 'service',
    cacheType: 'database'     // 'api' | 'user' | 'database' | 'static'
  }
)
```

## Authentication Options

### `auth: 'none'`
- No authentication required
- No user context provided
- Use for public endpoints

### `auth: 'optional'`
- Authentication optional
- User context available if authenticated
- Use for endpoints that work with or without auth

### `auth: 'required'`
- Authentication required
- User context always available
- Use for protected endpoints

## Client Types

### `clientType: 'service'`
- Uses Supabase service client
- Full database access
- Bypasses RLS policies
- Use for admin operations

### `clientType: 'authenticated'`
- Uses authenticated Supabase client
- Respects RLS policies
- User-scoped access
- Use for user operations

## Caching Types

### `cacheType: 'static'`
- **Duration**: 1 year
- **Use**: Images, CSS, JS files
- **Headers**: `max-age=31536000, s-maxage=31536000`

### `cacheType: 'api'`
- **Duration**: 5 minutes
- **Use**: General API endpoints
- **Headers**: `max-age=300, s-maxage=300, stale-while-revalidate=3600`

### `cacheType: 'user'`
- **Duration**: 1 minute
- **Use**: Personalized data
- **Headers**: `max-age=60, s-maxage=60, stale-while-revalidate=300`
- **Vary**: `Authorization, Cookie`

### `cacheType: 'database'`
- **Duration**: 2 minutes
- **Use**: Database-heavy operations
- **Headers**: `max-age=120, s-maxage=120, stale-while-revalidate=600`

## Request Context

The middleware provides a rich context object:

```typescript
interface ApiContext {
  supabase: SupabaseClient    // Supabase client
  query: Record<string, any>   // Query parameters
  user?: User                 // User object (if authenticated)
  ip: string                  // Client IP address
  userAgent: string           // User agent string
}
```

## Error Handling

### Automatic Error Handling
The middleware automatically catches and formats errors:

```typescript
// These errors are automatically handled:
throw new Error('Something went wrong')           // 500 Internal Server Error
throw new ValidationError('Invalid input')        // 400 Bad Request
throw new AuthenticationError('Not authenticated') // 401 Unauthorized
throw new AuthorizationError('Forbidden')        // 403 Forbidden
throw new NotFoundError('Resource not found')    // 404 Not Found
```

### Custom Error Handling
```typescript
export const GET = withApiHandler(
  async (req, { supabase, query }) => {
    try {
      // Your logic here
    } catch (error) {
      // Custom error handling
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Resource not found')
      }
      throw error // Re-throw to let middleware handle
    }
  }
)
```

## Request Parsing

### Body Parsing
```typescript
import { parseBody } from '@/lib/api-request'
import { z } from 'zod'

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
})

export const POST = withApiHandler(
  async (req, { supabase }) => {
    const validated = await parseBody(req, CreateUserSchema)
    // validated is now typed and validated
  }
)
```

### Query Parsing
```typescript
export const GET = withApiHandler(
  async (req, { supabase, query }) => {
    // query is automatically parsed from URL parameters
    const { page, limit, search } = query
  }
)
```

## Rate Limiting

### Automatic Rate Limiting
The middleware automatically applies rate limiting:

- **IP-based**: 100 requests per minute
- **User-based**: 200 requests per minute
- **Suspicious activity**: Automatic blocking

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Custom Rate Limiting
```typescript
import { rateLimiter } from '@/lib/rate-limiter'

export const POST = withApiHandler(
  async (req, { supabase }) => {
    // Custom rate limiting
    const result = await rateLimiter.check('custom-key', 10, 60000) // 10 requests per minute
    
    if (!result.allowed) {
      throw new RateLimitError('Too many requests')
    }
    
    // Your logic here
  }
)
```

## Security Features

### Input Sanitization
```typescript
import { sanitizeHtml, sanitizeText } from '@/lib/input-sanitizer'

export const POST = withApiHandler(
  async (req, { supabase }) => {
    const { content } = await parseBody(req, schema)
    
    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(content)
    
    // Or strip HTML entirely
    const textContent = sanitizeText(content)
  }
)
```

### CSRF Protection
```typescript
import { csrfProtection } from '@/lib/csrf'

export const POST = withApiHandler(
  async (req, { supabase }) => {
    // CSRF protection is automatic for POST/PUT/DELETE
    // Just implement your logic
  }
)
```

## Caching

### Cache Invalidation
```typescript
import { invalidateCacheByTag } from '@/lib/cache-strategy'

export const POST = withApiHandler(
  async (req, { supabase }) => {
    // Your logic here
    
    // Invalidate cache after update
    invalidateCacheByTag('database')
  }
)
```

### Cache Warming
```typescript
import { warmCache } from '@/lib/api-cache-middleware'

// Warm cache for frequently accessed data
await warmCache([
  'http://localhost:3000/api/books?limit=10',
  'http://localhost:3000/api/authors?limit=10'
])
```

## Logging

### Request Logging
The middleware automatically logs:
- Request method and URL
- Response status and time
- User context (if available)
- Error details

### Custom Logging
```typescript
import { auditLogger } from '@/lib/audit-logger'

export const POST = withApiHandler(
  async (req, { supabase, user }) => {
    // Your logic here
    
    // Custom audit logging
    await auditLogger.log('user_action', {
      user_id: user?.id,
      action: 'create_book',
      details: { book_id: result.id }
    })
  }
)
```

## Performance Monitoring

### Response Time Tracking
```typescript
export const GET = withApiHandler(
  async (req, { supabase }) => {
    const start = Date.now()
    
    // Your logic here
    
    const duration = Date.now() - start
    console.log(`Request took ${duration}ms`)
  }
)
```

### Cache Hit Tracking
```typescript
// Cache hit/miss is automatically tracked
// Check response headers for X-Cache: HIT or X-Cache: MISS
```

## Custom Middleware

### Creating Custom Middleware
```typescript
function withCustomMiddleware(handler: ApiHandler, options: CustomOptions) {
  return withApiHandler(
    async (req, context) => {
      // Pre-processing
      console.log('Custom middleware pre-processing')
      
      // Call original handler
      const result = await handler(req, context)
      
      // Post-processing
      console.log('Custom middleware post-processing')
      
      return result
    },
    options
  )
}
```

### Composing Middleware
```typescript
// Combine multiple middleware
export const GET = withCachedApiHandler(
  withCustomMiddleware(
    handler,
    { customOption: true }
  ),
  {
    auth: 'optional',
    clientType: 'service',
    cacheType: 'database'
  }
)
```

## Testing Middleware

### Unit Testing
```typescript
import { createMocks } from 'node-mocks-http'
import { withApiHandler } from '@/lib/api-middleware'

describe('API Handler', () => {
  it('should handle requests correctly', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/test'
    })
    
    const handler = withApiHandler(
      async (req, { supabase }) => {
        return successResponse({ test: 'data' })
      },
      { auth: 'none' }
    )
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: { test: 'data' }
    })
  })
})
```

### Integration Testing
```typescript
// Test with real Supabase client
const handler = withApiHandler(
  async (req, { supabase }) => {
    const { data } = await supabase.from('books').select('*')
    return successResponse(data)
  },
  { auth: 'none', clientType: 'service' }
)
```

## Best Practices

### 1. Choose the Right Middleware
- Use `withApiHandler` for simple endpoints
- Use `withCachedApiHandler` for database-heavy operations
- Use `auth: 'required'` for protected endpoints
- Use `clientType: 'service'` for admin operations

### 2. Handle Errors Gracefully
```typescript
export const GET = withApiHandler(
  async (req, { supabase }) => {
    try {
      // Your logic here
    } catch (error) {
      // Log error for debugging
      console.error('Handler error:', error)
      
      // Re-throw to let middleware handle
      throw error
    }
  }
)
```

### 3. Use Appropriate Caching
- Cache static content for 1 year
- Cache API responses for 5 minutes
- Cache user content for 1 minute
- Cache database queries for 2 minutes

### 4. Validate Input
```typescript
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email()
})

export const POST = withApiHandler(
  async (req, { supabase }) => {
    const validated = await parseBody(req, schema)
    // validated is now typed and validated
  }
)
```

### 5. Monitor Performance
```typescript
export const GET = withApiHandler(
  async (req, { supabase }) => {
    const start = Date.now()
    
    // Your logic here
    
    const duration = Date.now() - start
    if (duration > 1000) {
      console.warn(`Slow request: ${duration}ms`)
    }
  }
)
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check Supabase configuration
   - Verify JWT tokens
   - Check user permissions

2. **Rate Limiting Issues**
   - Check IP/user limits
   - Verify rate limit configuration
   - Clear rate limit cache if needed

3. **Cache Issues**
   - Check cache configuration
   - Verify TTL settings
   - Clear cache if needed

4. **Database Errors**
   - Check Supabase connection
   - Verify RLS policies
   - Check table relationships

### Debug Mode
Enable debug logging:
```bash
DEBUG=api:*
```

This will log detailed information about:
- Request/response cycles
- Cache hits/misses
- Rate limiting decisions
- Authentication flow
- Error details

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
