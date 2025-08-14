import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

    const { searchParams } = new URL(request.url)
    const campaign_id = searchParams.get('campaign_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!campaign_id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const { data, error, count } = await supabase
      .from('reader_entries')
      .select('*')
      .eq('campaign_id', campaign_id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      entries: data,
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
      campaign_id, 
      email, 
      first_name, 
      last_name, 
      entry_method, 
      entry_data = {},
      marketing_opt_in = false,
      referral_code,
      referred_by
    } = body

    if (!campaign_id || !email || !entry_method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.headers.get('cf-connecting-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || null

    const { data, error } = await supabase
      .from('reader_entries')
      .insert({
        campaign_id,
        email,
        first_name,
        last_name,
        entry_method,
        entry_data,
        ip_address: clientIP,
        user_agent: userAgent,
        marketing_opt_in,
        referral_code,
        referred_by,
        status: 'pending',
        verified: false
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update entry count
    const { error: updateError } = await supabase.rpc('increment_campaign_entries', {
      campaign_id_param: campaign_id
    })

    if (updateError) {
      console.error('Error updating entry count:', updateError)
      // Don't fail the request if count update fails
    }

    return NextResponse.json({ entry: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
