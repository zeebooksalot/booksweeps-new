import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

    const { searchParams } = new URL(request.url)
    const reader_magnet_id = searchParams.get('reader_magnet_id')

    if (!reader_magnet_id) {
      return NextResponse.json(
        { error: 'Reader magnet ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('reader_magnet_downloads')
      .select(`
        *,
        reader_magnets (
          id,
          title,
          description,
          cover_image_url,
          genre,
          author_name,
          download_count
        )
      `)
      .eq('reader_magnet_id', reader_magnet_id)
      .order('created_at', { ascending: false })

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
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

    const body = await request.json()
    const { reader_magnet_id, email, name, ip_address, user_agent } = body

    if (!reader_magnet_id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert download record
    const { data, error } = await supabase
      .from('reader_magnet_downloads')
      .insert({
        reader_magnet_id,
        email,
        name,
        ip_address,
        user_agent
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update download count
    const { error: updateError } = await supabase.rpc('increment_reader_magnet_downloads', {
      magnet_id_param: reader_magnet_id
    })

    if (updateError) {
      console.error('Error updating download count:', updateError)
      // Don't fail the request if count update fails
    }

    return NextResponse.json({ download: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
