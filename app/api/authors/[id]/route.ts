import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

    const { id } = await params
    const { data, error } = await supabase
      .from('pen_names')
      .select(`
        *,
        books (
          id,
          title,
          description,
          cover_image_url,
          genre,
          page_count,
          upvotes_count,
          downvotes_count
        )
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    return NextResponse.json({ author: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

    const { id } = await params
    const body = await request.json()
    const { name, bio, website, social_links, avatar_url, genre } = body

    const { data, error } = await supabase
      .from('pen_names')
      .update({
        name,
        bio,
        website,
        social_links,
        avatar_url,
        genre,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ author: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 