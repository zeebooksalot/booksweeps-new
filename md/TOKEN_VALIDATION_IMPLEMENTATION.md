# Token Validation Endpoint Implementation

## Overview

The token validation endpoint (`/api/reader/validate-token`) is the core API that enables the reader site to validate access tokens and retrieve complete book information. This document explains how the implementation works and why it's designed as a single, comprehensive API call.

## Architecture

### Single API Call Design ✅

The endpoint is designed to return **complete book information in a single API call**, eliminating the need for multiple requests from the reader site.

```
Reader Site (read.booksweeps.com)
    ↓ POST /api/reader/validate-token
Main Site (staging.booksweeps.com)
    ↓ Single Database Query
Complete Book Data Response
```

## Implementation Details

### 1. Token Validation Process

```typescript
// Validate the access token
const validationResult = await validateAccessToken(token)

if (!validationResult.isValid) {
  return NextResponse.json(
    { 
      error: validationResult.error || 'Invalid access token',
      reason: validationResult.reason 
    },
    { status: 401 }
  )
}
```

### 2. Comprehensive Database Query

The endpoint makes a single, comprehensive query that joins all necessary tables:

> **Note**: The current implementation could be enhanced to include `file_size` in the query for better user experience (showing download size). Currently, only `id`, `file_path`, `file_name`, and `mime_type` are returned.

```typescript
const { data: bookData, error: bookError } = await supabase
  .from('reader_deliveries')
  .select(`
    id,
    delivery_method_id,
    reader_email,
    reader_name,
    delivered_at,
    download_count,
    last_download_at,
    book_delivery_methods (
      id,
      title,
      description,
      format,
      books (
        id,
        title,
        author,
        cover_image_url,
        genre,
        page_count,
        book_files (
          id,
          file_path,
          file_name,
          mime_type
        )
      )
    )
  `)
  .eq('id', delivery.id)
  .single()
```

### 3. Complete Response Structure

The endpoint returns a comprehensive response with all necessary data:

```typescript
{
  success: true,
  delivery: {
    id: bookData.id,
    email: bookData.reader_email,
    name: bookData.reader_name || '',
    delivered_at: bookData.delivered_at || null,
    download_count: bookData.download_count || 0
  },
  book: {
    id: book?.id,
    title: book?.title,
    author: book?.author,
    cover_url: book?.cover_image_url,
    genre: book?.genre,
    page_count: book?.page_count,
    format: deliveryMethod?.format,
    files: book?.book_files || []
  },
  delivery_method: {
    id: deliveryMethod?.id,
    title: deliveryMethod?.title,
    description: deliveryMethod?.description
  }
}
```

## Database Schema Relationships

The implementation correctly follows these database relationships:

```
reader_deliveries (access_token, re_download_count) ✅
    ↓ delivery_method_id
book_delivery_methods (format, title, description)
    ↓ book_id
books (title, author, cover_image_url, genre, page_count)
    ↓ book_id
book_files (file_path, file_name, mime_type)
```

> **Note**: The `re_download_count` column and `user_upgrade_logs` table have been implemented in migration `20250818044412_remote_schema.sql`, enabling complete analytics and tracking capabilities for the token system.

### Table Descriptions

#### `reader_deliveries`
- **Purpose**: Stores delivery records with access tokens
- **Key Fields**: `id`, `delivery_method_id`, `reader_email`, `access_token`, `expires_at`
- **Status**: Tracks delivery status and download counts

#### `book_delivery_methods`
- **Purpose**: Defines how books are delivered (reader magnets, etc.)
- **Key Fields**: `id`, `book_id`, `title`, `description`, `format`
- **Format**: epub, pdf, mobi, audio, print

#### `books`
- **Purpose**: Core book information
- **Key Fields**: `id`, `title`, `author`, `cover_image_url`, `genre`, `page_count`
- **Metadata**: Complete book details for display

#### `book_files`
- **Purpose**: Actual book file attachments
- **Key Fields**: `id`, `file_path`, `file_name`, `mime_type`, `file_size`, `delivery_method_id`
- **Access**: Files for reading/downloading
- **Storage**: Supports multiple providers (supabase, bunny, aws)

