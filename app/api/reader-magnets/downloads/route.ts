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
      reader_magnet_id,
      email,
      name,
      ip_address
    } = body

    if (!reader_magnet_id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // First, get the reader magnet to check if it exists and is active
    const { data: magnet, error: magnetError } = await supabase
      .from('reader_magnets')
      .select('*')
      .eq('id', reader_magnet_id)
      .eq('is_active', true)
      .single()

    if (magnetError || !magnet) {
      return NextResponse.json(
        { error: 'Reader magnet not found or inactive' },
        { status: 404 }
      )
    }

    // Insert the download record
    const { data: download, error: downloadError } = await supabase
      .from('reader_magnet_downloads')
      .insert({
        reader_magnet_id,
        email,
        name,
        ip_address,
        downloaded_at: new Date().toISOString()
      })
      .select()
      .single()

    if (downloadError) {
      return NextResponse.json({ error: downloadError.message }, { status: 500 })
    }

    // Update the download count on the reader magnet
    const { error: updateError } = await supabase
      .from('reader_magnets')
      .update({ download_count: magnet.download_count + 1 })
      .eq('id', reader_magnet_id)

    if (updateError) {
      console.error('Error updating download count:', updateError)
      // Don't fail the request if this fails
    }

    // Return the download URL
    return NextResponse.json({
      success: true,
      download_url: magnet.file_url,
      message: 'Download link generated successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
