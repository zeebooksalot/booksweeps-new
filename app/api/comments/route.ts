import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkRateLimit, createRateLimitIdentifier, RATE_LIMITS, getClientIP } from '@/lib/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

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
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

    const body = await request.json()
    const { user_id, book_id, content } = body

    if (!user_id || !book_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Apply rate limiting - check both IP and user-based limits
    const clientIP = getClientIP(request)
    const ipIdentifier = createRateLimitIdentifier('ip', clientIP, 'comment')
    const userIdentifier = createRateLimitIdentifier('user', user_id, 'comment')
    
    // Check IP-based rate limit
    const ipRateLimit = await checkRateLimit(ipIdentifier, RATE_LIMITS.COMMENT)
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many comment requests. Please try again later.',
          retryAfter: Math.ceil(ipRateLimit.resetTime / 1000)
        },
        { status: 429 }
      )
    }
    
    // Check user-based rate limit
    const userRateLimit = await checkRateLimit(userIdentifier, RATE_LIMITS.COMMENT)
    if (!userRateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many comments from this user. Please try again later.',
          retryAfter: Math.ceil(userRateLimit.resetTime / 1000)
        },
        { status: 429 }
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