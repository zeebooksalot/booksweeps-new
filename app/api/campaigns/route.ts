import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const user_id = searchParams.get('user_id')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

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
          avatar_url
        )
      `)

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order('created_at', { ascending: false })

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
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

    const body = await request.json()
    const { 
      user_id, 
      title, 
      description, 
      book_id, 
      pen_name_id,
      campaign_type,
      prize_description,
      rules,
      start_date,
      end_date,
      max_entries,
      number_of_winners,
      target_entries,
      duration,
      entry_methods,
      selected_books,
      gdpr_checkbox,
      custom_thank_you_page,
      social_media_config
    } = body

    if (!user_id || !title || !campaign_type) {
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
        pen_name_id,
        campaign_type,
        prize_description,
        rules,
        start_date,
        end_date,
        max_entries,
        number_of_winners,
        target_entries,
        duration,
        entry_methods,
        selected_books,
        gdpr_checkbox,
        custom_thank_you_page,
        social_media_config,
        status: 'draft',
        entry_count: 0,
        is_featured: false
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