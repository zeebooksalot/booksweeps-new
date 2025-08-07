import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const user_id = searchParams.get('user_id')
    const search = searchParams.get('search')

    let query = supabase
      .from('pen_names')
      .select('*')

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%`)
    }

    // Only show active pen names
    query = query.eq('status', 'active')

    // Apply sorting
    query = query.order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })

    // Apply pagination
    const offset = (page - 1) * limit
    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      pen_names: data,
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
    const { 
      user_id, 
      name, 
      bio, 
      website, 
      social_links = {}, 
      is_primary = false,
      avatar_url,
      genre
    } = body

    if (!user_id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('pen_names')
      .insert({
        user_id,
        name,
        bio,
        website,
        social_links,
        is_primary,
        avatar_url,
        genre,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ pen_name: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
