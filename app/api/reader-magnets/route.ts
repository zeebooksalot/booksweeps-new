import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const author_id = searchParams.get('author_id')

    let query = supabase
      .from('reader_magnets')
      .select(`
        *,
        authors (
          id,
          name,
          bio,
          avatar_url,
          website
        ),
        books (
          id,
          title,
          cover_url,
          genre
        )
      `)

    // Apply filters
    if (slug) {
      query = query.eq('slug', slug)
    }

    if (author_id) {
      query = query.eq('author_id', author_id)
    }

    // Only show active magnets
    query = query.eq('is_active', true)

    // Apply sorting - newest first
    query = query.order('created_at', { ascending: false })

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
    // Check if Supabase client is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { 
      author_id,
      book_id,
      title,
      subtitle,
      description,
      slug,
      format,
      file_url,
      file_size,
      page_count,
      benefits,
      is_active = true
    } = body

    if (!author_id || !title || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('reader_magnets')
      .insert({
        author_id,
        book_id,
        title,
        subtitle,
        description,
        slug,
        format,
        file_url,
        file_size,
        page_count,
        benefits,
        is_active,
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
