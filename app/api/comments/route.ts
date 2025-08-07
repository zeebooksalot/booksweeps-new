import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const book_id = searchParams.get('book_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!book_id) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    const { data, error, count } = await supabase
      .from('comments')
      .select(`
        *,
        users (
          id,
          username,
          avatar_url
        )
      `)
      .eq('book_id', book_id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      comments: data,
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
    const body = await request.json()
    const { user_id, book_id, content } = body

    if (!user_id || !book_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id,
        book_id,
        content
      })
      .select(`
        *,
        users (
          id,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update comment count
    const { error: updateError } = await supabase.rpc('increment_book_comments', {
      book_id_param: book_id
    })

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ comment: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 