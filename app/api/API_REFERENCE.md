# API Reference Guide

## Quick Reference

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Authentication
Most endpoints support optional authentication. When authentication is required, include the session cookie or Authorization header.

### Rate Limits
- **IP-based**: 100 requests/minute
- **User-based**: 200 requests/minute
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Endpoints

### Authentication

#### Track Login
```http
POST /api/auth/track-login
Content-Type: application/json

{
  "email": "user@example.com",
  "success": true,
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login tracked successfully"
}
```

#### Upgrade User Type
```http
POST /api/auth/upgrade-user-type
Content-Type: application/json
Authorization: Bearer <token>

{
  "user_type": "premium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "user_type": "premium",
    "updated_at": "2025-10-21T22:00:00Z"
  }
}
```

### Authors

#### List Authors
```http
GET /api/authors?page=1&limit=10&search=author&sortBy=name
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "author-id",
      "name": "Author Name",
      "bio": "Author biography",
      "avatar_url": "https://example.com/avatar.jpg",
      "pen_names": [
        {
          "id": "pen-name-id",
          "name": "Pen Name",
          "bio": "Pen name bio"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Get Author Details
```http
GET /api/authors/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "author-id",
    "name": "Author Name",
    "bio": "Author biography",
    "avatar_url": "https://example.com/avatar.jpg",
    "books": [
      {
        "id": "book-id",
        "title": "Book Title",
        "cover_image_url": "https://example.com/cover.jpg"
      }
    ],
    "campaigns": [
      {
        "id": "campaign-id",
        "title": "Campaign Title",
        "status": "active"
      }
    ]
  }
}
```

### Books

#### List Books
```http
GET /api/books?page=1&limit=10&genre=romance&search=title&user_id=user-id&sortBy=title
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "book-id",
      "title": "Book Title",
      "author": "Author Name",
      "description": "Book description",
      "cover_image_url": "https://example.com/cover.jpg",
      "genre": "romance",
      "upvotes_count": 10,
      "downvotes_count": 2,
      "comments_count": 5,
      "pen_names": {
        "id": "pen-name-id",
        "name": "Pen Name"
      },
      "book_delivery_methods": [
        {
          "id": "delivery-id",
          "format": "epub",
          "is_active": true
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### Get Book Details
```http
GET /api/books/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "book-id",
    "title": "Book Title",
    "author": "Author Name",
    "description": "Book description",
    "cover_image_url": "https://example.com/cover.jpg",
    "genre": "romance",
    "page_count": 300,
    "language": "en",
    "published_date": "2024-01-01",
    "upvotes_count": 10,
    "downvotes_count": 2,
    "comments_count": 5,
    "pen_names": {
      "id": "pen-name-id",
      "name": "Pen Name",
      "bio": "Pen name bio"
    },
    "book_delivery_methods": [
      {
        "id": "delivery-id",
        "format": "epub",
        "is_active": true,
        "delivery_method": "ebook"
      }
    ]
  }
}
```

### Campaigns

#### List Campaigns
```http
GET /api/campaigns?page=1&limit=10&status=active&campaign_type=giveaway&pen_name_id=pen-name-id
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "campaign-id",
      "title": "Campaign Title",
      "description": "Campaign description",
      "status": "active",
      "campaign_type": "giveaway",
      "start_date": "2025-01-01T00:00:00Z",
      "end_date": "2025-12-31T23:59:59Z",
      "max_entries": 1000,
      "entry_count": 150,
      "pen_names": {
        "id": "pen-name-id",
        "name": "Pen Name"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Create Campaign
```http
POST /api/campaigns
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "New Campaign",
  "description": "Campaign description",
  "book_id": "book-id",
  "start_date": "2025-01-01T00:00:00Z",
  "end_date": "2025-12-31T23:59:59Z",
  "max_entries": 1000,
  "campaign_type": "giveaway"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "campaign-id",
    "title": "New Campaign",
    "description": "Campaign description",
    "status": "draft",
    "created_at": "2025-10-21T22:00:00Z"
  }
}
```

### Comments

#### List Comments
```http
GET /api/comments?book_id=book-id&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "comment-id",
      "content": "Great book!",
      "created_at": "2025-10-21T22:00:00Z",
      "user_id": "user-id",
      "book_id": "book-id"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Create Comment
