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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const genre = searchParams.get('genre')
    const search = searchParams.get('search')
    const user_id = searchParams.get('user_id')
    const sortBy = searchParams.get('sortBy') || 'created_at'

    let query = supabase
      .from('books')
      .select(`
        *,
        pen_names (
          id,
          name,
          bio,
          avatar_url
        ),
        series (
          id,
          name,
          description
        ),
        users (
          id,
          display_name,
          first_name,
          last_name
        )
      `)

    // Apply filters
    if (genre) {
      query = query.eq('genre', genre)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    // Only show active books
    query = query.eq('status', 'active')

    // Apply sorting
    switch (sortBy) {
      case 'upvotes':
        query = query.order('upvotes_count', { ascending: false })
        break
      case 'trending':
        query = query.order('upvotes_count', { ascending: false })
          .order('created_at', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    const offset = (page - 1) * limit
    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      books: data,
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
      user_id, 
      title, 
      author, 
      description, 
      cover_image_url, 
      publisher, 
      published_date, 
      genre, 
      page_count, 
      language = 'English',
      isbn,
      asin,
      pen_name_id,
      series_id,
      series_order
    } = body

    if (!user_id || !title || !author) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('books')
      .insert({
        user_id,
        title,
        author,
        description,
        cover_image_url,
        publisher,
        published_date,
        genre,
        page_count,
        language,
        isbn,
        asin,
        pen_name_id,
        series_id,
        series_order,
        status: 'active',
        source: 'manual'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ book: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 