## Security Features

### 1. Token Validation
- Validates access token format and existence
- Checks token expiration
- Verifies delivery status

### 2. Rate Limiting
- Prevents abuse through token usage tracking
- Implements daily download limits (10 downloads per token per day)
- Tracks last download timestamps and resets count after 24 hours
- Uses database-level increment for atomic counter updates

### 3. CORS Configuration
```typescript
// OPTIONS method includes all CORS headers
response.headers.set('Access-Control-Allow-Origin', 'https://read.booksweeps.com')
response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
response.headers.set('Access-Control-Max-Age', '86400')

// POST method includes basic CORS headers
response.headers.set('Access-Control-Allow-Origin', 'https://read.booksweeps.com')
response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
```

### 4. Error Handling
- Comprehensive error responses
- Sanitized error messages for security
- Request logging and monitoring

## Performance Benefits

### 1. Single API Call
- **Before**: Multiple requests for book data, files, delivery info
- **After**: One comprehensive request with all data

### 2. Efficient Database Queries
- Uses Supabase's built-in joins
- Single query instead of multiple round trips
- Optimized data retrieval

### 3. Reduced Latency
- Eliminates cross-site API call overhead
- Faster response times
- Better user experience

## Usage Flow

### 1. Reader Site Integration
```typescript
// Reader site calls the validation endpoint
const response = await fetch('https://staging.booksweeps.com/api/reader/validate-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: accessToken })
})

const data = await response.json()
```

### 2. Data Processing
```typescript
// Reader site processes the complete response
if (data.success) {
  // Add book to user's library
  await addBookToLibrary(data.book, 'access_token')
  
  // Provide access to book files
  const bookFiles = data.book.files
  
  // Display book information
  displayBookInfo(data.book, data.delivery_method)
}
```

## API Endpoint Specification

### Request
```http
POST /api/reader/validate-token
Content-Type: application/json

{
  "token": "uuid-access-token"
}
```

### Response (Success)
```json
{
  "success": true,
  "delivery": {
    "id": "uuid",
    "email": "reader@example.com",
    "name": "Reader Name",
    "delivered_at": "2024-01-01T00:00:00Z",
    "download_count": 1
  },
  "book": {
    "id": "uuid",
    "title": "Book Title",
    "author": "Author Name",
    "cover_url": "https://example.com/cover.jpg",
    "genre": "Fiction",
    "page_count": 300,
    "format": "epub",
    "files": [
      {
        "id": "uuid",
        "file_path": "books/book.epub",
        "file_name": "book.epub",
        "mime_type": "application/epub+zip"
      }
    ]
  },
  "delivery_method": {
    "id": "uuid",
    "title": "Free eBook Download",
    "description": "Download this book for free"
  }
}
```

### Response (Error)
```json
{
  "error": "Invalid access token",
  "reason": "expired"
}
```

## Benefits of Current Implementation

### 1. **Performance**
- ✅ Single API call instead of multiple requests
- ✅ Efficient database joins
- ✅ Reduced latency and bandwidth usage

### 2. **Simplicity**
- ✅ Reader site only needs one API call
- ✅ Complete data in single response
- ✅ No complex data aggregation logic

### 3. **Reliability**
- ✅ Atomic operation - all data or nothing
- ✅ Consistent error handling
- ✅ Proper validation and security

### 4. **Maintainability**
- ✅ Single source of truth for book data
- ✅ Easy to extend with additional fields
- ✅ Clear separation of concerns

## Conclusion

The token validation endpoint is **optimally implemented** as a single, comprehensive API that:

- ✅ Returns complete book information in one call
- ✅ Uses efficient database joins
- ✅ Includes all necessary data for the reader site
- ✅ Implements proper security measures
- ✅ Provides excellent performance

**No additional API calls are needed** - the current implementation already provides everything the reader site requires to validate tokens and access book content.

## Related Documentation

- [Reader Integration Guide](./md/READER_INTEGRATION.md)
- [Database Schema](./md/DATABASE_SCHEMA.md)
- [API Documentation](./md/API_DOCUMENTATION.md)
- [Security Implementation](./SECURITY_IMPROVEMENTS.md)
