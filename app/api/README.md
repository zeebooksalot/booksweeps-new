# API Documentation

## Overview

The API folder contains all server-side routes and endpoints for the Booksweeps platform. The API is built using Next.js 15 App Router with a comprehensive middleware pattern that provides authentication, caching, security, and error handling.

## Architecture

### Core Components

```
app/api/
├── README.md                    # This documentation
├── auth/                       # Authentication endpoints
│   ├── track-login/           # Login tracking
│   └── upgrade-user-type/      # User type upgrades
├── authors/                    # Author management
│   ├── route.ts               # CRUD operations
│   └── [id]/route.ts          # Individual author operations
├── books/                      # Book management
│   ├── route.ts               # CRUD operations
│   └── [id]/route.ts          # Individual book operations
├── campaigns/                  # Campaign management
├── comments/                   # Comment system
├── csrf/                       # CSRF protection
│   └── generate/route.ts       # CSRF token generation
├── entries/                    # Contest entries
├── pen-names/                  # Pen name management
├── reader-magnets/             # Reader magnet system
├── votes/                      # Voting system
└── sitemap-*.xml/              # SEO sitemaps
```

## Middleware Pattern

### `withApiHandler` - Core Middleware

The `withApiHandler` function from `@/lib/api-middleware` provides:

- **Authentication**: Optional, required, or none
- **Client Type**: Service or authenticated Supabase client
- **Error Handling**: Automatic error catching and formatting
- **Request Parsing**: Body and query parameter validation
- **Rate Limiting**: IP and user-based rate limiting
- **Logging**: Request/response logging

```typescript
export const GET = withApiHandler(
  async (req, { supabase, query, user }) => {
    // Your handler logic here
    return successResponse(data)
  },
  {
    auth: 'optional',        // 'none' | 'optional' | 'required'
    clientType: 'service'    // 'service' | 'authenticated'
  }
)
```

### `withCachedApiHandler` - Caching Middleware

Enhanced middleware that adds caching capabilities:

```typescript
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

## API Routes

### Authentication Routes

#### `POST /api/auth/track-login`
- **Purpose**: Track user login attempts
- **Auth**: None required
- **Body**: `{ email, success, ip_address, user_agent }`
- **Response**: Success confirmation

#### `POST /api/auth/upgrade-user-type`
- **Purpose**: Upgrade user account type
- **Auth**: Required
- **Body**: `{ user_type }`
- **Response**: Updated user data

### Content Routes

#### `GET /api/authors`
- **Purpose**: List all authors with pagination
- **Auth**: None required
- **Query**: `{ page, limit, search, sortBy }`
- **Response**: Paginated author list with pen names

#### `GET /api/authors/[id]`
- **Purpose**: Get specific author details
- **Auth**: None required
- **Response**: Author details with books and campaigns

#### `GET /api/books`
- **Purpose**: List all books with filtering
- **Auth**: None required
- **Query**: `{ page, limit, genre, search, user_id, sortBy }`
- **Response**: Paginated book list with pen names and delivery methods
- **Cache**: 2 minutes (database cache)

#### `GET /api/books/[id]`
- **Purpose**: Get specific book details
- **Auth**: None required
- **Response**: Book details with related data

### Campaign Routes

#### `GET /api/campaigns`
- **Purpose**: List all campaigns
- **Auth**: None required
- **Query**: `{ page, limit, status, campaign_type, pen_name_id }`
- **Response**: Paginated campaign list

#### `POST /api/campaigns`
- **Purpose**: Create new campaign
- **Auth**: Required
- **Body**: Campaign data
- **Response**: Created campaign

### Interaction Routes

#### `GET /api/comments`
- **Purpose**: List comments for a book
- **Auth**: None required
- **Query**: `{ book_id, page, limit }`
- **Response**: Paginated comments with user data

#### `POST /api/comments`
- **Purpose**: Create new comment
- **Auth**: Required
- **Body**: `{ book_id, content }`
- **Response**: Created comment

#### `GET /api/entries`
- **Purpose**: List contest entries
- **Auth**: None required
- **Query**: `{ campaign_id, page, limit }`
- **Response**: Paginated entries

#### `POST /api/entries`
- **Purpose**: Create contest entry
- **Auth**: None required
- **Body**: Entry data
- **Response**: Created entry

#### `GET /api/votes`
- **Purpose**: List votes for a book
- **Auth**: None required
- **Query**: `{ book_id, page, limit }`
- **Response**: Paginated votes

#### `POST /api/votes`
- **Purpose**: Create vote
- **Auth**: Required
- **Body**: `{ book_id, vote_type }`
- **Response**: Created vote

### Utility Routes

#### `GET /api/csrf/generate`
- **Purpose**: Generate CSRF token
- **Auth**: None required
- **Response**: CSRF token

#### `GET /api/pen-names`
- **Purpose**: List pen names
- **Auth**: None required
- **Query**: `{ page, limit, search }`
- **Response**: Paginated pen names

#### `GET /api/reader-magnets`
- **Purpose**: List reader magnets
- **Auth**: None required
- **Query**: `{ page, limit, search }`
- **Response**: Paginated reader magnets

## Response Format

All API responses follow a consistent format:

### Success Responses

```typescript
// Single item
{
  "success": true,
  "data": { /* item data */ }
}

