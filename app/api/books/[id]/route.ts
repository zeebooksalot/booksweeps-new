import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        authors (
          id,
          name,
          bio,
          avatar_url,
          website_url,
          twitter_url,
          goodreads_url,
          books_count,
          followers_count,
          votes_count,
          joined_date
        ),
        comments (
          id,
          content,
          created_at,
          users (
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    return NextResponse.json({ book: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, cover_url, genres, has_giveaway } = body

    const { data, error } = await supabase
      .from('books')
      .update({
        title,
        description,
        cover_url,
        genres,
        has_giveaway,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ book: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 