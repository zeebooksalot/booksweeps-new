import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface MagnetWithJoins {
  id: string
  book_id: string
  title: string
  description?: string
  slug: string
  format: string
  requires_email: boolean
  email_template?: string
  download_limit?: number
  expiry_days?: number
  custom_css?: string
  is_active: boolean
  created_at: string
  updated_at: string
  books?: {
    id: string
    title: string
    author: string
    description?: string
    cover_image_url?: string
    genre?: string
    page_count?: number
    pen_name_id?: string
    pen_names?: {
      id: string
      name: string
      bio?: string
      website?: string
      avatar_url?: string
    }
  }
  reader_deliveries?: Array<{ id: string }>
}

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
    const user_id = searchParams.get('user_id')

    // Apply pagination
    const offset = (page - 1) * limit
    
    // Optimized query with joins to avoid N+1 problem
    let optimizedQuery = supabase
      .from('book_delivery_methods')
      .select(`
        *,
        books (
          id,
          title,
          author,
          description,
          cover_image_url,
          genre,
          page_count,
          pen_name_id,
          pen_names (
            id,
            name,
            bio,
            website,
            avatar_url
          )
        ),
        reader_deliveries!delivery_method_id (
          id
        )
      `)
      .eq('is_active', true)

    // Apply slug filter if provided
    if (slug) {
      optimizedQuery = optimizedQuery.eq('slug', slug)
    }

    // Apply user filter if provided
    if (user_id) {
      optimizedQuery = optimizedQuery.eq('user_id', user_id)
    }

    // Apply sorting and pagination
    const { data, error, count } = await optimizedQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to match the expected format
    const magnetsWithBooks = (data || []).map((magnet: MagnetWithJoins) => {
      return {
        ...magnet,
        books: magnet.books || null,
        pen_names: magnet.books?.pen_names || null,
        download_count: magnet.reader_deliveries?.length || 0
      }
    })

    return NextResponse.json({
      reader_magnets: magnetsWithBooks,
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
      book_id,
      title,
      description,
      slug,
      format = 'pdf',
      requires_email = true,
      email_template,
      download_limit,
      expiry_days,
      custom_css
    } = body

    if (!book_id || !title || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('book_delivery_methods')
      .insert({
        book_id,
        title,
        description,
        slug,
        format,
        requires_email,
        email_template,
        download_limit,
        expiry_days,
        custom_css,
        is_active: true,
        delivery_method: 'ebook'
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
