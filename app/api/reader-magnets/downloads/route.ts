import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getClientIP } from '@/lib/utils'
import { checkRateLimit, createRateLimitIdentifier, RATE_LIMITS } from '@/lib/rate-limiter'
import { 
  validateDownloadRequest, 
  validateRequestOrigin, 
  validateUserAgent,
  ValidationError,
  SecurityError 
} from '@/lib/validation'
import { 
  sanitizeError, 
  createErrorResponse, 
  extractErrorContext
} from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(2, 15)
  
  // Log only in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${requestId}] 🚀 Download request started`)
    console.log(`[${requestId}] 📍 Request timestamp: ${new Date().toISOString()}`)
  }
  
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.error(`[${requestId}] ❌ Database connection not available`)
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    // Security validation
    const userAgent = request.headers.get('user-agent')
    if (!validateUserAgent(userAgent)) {
      console.warn(`[${requestId}] 🚫 Invalid user agent: ${userAgent}`)
      const context = extractErrorContext(request)
      const sanitizedError = sanitizeError(new SecurityError('Invalid request'), context)
      return createErrorResponse(sanitizedError, 403)
    }

    if (!validateRequestOrigin(request)) {
      console.warn(`[${requestId}] 🚫 Invalid request origin`)
      const context = extractErrorContext(request)
      const sanitizedError = sanitizeError(new SecurityError('Invalid request origin'), context)
      return createErrorResponse(sanitizedError, 403)
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      console.error(`[${requestId}] ❌ Invalid JSON in request body`)
      const context = extractErrorContext(request)
      const sanitizedError = sanitizeError(new ValidationError('Invalid request format'), context)
      return createErrorResponse(sanitizedError, 400)
    }

    // Validate request data
    let validatedData
    try {
      validatedData = validateDownloadRequest(body)
    } catch (error) {
      console.error(`[${requestId}] ❌ Validation failed:`, error)
      const context = extractErrorContext(request)
      const sanitizedError = sanitizeError(error, context)
      return createErrorResponse(sanitizedError, 400)
    }

    const { delivery_method_id, email, name } = validatedData

    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${requestId}] 📝 Request data:`, {
        delivery_method_id,
        email: email ? `${email.substring(0, 3)}***@${email.split('@')[1]}` : null, // Mask email for privacy
        name: name ? `${name.substring(0, 1)}***` : null, // Mask name for privacy
        hasName: !!name
      })
    }

    // Get real IP address from request headers
    const clientIP = getClientIP(request)
    
    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${requestId}] 🌐 Client info:`, {
        ip: clientIP,
        userAgent: userAgent ? userAgent.substring(0, 50) + '...' : null,
        userAgentLength: userAgent?.length || 0
      })
    }

    // Apply rate limiting - check both IP and email-based limits
    const ipIdentifier = createRateLimitIdentifier('ip', clientIP, 'download')
    const emailIdentifier = createRateLimitIdentifier('email', email, 'download')
    
    // Check general download rate limit (IP-based)
    const ipRateLimit = await checkRateLimit(ipIdentifier, RATE_LIMITS.DOWNLOAD_GENERAL)
    if (!ipRateLimit.allowed) {
      console.warn(`[${requestId}] ⚠️ Rate limit exceeded for IP: ${clientIP}`)
      return NextResponse.json(
        { 
          error: 'Too many download requests. Please try again later.',
          retryAfter: Math.ceil(ipRateLimit.resetTime / 1000)
        },
        { status: 429 }
      )
    }
    
    // Check per-book download rate limit (email-based)
    const bookRateLimit = await checkRateLimit(
      `${emailIdentifier}:${delivery_method_id}`, 
      RATE_LIMITS.DOWNLOAD_BOOK
    )
    if (!bookRateLimit.allowed) {
      console.warn(`[${requestId}] ⚠️ Book download rate limit exceeded for email: ${email}`)
      return NextResponse.json(
        { 
          error: 'You have downloaded this book too many times. Please try again later.',
          retryAfter: Math.ceil(bookRateLimit.resetTime / 1000)
        },
        { status: 429 }
      )
    }

    // First, get the delivery method to check if it exists and is active
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${requestId}] 🔍 Fetching delivery method: ${delivery_method_id}`)
    }
    
    const { data: deliveryMethod, error: methodError } = await supabase
      .from('book_delivery_methods')
      .select(`
        *,
        books (
          id,
          title,
          author,
          cover_image_url,
          book_files (
            id,
            file_path,
            file_name,
            mime_type
          )
        )
      `)
      .eq('id', delivery_method_id)
      .eq('is_active', true)
      .eq('delivery_method', 'ebook')
      .single()

    if (methodError || !deliveryMethod) {
      console.error(`[${requestId}] ❌ Delivery method not found:`, {
        error: methodError?.message,
        delivery_method_id,
        found: !!deliveryMethod
      })
      return NextResponse.json(
        { error: 'Reader magnet not found or inactive' },
        { status: 404 }
      )
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[${requestId}] ✅ Delivery method found:`, {
        id: deliveryMethod.id,
        title: deliveryMethod.title,
        bookTitle: deliveryMethod.books?.title,
        author: deliveryMethod.books?.author,
        hasFiles: deliveryMethod.books?.book_files?.length > 0,
        fileCount: deliveryMethod.books?.book_files?.length || 0,
        downloadLimit: deliveryMethod.download_limit
      })
    }

    // Check download limit
    if (deliveryMethod.download_limit) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${requestId}] 📊 Checking download limit: ${deliveryMethod.download_limit}`)
      }
      
      const { count: totalDownloads } = await supabase
        .from('reader_deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('delivery_method_id', delivery_method_id)

      if (process.env.NODE_ENV === 'development') {
        console.log(`[${requestId}] 📈 Download stats:`, {
          current: totalDownloads || 0,
          limit: deliveryMethod.download_limit,
          remaining: deliveryMethod.download_limit - (totalDownloads || 0)
        })
      }

      if (totalDownloads && totalDownloads >= deliveryMethod.download_limit) {
        console.warn(`[${requestId}] ⚠️ Download limit reached: ${totalDownloads}/${deliveryMethod.download_limit}`)
        return NextResponse.json(
          { error: 'Download limit reached' },
          { status: 429 }
        )
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${requestId}] 📊 No download limit set`)
      }
    }

    // Check for existing delivery record to prevent duplicates
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${requestId}] 🔍 Checking for existing delivery record...`)
    }
    
    const { data: existingDelivery, error: existingError } = await supabase
      .from('reader_deliveries')
      .select('id, download_count, last_download_at, re_download_count, access_token')
      .eq('delivery_method_id', delivery_method_id)
      .eq('reader_email', email)
      .single()

    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error(`[${requestId}] ❌ Error checking existing delivery:`, {
        error: existingError.message,
        code: existingError.code
      })
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    let accessToken = null

    if (existingDelivery) {
      // Update existing delivery record (re-download)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${requestId}] 🔄 Updating existing delivery record (re-download)`)
      }
      
      const updateData: {
        last_download_at: string;
        download_count: number;
        re_download_count?: number;
      } = {
        last_download_at: new Date().toISOString(),
        download_count: (existingDelivery.download_count || 1) + 1
      }
      
      // Update re_download_count if the column exists (for future migration)
      if (existingDelivery.re_download_count !== undefined) {
        updateData.re_download_count = (existingDelivery.re_download_count || 0) + 1
      }
      
      const { error: updateError } = await supabase
        .from('reader_deliveries')
        .update(updateData)
        .eq('id', existingDelivery.id)

      if (updateError) {
        console.error(`[${requestId}] ❌ Delivery record update failed:`, {
          error: updateError.message,
          code: updateError.code,
          details: updateError.details,
          hint: updateError.hint
        })
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // Use existing access token if available, otherwise generate new one
      accessToken = existingDelivery.access_token
      if (!accessToken) {
        const { generateAccessToken } = await import('@/lib/access-token')
        accessToken = await generateAccessToken(existingDelivery.id, 24) // 24 hour expiry
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${requestId}] 🔑 Access token generated for existing delivery: ${accessToken ? 'success' : 'failed'}`)
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[${requestId}] ✅ Existing delivery record updated successfully (re-download #${updateData.re_download_count || 'N/A'})`)
      }
    } else {
      // Insert new delivery record (first-time download)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${requestId}] 💾 Inserting new delivery record (first-time download)`)
      }
      
      const { data: newDelivery, error: deliveryError } = await supabase
        .from('reader_deliveries')
        .insert({
          delivery_method_id,
          reader_email: email,
          reader_name: name,
          ip_address: clientIP, // Use real IP from request headers
          user_agent: userAgent, // Add user agent tracking
          delivered_at: new Date().toISOString(),
          status: 'delivered',
          download_count: 1,
          last_download_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (deliveryError) {
        console.error(`[${requestId}] ❌ Delivery record insert failed:`, {
          error: deliveryError.message,
          code: deliveryError.code,
          details: deliveryError.details,
          hint: deliveryError.hint
        })
        return NextResponse.json({ error: deliveryError.message }, { status: 500 })
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[${requestId}] ✅ New delivery record inserted successfully`)
      }

      // Generate access token for new delivery
      if (newDelivery?.id) {
        const { generateAccessToken } = await import('@/lib/access-token')
        accessToken = await generateAccessToken(newDelivery.id, 24) // 24 hour expiry
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${requestId}] 🔑 Access token generated: ${accessToken ? 'success' : 'failed'}`)
        }
      }
    }

    // Generate download URL
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${requestId}] 🔗 Generating download URL...`)
    }
    
    let downloadUrl = null
    if (deliveryMethod.books?.book_files && deliveryMethod.books.book_files.length > 0) {
      const file = deliveryMethod.books.book_files[0]
      
      console.log(`[${requestId}] 📁 File details:`, {
        fileId: file.id,
        fileName: file.file_name,
        filePath: file.file_path,
        mimeType: file.mime_type
      })
      
              // Generate signed URL for secure download (skip validation since file exists in DB)
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${requestId}] 🔐 Generating signed URL (1 hour expiry)...`)
        }
      const { data: signedUrl, error: signedUrlError } = await supabase.storage
        .from('book-files')
        .createSignedUrl(file.file_path, 3600) // 1 hour expiry

      if (signedUrlError) {
        console.error(`[${requestId}] ❌ Signed URL generation failed:`, {
          error: signedUrlError.message,
          filePath: file.file_path
        })
        return NextResponse.json(
          { error: 'Failed to generate download link' },
          { status: 500 }
        )
      }

      downloadUrl = signedUrl?.signedUrl
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${requestId}] ✅ Signed URL generated successfully`)
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${requestId}] ⚠️ No book files found for delivery method`)
      }
    }

    const responseTime = Date.now() - startTime
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${requestId}] 🎉 Download process completed successfully`, {
        responseTime: `${responseTime}ms`,
        hasDownloadUrl: !!downloadUrl,
        downloadUrlLength: downloadUrl?.length || 0
      })
    }

    return NextResponse.json({
      success: true,
      download_url: downloadUrl,
      access_token: accessToken, // Include access token in response
      message: 'Download link generated successfully',
      is_redownload: !!existingDelivery,
      download_count: existingDelivery ? (existingDelivery.download_count || 1) + 1 : 1
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`[${requestId}] 💥 Download process failed:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`
    })
    
    // Use error sanitization for consistent error responses
    const context = extractErrorContext(request)
    const sanitizedError = sanitizeError(error, context)
    return createErrorResponse(sanitizedError, 500)
  }
}
