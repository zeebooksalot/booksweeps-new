import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
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
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

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
    
    // Get book information for the delivery using separate queries
    // First, get the delivery record
    const { data: deliveryData, error: deliveryError } = await supabase
      .from('reader_deliveries')
      .select('*')
      .eq('id', delivery.id)
      .single()
      
    if (deliveryError || !deliveryData) {
      console.error(`[${requestId}] ❌ Failed to fetch delivery data:`, deliveryError)
      const response = NextResponse.json(
        { error: 'Failed to fetch delivery information' },
        { status: 500 }
      )
      response.headers.set('Access-Control-Allow-Origin', 'https://read.booksweeps.com')
      return response
    }

    // Get the delivery method
    const { data: deliveryMethodData, error: deliveryMethodError } = await supabase
      .from('book_delivery_methods')
      .select('*')
      .eq('id', deliveryData.delivery_method_id)
      .single()

    if (deliveryMethodError || !deliveryMethodData) {
      console.error(`[${requestId}] ❌ Failed to fetch delivery method:`, deliveryMethodError)
      const response = NextResponse.json(
        { error: 'Failed to fetch delivery method information' },
        { status: 500 }
      )
      response.headers.set('Access-Control-Allow-Origin', 'https://read.booksweeps.com')
      return response
    }

    // Get the book
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', deliveryMethodData.book_id)
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

    // Get the book files
    const { data: bookFilesData, error: bookFilesError } = await supabase
      .from('book_files')
      .select('*')
      .eq('book_id', bookData.id)

    if (bookFilesError) {
      console.error(`[${requestId}] ❌ Failed to fetch book files:`, bookFilesError)
      // Don't fail the request if files can't be fetched, just log it
    }

    // Debug logging to understand the data structure
    console.log(`[${requestId}] 🔍 Book data structure:`, {
      deliveryId: deliveryData.id,
      deliveryMethodId: deliveryData.delivery_method_id,
      deliveryMethodTitle: deliveryMethodData.title,
      bookTitle: bookData.title,
      bookFilesCount: bookFilesData?.length || 0
    })

    // Update token usage
    const { updateTokenUsage } = await import('@/lib/access-token')
    await updateTokenUsage(delivery.id)

    const responseTime = Date.now() - startTime
    
    console.log(`[${requestId}] ✅ Token validation successful`, {
      responseTime: `${responseTime}ms`,
      deliveryId: delivery.id,
      bookTitle: bookData.title,
      deliveryMethodTitle: deliveryMethodData.title,
      hasBook: !!bookData,
      hasDeliveryMethod: !!deliveryMethodData,
      bookFilesCount: bookFilesData?.length || 0
    })

    const response = NextResponse.json({
      success: true,
      delivery: {
        id: deliveryData.id,
        email: deliveryData.reader_email,
        name: deliveryData.reader_name || '',
        delivered_at: deliveryData.delivered_at || null,
        download_count: deliveryData.download_count || 0
      },
      book: {
        id: bookData.id,
        title: bookData.title,
        author: bookData.author,
        cover_url: bookData.cover_image_url,
        genre: bookData.genre,
        page_count: bookData.page_count,
        format: deliveryMethodData.format,
        files: bookFilesData || []
      },
      delivery_method: {
        id: deliveryMethodData.id,
        title: deliveryMethodData.title,
        description: deliveryMethodData.description
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
