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
    const status = searchParams.get('status') || 'active'
    const featured = searchParams.get('featured')
    const genre = searchParams.get('genre')

    let query = supabase
      .from('campaigns')
      .select(`
        *,
        books (
          id,
          title,
          author,
          cover_image_url,
          genre
        ),
        pen_names (
          id,
          name,
          bio,
          avatar_url
        ),
        users (
          id,
          display_name,
          first_name,
          last_name
        )
      `)

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (genre) {
      query = query.eq('campaign_genre', genre)
    }

    // Apply sorting - featured campaigns first, then by entry count
    query = query.order('is_featured', { ascending: false })
      .order('entry_count', { ascending: false })
      .order('created_at', { ascending: false })

    // Apply pagination
    const offset = (page - 1) * limit
    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      campaigns: data,
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
      description, 
      book_id, 
      campaign_type = 'giveaway',
      prize_description,
      rules,
      start_date,
      end_date,
      max_entries,
      number_of_winners = 1,
      target_entries = 100,
      minimum_age = 18,
      gdpr_checkbox = false
    } = body

    if (!user_id || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id,
        title,
        description,
        book_id,
        campaign_type,
        prize_description,
        rules,
        start_date,
        end_date,
        max_entries,
        number_of_winners,
        target_entries,
        minimum_age,
        gdpr_checkbox,
        status: 'draft',
        entry_count: 0
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaign: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 