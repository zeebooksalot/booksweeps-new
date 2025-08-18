import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateAccessToken } from '@/lib/access-token'

export async function GET(request: NextRequest) {
  try {
    // Create service role client for public access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const delivery_method_id = searchParams.get('delivery_method_id')

    if (!delivery_method_id) {
      return NextResponse.json(
        { error: 'Delivery method ID is required' },
        { status: 400 }
      )
    }

    // Get download history for this delivery method
    const { data, error } = await supabase
      .from('reader_deliveries')
      .select(`
        id,
        reader_email,
        reader_name,
        delivered_at,
        download_count,
        last_download_at,
        status,
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
            page_count
          )
        )
      `)
      .eq('delivery_method_id', delivery_method_id)
      .order('delivered_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ downloads: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create service role client for public access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { delivery_method_id, email, name } = body

    if (!delivery_method_id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get client IP and user agent
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      request.headers.get('cf-connecting-ip') || 
                      'unknown'
    const user_agent = request.headers.get('user-agent') || 'unknown'

    // First, check if this email has already downloaded this delivery method
    const { data: existingDelivery, error: checkError } = await supabase
      .from('reader_deliveries')
      .select('*')
      .eq('delivery_method_id', delivery_method_id)
      .eq('reader_email', email)
      .single()

    let deliveryId: string
    let accessToken: string | null = null
    let isRedownload = false

    if (existingDelivery) {
      // Re-download - update existing record
      deliveryId = existingDelivery.id
      isRedownload = true
      
      // Reuse existing access token or generate new one
      accessToken = existingDelivery.access_token
      if (!accessToken) {
        // Generate token manually since we're using service role client
        accessToken = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24)

        const { error: tokenError } = await supabase
          .from('reader_deliveries')
          .update({
            access_token: accessToken,
            expires_at: expiresAt.toISOString()
          })
          .eq('id', existingDelivery.id)

        if (tokenError) {
          console.error('Error generating access token:', tokenError)
        }
      }

      const { error: updateError } = await supabase
        .from('reader_deliveries')
        .update({
          download_count: (existingDelivery.download_count || 0) + 1,
          last_download_at: new Date().toISOString()
        })
        .eq('id', existingDelivery.id)

      if (updateError) {
        console.error('Error updating existing delivery:', updateError)
      }
    } else {
      // New download - create new record
      const { data: newDelivery, error: insertError } = await supabase
        .from('reader_deliveries')
        .insert({
          delivery_method_id,
          reader_email: email,
          reader_name: name,
          ip_address,
          user_agent,
          status: 'delivered',
          download_count: 1,
          delivered_at: new Date().toISOString(),
          last_download_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      deliveryId = newDelivery.id
      
      // Generate access token manually
      accessToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      const { error: tokenError } = await supabase
        .from('reader_deliveries')
        .update({
          access_token: accessToken,
          expires_at: expiresAt.toISOString()
        })
        .eq('id', newDelivery.id)

      if (tokenError) {
        console.error('Error generating access token:', tokenError)
      }
    }

    // Get book file information for download
    const { data: bookData, error: bookError } = await supabase
      .from('book_delivery_methods')
      .select(`
        id,
        title,
        description,
        format,
        book_id
      `)
      .eq('id', delivery_method_id)
      .single()

    if (bookError || !bookData) {
      console.error('Book data error:', bookError)
      console.error('Book data:', bookData)
      return NextResponse.json({ error: 'Book information not found' }, { status: 404 })
    }

    console.log('Book data received:', JSON.stringify(bookData, null, 2))

    // Get book information separately
    const { data: book, error: bookQueryError } = await supabase
      .from('books')
      .select(`
        id,
        title,
        author,
        cover_image_url,
        genre,
        page_count
      `)
      .eq('id', bookData.book_id)
      .single()

    if (bookQueryError || !book) {
      console.error('Book query error:', bookQueryError)
      console.error('Book data:', book)
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    console.log('Book found:', JSON.stringify(book, null, 2))

    // Get book file directly from book_files table
    const { data: bookFiles, error: filesError } = await supabase
      .from('book_files')
      .select('*')
      .eq('delivery_method_id', delivery_method_id)
      .eq('status', 'active')
      .limit(1)

    if (filesError) {
      console.error('Book files error:', filesError)
      return NextResponse.json({ error: 'Failed to fetch book files' }, { status: 500 })
    }

    const bookFile = bookFiles?.[0]
    if (!bookFile) {
      console.error('No book file found for delivery_method_id:', delivery_method_id)
      return NextResponse.json({ error: 'Book file not found' }, { status: 404 })
    }

    console.log('Book file found:', JSON.stringify(bookFile, null, 2))

    // Create signed URL for file download
    console.log('Attempting to create signed URL for file path:', bookFile.file_path)
    console.log('Storage bucket: book-files')
    
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('book-files')
      .createSignedUrl(bookFile.file_path, 3600) // 1 hour expiry

    if (urlError || !signedUrl) {
      console.error('Signed URL error details:', {
        error: urlError,
        filePath: bookFile.file_path,
        bucket: 'book-files',
        fileExists: !!bookFile
      })
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
    }

    console.log('Signed URL created successfully:', signedUrl.signedUrl)

    // Log the download for analytics - simplified to avoid column conflicts
    try {
      const { error: logError } = await supabase
        .from('reader_download_logs')
        .insert({
          delivery_id: deliveryId,
          file_id: bookFile.id,
          ip_address,
          user_agent,
          download_size: bookFile.file_size || 0,
          status: 'success',
          downloaded_at: new Date().toISOString()
        })

      if (logError) {
        console.error('Error logging download:', logError)
        // Don't fail the request if logging fails
      } else {
        console.log('Download logged successfully')
      }
    } catch (logException) {
      console.error('Exception logging download:', logException)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      download_url: signedUrl.signedUrl,
      access_token: accessToken,
      message: 'Download link generated successfully',
      is_redownload: isRedownload,
      download_count: existingDelivery ? (existingDelivery.download_count || 0) + 1 : 1,
      book: {
        title: book.title,
        author: book.author,
        format: bookData.format,
        file_name: bookFile.file_name
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Download API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
