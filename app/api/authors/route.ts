import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'votes_count'
    const search = searchParams.get('search')

    let query = supabase
      .from('authors')
      .select('*')

    if (search) {
      query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%`)
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'followers':
        query = query.order('followers_count', { ascending: false })
        break
      case 'books':
        query = query.order('books_count', { ascending: false })
        break
      case 'trending':
      default:
        query = query.order('votes_count', { ascending: false })
        break
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      authors: data,
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
    const { name, bio, avatar_url, website_url, twitter_url, goodreads_url } = body

    if (!name || !bio || !avatar_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('authors')
      .insert({
        name,
        bio,
        avatar_url,
        website_url,
        twitter_url,
        goodreads_url,
        books_count: 0,
        followers_count: 0,
        votes_count: 0,
        joined_date: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ author: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 