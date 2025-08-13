import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateAccessToken } from '@/lib/access-token'
import { 
  sanitizeError, 
  createErrorResponse, 
  extractErrorContext
} from '@/lib/error-handler'

// Allow CORS for cross-domain requests from reader subdomain
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://read.booksweeps.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(2, 15)
  
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.error(`[${requestId}] ❌ Database connection not available`)
      const response = NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
      response.headers.set('Access-Control-Allow-Origin', 'https://read.booksweeps.com')
      return response
    }

    // Parse request body
    let body: { token: string }
    try {
      body = await request.json()
    } catch {
      console.error(`[${requestId}] ❌ Invalid JSON in request body`)
      const context = extractErrorContext(request)
      const sanitizedError = sanitizeError(new Error('Invalid request format'), context)
      return createErrorResponse(sanitizedError, 400)
    }

    const { token } = body

    if (!token) {
      console.error(`[${requestId}] ❌ Missing token in request`)
      const response = NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', 'https://read.booksweeps.com')
      return response
    }

    // Validate the access token
    const validationResult = await validateAccessToken(token)

    if (!validationResult.isValid) {
      console.warn(`[${requestId}] 🚫 Invalid token: ${validationResult.reason}`)
      const response = NextResponse.json(
        { 
          error: validationResult.error || 'Invalid access token',
          reason: validationResult.reason 
        },
        { status: 401 }
      )
      response.headers.set('Access-Control-Allow-Origin', 'https://read.booksweeps.com')
      return response
    }

    const delivery = validationResult.token!
    
    // Get book information for the delivery
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

    if (bookError || !bookData) {
      console.error(`[${requestId}] ❌ Failed to fetch book data:`, bookError)
      const response = NextResponse.json(
        { error: 'Failed to fetch book information' },
        { status: 500 }
      )
      response.headers.set('Access-Control-Allow-Origin', 'https://read.booksweeps.com')
      return response
    }

    // Update token usage
    const { updateTokenUsage } = await import('@/lib/access-token')
    await updateTokenUsage(delivery.id)

    const responseTime = Date.now() - startTime
    
    const deliveryMethod = bookData.book_delivery_methods?.[0]
    const book = deliveryMethod?.books?.[0]
    
    console.log(`[${requestId}] ✅ Token validation successful`, {
      responseTime: `${responseTime}ms`,
      deliveryId: delivery.id,
      bookTitle: book?.title
    })

    const response = NextResponse.json({
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
    })

    // Add CORS headers for cross-domain requests
    response.headers.set('Access-Control-Allow-Origin', 'https://read.booksweeps.com')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return response

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`[${requestId}] 💥 Token validation failed:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`
    })
    
    const context = extractErrorContext(request)
    const sanitizedError = sanitizeError(error, context)
    const response = createErrorResponse(sanitizedError, 500)
    response.headers.set('Access-Control-Allow-Origin', 'https://read.booksweeps.com')
    return response
  }
}
