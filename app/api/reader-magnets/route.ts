import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const user_id = searchParams.get('user_id')
    const genre = searchParams.get('genre')
    const search = searchParams.get('search')

    let query = supabase
      .from('reader_magnets')
      .select('*')

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    if (genre) {
      query = query.eq('genre', genre)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,author_name.ilike.%${search}%`)
    }

    // Only show active reader magnets
    query = query.eq('status', 'active')

    // Apply sorting
    query = query.order('download_count', { ascending: false })
      .order('created_at', { ascending: false })

    // Apply pagination
    const offset = (page - 1) * limit
    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      reader_magnets: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
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
    const { 
      user_id, 
      title, 
      description, 
      cover_image_url, 
      genre, 
      author_name,
      file_url,
      download_limit
    } = body

    if (!user_id || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('reader_magnets')
      .insert({
        user_id,
        title,
        description,
        cover_image_url,
        genre,
        author_name,
        file_url,
        download_limit,
        status: 'active',
        download_count: 0
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reader_magnet: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