// Paginated list
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Responses

```typescript
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* additional error details */ }
}
```

## Caching Strategy

### Cache Types

1. **Static Content** (1 year)
   - Images, CSS, JS files
   - Sitemaps

2. **API Responses** (5 minutes)
   - General API endpoints
   - Stale-while-revalidate: 1 hour

3. **User Content** (1 minute)
   - Personalized data
   - Varies by Authorization header

4. **Database Queries** (2 minutes)
   - Database-heavy operations
   - Stale-while-revalidate: 10 minutes

### Cache Headers

```http
Cache-Control: max-age=120, s-maxage=120, stale-while-revalidate=600
Cache-Tags: database
X-Cache: HIT
```

## Security Features

### Rate Limiting
- **IP-based**: 100 requests per minute
- **User-based**: 200 requests per minute
- **Suspicious activity**: Automatic blocking

### Input Sanitization
- **XSS Protection**: HTML sanitization with DOMPurify
- **SQL Injection**: Parameterized queries
- **Input Validation**: Zod schema validation

### CORS Configuration
- **Development**: Allow all origins
- **Production**: Restricted to allowed domains
- **Credentials**: Supported for authenticated requests

### Security Headers
- **CSP**: Content Security Policy
- **HSTS**: HTTP Strict Transport Security
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME type sniffing protection

## Error Handling

### Automatic Error Handling
- **Validation Errors**: 400 Bad Request
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Not Found**: 404 Not Found
- **Rate Limiting**: 429 Too Many Requests
- **Server Errors**: 500 Internal Server Error

### Error Recovery
- **Retry Logic**: Automatic retry for transient failures
- **Circuit Breaker**: Prevents cascade failures
- **Graceful Degradation**: Fallback responses

## Performance Optimizations

### Image Optimization
- **Next.js Image**: Automatic WebP conversion
- **Lazy Loading**: Images load as needed
- **Responsive Sizing**: Appropriate sizes for different screens
- **Blur Placeholders**: Smooth loading experience

### API Caching
- **In-Memory Cache**: Fast response times
- **TTL Management**: Automatic expiration
- **Cache Invalidation**: Tag-based invalidation
- **Cache Warming**: Pre-populate frequently accessed data

### Bundle Optimization
- **Code Splitting**: Dynamic imports for heavy components
- **Tree Shaking**: Remove unused code
- **Bundle Analysis**: Monitor bundle sizes
- **Compression**: Gzip/Brotli compression

## Development Guidelines

### Adding New Routes

1. **Create route file**: `app/api/your-route/route.ts`
2. **Use middleware**: Wrap with `withApiHandler` or `withCachedApiHandler`
3. **Define schemas**: Add Zod validation schemas
4. **Handle errors**: Use standardized error responses
5. **Add tests**: Test all endpoints thoroughly

### Example Route

```typescript
import { withApiHandler } from '@/lib/api-middleware'
import { parseBody } from '@/lib/api-request'
import { successResponse, badRequestError } from '@/lib/api-response'
import { z } from 'zod'

const CreateItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
})

export const POST = withApiHandler(
  async (req, { supabase, user }) => {
    const validated = await parseBody(req, CreateItemSchema)
    
    const { data, error } = await supabase
      .from('items')
      .insert({ ...validated, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    
    return successResponse(data)
  },
  {
    auth: 'required',
    clientType: 'authenticated'
  }
)
```

## Monitoring and Logging

### Request Logging
- **Method and URL**: Track all requests
- **Response Time**: Monitor performance
- **Status Codes**: Track success/failure rates
- **User Context**: Log user information

### Performance Metrics
- **Response Times**: Average, P95, P99
- **Cache Hit Rates**: Monitor cache effectiveness
- **Error Rates**: Track error frequency
- **Memory Usage**: Monitor resource usage

### Health Checks
- **Database**: Connection health
- **External Services**: Third-party service status
- **Cache**: Cache system health
- **Rate Limits**: Current usage levels

## Deployment Considerations

### Environment Variables
- **Database**: Supabase connection strings
- **Security**: CSRF secrets, rate limit keys
- **Caching**: Redis connection (production)
- **Monitoring**: Error tracking, analytics

### Production Optimizations
- **Redis Caching**: Replace in-memory cache
- **CDN**: Static asset delivery
- **Load Balancing**: Distribute traffic
- **Monitoring**: Error tracking and performance monitoring

### Security Checklist
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Error handling comprehensive
- [ ] Logging configured
- [ ] Monitoring active

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check Supabase configuration
   - Verify JWT tokens
   - Check user permissions

2. **Rate Limiting**
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

Enable debug logging by setting:
```bash
DEBUG=api:*
```

This will log detailed information about:
- Request/response cycles
- Cache hits/misses
- Rate limiting decisions
- Authentication flow
- Error details

## API Versioning

### Current Version: v1.0

All endpoints are currently at version 1.0. Future versions will be added as:
- `/api/v2/endpoint` for new versions
- Backward compatibility maintained
- Deprecation notices for old versions

## Support

For API support and questions:
- **Documentation**: This README
- **Examples**: Check `components/examples/` for usage examples
- **Testing**: Use the performance testing components
- **Issues**: Report bugs and feature requests

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