```http
POST /api/comments
Content-Type: application/json
Authorization: Bearer <token>

{
  "book_id": "book-id",
  "content": "Great book!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "comment-id",
    "content": "Great book!",
    "book_id": "book-id",
    "user_id": "user-id",
    "created_at": "2025-10-21T22:00:00Z"
  }
}
```

### Entries

#### List Entries
```http
GET /api/entries?campaign_id=campaign-id&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "entry-id",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "entry_method": "email",
      "status": "valid",
      "created_at": "2025-10-21T22:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

#### Create Entry
```http
POST /api/entries
Content-Type: application/json

{
  "campaign_id": "campaign-id",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "entry_method": "email",
  "marketing_opt_in": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "entry-id",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "entry_method": "email",
    "status": "valid",
    "created_at": "2025-10-21T22:00:00Z"
  }
}
```

### Votes

#### List Votes
```http
GET /api/votes?book_id=book-id&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "vote-id",
      "book_id": "book-id",
      "user_id": "user-id",
      "vote_type": "upvote",
      "created_at": "2025-10-21T22:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Create Vote
```http
POST /api/votes
Content-Type: application/json
Authorization: Bearer <token>

{
  "book_id": "book-id",
  "vote_type": "upvote"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "vote-id",
    "book_id": "book-id",
    "user_id": "user-id",
    "vote_type": "upvote",
    "created_at": "2025-10-21T22:00:00Z"
  }
}
```

### Utility Endpoints

#### Generate CSRF Token
```http
GET /api/csrf/generate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "csrf-token-here"
  }
}
```

#### List Pen Names
```http
GET /api/pen-names?page=1&limit=10&search=name
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pen-name-id",
      "name": "Pen Name",
      "bio": "Pen name bio",
      "user_id": "user-id"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### List Reader Magnets
```http
GET /api/reader-magnets?page=1&limit=10&search=title
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "magnet-id",
      "title": "Reader Magnet Title",
      "description": "Magnet description",
      "download_url": "https://example.com/download",
      "user_id": "user-id"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "code": "FORBIDDEN"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "error": "Resource not found",
  "code": "NOT_FOUND"
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "details": {
    "retry_after": 60
  }
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "SERVER_ERROR"
}
```

## Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Sorting
- `sortBy`: Field to sort by
- `sortOrder`: `asc` or `desc` (default: `asc`)

### Filtering
- `search`: Text search across relevant fields
- `status`: Filter by status
- `genre`: Filter by genre
- `user_id`: Filter by user
- `campaign_id`: Filter by campaign
- `book_id`: Filter by book

### Date Filtering
- `start_date`: Filter from date
- `end_date`: Filter to date
- `created_after`: Filter created after date
- `created_before`: Filter created before date

## Response Headers

### Cache Headers
```
Cache-Control: max-age=120, s-maxage=120, stale-while-revalidate=600
Cache-Tags: database
X-Cache: HIT
```

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## SDK Examples

### JavaScript/TypeScript
```typescript
// Using fetch
const response = await fetch('/api/books?page=1&limit=10', {
  headers: {
    'Content-Type': 'application/json',
  }
})
const data = await response.json()

// Using axios
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  }
})

const books = await api.get('/books', {
  params: { page: 1, limit: 10 }
})
```

### Python
```python
import requests

response = requests.get('http://localhost:3000/api/books', 
                       params={'page': 1, 'limit': 10})
data = response.json()
```

### cURL
```bash
# Get books
curl -X GET "http://localhost:3000/api/books?page=1&limit=10"

# Create comment
curl -X POST "http://localhost:3000/api/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"book_id": "book-id", "content": "Great book!"}'
```

## Testing

### Health Check
```bash
curl -X GET "http://localhost:3000/api/books?limit=1"
```

### Performance Test
```bash
# Test caching
curl -X GET "http://localhost:3000/api/books?limit=1" -v
# Check for X-Cache: HIT on second request
```

### Rate Limit Test
```bash
# Test rate limiting
for i in {1..105}; do
  curl -X GET "http://localhost:3000/api/books?limit=1" -v
done
# Should get 429 after 100 requests
```

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
