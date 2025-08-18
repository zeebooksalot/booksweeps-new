# API Documentation

## 🔗 Base URLs

```
Production: https://booksweeps.com/api
Development: http://localhost:3000/api
```

## 🔐 Authentication

All API endpoints require authentication unless specified as public. Authentication is handled via Supabase JWT tokens.

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Token Management
```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Refresh token if needed
const { data, error } = await supabase.auth.refreshSession()
```

## 📚 Books API

### Get Books
```http
GET /api/books
```

**Query Parameters:**
- `user_id` (optional): Filter by author
- `genre` (optional): Filter by genre
- `status` (optional): Filter by status (active, draft, archived)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Book Title",
      "author": "Author Name",
      "description": "Book description",
      "cover_image_url": "https://...",
      "genre": "Fantasy",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "pen_name": {
        "name": "Pen Name",
        "bio": "Author bio"
      }
    }
  ],
  "count": 50,
  "hasMore": true
}
```

### Create Book
```http
POST /api/books
```

**Request Body:**
```json
{
  "title": "Book Title",
  "author": "Author Name",
  "description": "Book description",
  "genre": "Fantasy",
  "publisher": "Publisher Name",
  "published_date": "2024-01-01",
  "page_count": 300,
  "language": "English",
  "pen_name_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Book Title",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update Book
```http
PUT /api/books/{id}
```

**Request Body:** Same as create, but all fields optional

### Delete Book
```http
DELETE /api/books/{id}
```

## 📖 Campaigns API

### Get Campaigns
```http
GET /api/campaigns
```

**Query Parameters:**
- `user_id` (optional): Filter by author
- `status` (optional): Filter by status (draft, active, paused, ended)
- `type` (optional): Filter by type (giveaway, reader_magnet)
- `limit` (optional): Number of results
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Campaign Title",
      "description": "Campaign description",
      "status": "active",
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-01-31T23:59:59Z",
      "entry_count": 150,
      "max_entries": 1000,
      "number_of_winners": 5,
      "book": {
        "title": "Book Title",
        "cover_image_url": "https://..."
      }
    }
  ]
}
```

### Create Campaign
```http
POST /api/campaigns
```

**Request Body:**
```json
{
  "title": "Campaign Title",
  "description": "Campaign description",
  "book_id": "uuid",
  "campaign_type": "giveaway",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-31T23:59:59Z",
  "max_entries": 1000,
  "number_of_winners": 5,
  "prize_description": "One signed copy",
  "rules": "Open to US residents 18+",
  "minimum_age": 18,
  "eligibility_countries": ["US", "CA"]
}
```

### Update Campaign
```http
PUT /api/campaigns/{id}
```

### Delete Campaign
```http
DELETE /api/campaigns/{id}
```

## 🎯 Campaign Entries API

### Get User Entries
```http
GET /api/reader/entries
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "campaign": {
        "id": "uuid",
        "title": "Campaign Title",
        "status": "active"
      },
      "entry_method": "email",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Enter Campaign
```http
POST /api/campaigns/{campaign_id}/entries
```

**Request Body:**
```json
{
  "email": "reader@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "entry_method": "email",
  "marketing_opt_in": true
}
```

## 📁 File Upload API

### Upload Book File
```http
POST /api/books/{book_id}/files
```

**Headers:**
```http
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Book file (EPUB, PDF, etc.)
- `file_type`: Type of file (book, sample, audio)
- `title`: File title

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_name": "book.epub",
    "file_path": "books/user_id/book_id/book.epub",
    "file_size": 2048576,
    "file_type": "book",
    "download_count": 0
  }
}
```

### Get Book Files
```http
GET /api/books/{book_id}/files
```

### Delete Book File
```http
DELETE /api/books/{book_id}/files/{file_id}
```

## 📊 Analytics API

### Get Author Analytics
```http
GET /api/analytics/author
```

**Query Parameters:**
- `start_date`: Start date for analytics
- `end_date`: End date for analytics
- `metric`: Specific metric (downloads, entries, conversions)

**Response:**
```json
{
  "data": {
    "total_downloads": 1250,
    "total_entries": 3400,
    "conversion_rate": 36.8,
    "top_books": [
      {
        "book_id": "uuid",
        "title": "Book Title",
        "downloads": 450,
        "entries": 1200
      }
    ],
    "daily_stats": [
      {
        "date": "2024-01-01",
        "downloads": 25,
        "entries": 67
      }
    ]
  }
}
```

### Get Campaign Analytics
```http
GET /api/campaigns/{campaign_id}/analytics
```

## 🔍 Search API

### Search Books
```http
GET /api/search/books
```

**Query Parameters:**
- `q`: Search query
- `genre`: Filter by genre
- `author`: Filter by author
- `limit`: Number of results

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Book Title",
      "author": "Author Name",
      "genre": "Fantasy",
      "cover_image_url": "https://...",
      "relevance_score": 0.95
    }
  ],
  "total": 150
}
```

## 🚨 Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "title",
      "issue": "Title is required"
    }
  }
}
```

### Common Error Codes
- `AUTHENTICATION_ERROR`: Invalid or missing token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Server error

## 📝 Rate Limiting

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **File uploads**: 10 uploads per minute

## 🔄 Webhooks

### Campaign Entry Webhook
```http
POST /webhook/campaign-entry
```

**Headers:**
```http
X-Webhook-Signature: <signature>
```

**Body:**
```json
{
  "event": "campaign.entry.created",
  "data": {
    "entry_id": "uuid",
    "campaign_id": "uuid",
    "user_email": "reader@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## 📱 SDK Examples

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Get books
const { data: books, error } = await supabase
  .from('books')
  .select('*')
  .eq('user_id', userId)

// Create campaign
const { data: campaign, error } = await supabase
  .from('campaigns')
  .insert(campaignData)
  .select()
  .single()
```

### React Hook Example
```typescript
import { useQuery, useMutation } from '@tanstack/react-query'

// Get user library
const { data: library, isLoading } = useQuery({
  queryKey: ['library'],
  queryFn: () => fetch('/api/reader/library').then(res => res.json())
})

// Update reading progress
const updateProgress = useMutation({
  mutationFn: (data) => 
    fetch(`/api/reader/progress/${bookId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json())
})
```

---

*This API documentation provides comprehensive coverage of all endpoints and usage patterns for the BookSweeps platform.* 