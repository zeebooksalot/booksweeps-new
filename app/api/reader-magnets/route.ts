import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // For public access, use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const user_id = searchParams.get('user_id')
    const genre = searchParams.get('genre')
    const search = searchParams.get('search')

    console.log('Fetching book_delivery_methods with service role...')
    
    let query = supabase
      .from('book_delivery_methods')
      .select(`
        *,
        books (
          id, title, author, description, cover_image_url, genre, page_count, pen_name_id, user_id,
          pen_names (id, name, bio, website, avatar_url)
        ),
        reader_deliveries!delivery_method_id (id)
      `)

    // Only show active reader magnets
    query = query.eq('is_active', true)
    
    // Make sure we're only getting ebook delivery methods (as per RLS policy)
    query = query.eq('delivery_method', 'ebook')

    if (user_id) {
      query = query.eq('books.user_id', user_id)
    }

    if (genre) {
      query = query.eq('books.genre', genre)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,books.author.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order('created_at', { ascending: false })

    // Apply pagination
    const offset = (page - 1) * limit
    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Found data:', data?.length || 0, 'records')

    // Transform data to match expected structure
    const transformedData = (data || []).map((magnet: {
      id: string
      slug?: string
      title: string
      description: string
      format: string
      created_at: string
      is_active: boolean
      books?: {
        pen_names?: {
          bio?: string
          website?: string
        }
      } | null
      reader_deliveries?: Array<{ id: string }>
    }) => ({
      id: magnet.id,
      slug: magnet.slug || `magnet-${magnet.id}`,
      title: magnet.title,
      description: magnet.description,
      format: magnet.format,
      download_count: magnet.reader_deliveries?.length || 0,
      created_at: magnet.created_at,
      is_active: magnet.is_active,
      books: magnet.books || null,
      pen_names: magnet.books?.pen_names || null
    }))

    return NextResponse.json({
      reader_magnets: transformedData,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
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
