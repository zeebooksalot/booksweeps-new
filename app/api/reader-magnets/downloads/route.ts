import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getClientIP } from '@/lib/utils'

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

    const body = await request.json()
    const { 
      delivery_method_id,
      email,
      name
      // Remove ip_address from body - we'll get it from request headers
    } = body

    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${requestId}] 📝 Request data:`, {
        delivery_method_id,
        email: email ? `${email.substring(0, 3)}***@${email.split('@')[1]}` : null, // Mask email for privacy
        name: name ? `${name.substring(0, 1)}***` : null, // Mask name for privacy
        hasName: !!name
      })
    }

    if (!delivery_method_id || !email) {
      console.error(`[${requestId}] ❌ Missing required fields:`, { delivery_method_id: !!delivery_method_id, email: !!email })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get real IP address from request headers
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || null
    
    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${requestId}] 🌐 Client info:`, {
        ip: clientIP,
        userAgent: userAgent ? userAgent.substring(0, 50) + '...' : null,
        userAgentLength: userAgent?.length || 0
      })
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

    // Insert the delivery record with real IP and user agent
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${requestId}] 💾 Inserting delivery record...`)
    }
    
    const { error: deliveryError } = await supabase
      .from('reader_deliveries')
      .insert({
        delivery_method_id,
        reader_email: email,
        reader_name: name,
        ip_address: clientIP, // Use real IP from request headers
        user_agent: userAgent, // Add user agent tracking
        delivered_at: new Date().toISOString(),
        status: 'delivered'
      })
      .select()
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
      console.log(`[${requestId}] ✅ Delivery record inserted successfully`)
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
      message: 'Download link generated successfully'
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`[${requestId}] 💥 Download process failed:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
