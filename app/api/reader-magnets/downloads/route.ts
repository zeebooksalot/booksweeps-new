import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { 
      delivery_method_id,
      email,
      name,
      ip_address
    } = body

    if (!delivery_method_id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // First, get the delivery method to check if it exists and is active
    const { data: deliveryMethod, error: methodError } = await supabase
      .from('book_delivery_methods')
      .select(`
        *,
        books (
          id,
          title,
          author,
          cover_image_url
        ),
        book_files (
          id,
          file_path,
          file_name,
          mime_type
        )
      `)
      .eq('id', delivery_method_id)
      .eq('is_active', true)
      .eq('delivery_method', 'ebook')
      .single()

    if (methodError || !deliveryMethod) {
      return NextResponse.json(
        { error: 'Reader magnet not found or inactive' },
        { status: 404 }
      )
    }

    // Check download limit
    if (deliveryMethod.download_limit) {
      const { count: totalDownloads } = await supabase
        .from('reader_deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('delivery_method_id', delivery_method_id)

      if (totalDownloads && totalDownloads >= deliveryMethod.download_limit) {
        return NextResponse.json(
          { error: 'Download limit reached' },
          { status: 429 }
        )
      }
    }

    // Insert the delivery record
    const { data: delivery, error: deliveryError } = await supabase
      .from('reader_deliveries')
      .insert({
        delivery_method_id,
        reader_email: email,
        reader_name: name,
        ip_address,
        delivered_at: new Date().toISOString(),
        status: 'delivered'
      })
      .select()
      .single()

    if (deliveryError) {
      return NextResponse.json({ error: deliveryError.message }, { status: 500 })
    }

    // Generate download URL
    let downloadUrl = null
    if (deliveryMethod.book_files && deliveryMethod.book_files.length > 0) {
      const file = deliveryMethod.book_files[0]
      // Generate signed URL for secure download
      const { data: signedUrl } = await supabase.storage
        .from('book-files')
        .createSignedUrl(file.file_path, 3600) // 1 hour expiry

      downloadUrl = signedUrl?.signedUrl
    }

    return NextResponse.json({
      success: true,
      download_url: downloadUrl,
      message: 'Download link generated successfully'
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
