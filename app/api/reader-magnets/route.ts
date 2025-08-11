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
    const user_id = searchParams.get('user_id')

    let query = supabase
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
          pen_name_id
        )
      `)

    // Apply filters
    if (slug) {
      query = query.eq('slug', slug)
    }

    if (user_id) {
      query = query.eq('books.user_id', user_id)
    }

    // Only show active delivery methods that are reader magnets
    query = query.eq('is_active', true)
      .eq('delivery_method', 'ebook')

    // Apply sorting - newest first
    query = query.order('created_at', { ascending: false })

    // Apply pagination
    const offset = (page - 1) * limit
    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate download counts for each delivery method
    const magnetsWithCounts = await Promise.all(
      data.map(async (magnet) => {
        if (!supabase) return magnet
        
        const { count: downloadCount } = await supabase
          .from('reader_deliveries')
          .select('*', { count: 'exact', head: true })
          .eq('delivery_method_id', magnet.id)

        return {
          ...magnet,
          download_count: downloadCount || 0
        }
      })
    )

    return NextResponse.json({
      reader_magnets: magnetsWithCounts,
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
