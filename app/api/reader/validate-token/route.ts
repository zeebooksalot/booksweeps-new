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
    
    console.log(`[${requestId}] ✅ Token validation successful`, {
      responseTime: `${responseTime}ms`,
      deliveryId: delivery.id,
      bookTitle: bookData.book_delivery_methods?.books?.title
    })

    const response = NextResponse.json({
      success: true,
      delivery: {
        id: delivery.id,
        email: delivery.reader_email,
        name: delivery.reader_name,
        delivered_at: delivery.delivered_at,
        download_count: delivery.download_count
      },
      book: {
        id: bookData.book_delivery_methods?.books?.id,
        title: bookData.book_delivery_methods?.books?.title,
        author: bookData.book_delivery_methods?.books?.author,
        cover_url: bookData.book_delivery_methods?.books?.cover_image_url,
        genre: bookData.book_delivery_methods?.books?.genre,
        page_count: bookData.book_delivery_methods?.books?.page_count,
        format: bookData.book_delivery_methods?.format,
        files: bookData.book_delivery_methods?.books?.book_files || []
      },
      delivery_method: {
        id: bookData.book_delivery_methods?.id,
        title: bookData.book_delivery_methods?.title,
        description: bookData.book_delivery_methods?.description
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
