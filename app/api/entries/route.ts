import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getClientIP } from '@/lib/utils'
import { checkRateLimit, createRateLimitIdentifier, RATE_LIMITS } from '@/lib/rate-limiter'

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
      campaign_id, 
      email, 
      first_name, 
      last_name, 
      entry_method, 
      entry_data = {},
      marketing_opt_in = false,
      referral_code,
      user_id
    } = body

    if (!campaign_id || !email || !entry_method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get real IP address and user agent from request headers
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || null

    // Apply rate limiting - check both IP and email-based limits
    const ipIdentifier = createRateLimitIdentifier('ip', clientIP, 'campaign_entry')
    const emailIdentifier = createRateLimitIdentifier('email', email, 'campaign_entry')
    
    // Check IP-based rate limit
    const ipRateLimit = await checkRateLimit(ipIdentifier, RATE_LIMITS.CAMPAIGN_ENTRY)
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many campaign entry requests. Please try again later.',
          retryAfter: Math.ceil(ipRateLimit.resetTime / 1000)
        },
        { status: 429 }
      )
    }
    
    // Check email-based rate limit for this specific campaign
    const campaignRateLimit = await checkRateLimit(
      `${emailIdentifier}:${campaign_id}`, 
      RATE_LIMITS.CAMPAIGN_ENTRY
    )
    if (!campaignRateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'You have entered this campaign too many times. Please try again later.',
          retryAfter: Math.ceil(campaignRateLimit.resetTime / 1000)
        },
        { status: 429 }
      )
    }

    // Check if user already entered this campaign
    const { data: existingEntry } = await supabase
      .from('reader_entries')
      .select('id')
      .eq('campaign_id', campaign_id)
      .eq('email', email)
      .single()

    if (existingEntry) {
      return NextResponse.json(
        { error: 'You have already entered this campaign' },
        { status: 400 }
      )
    }

    // Create entry with IP address and user agent tracking
    const { data: entry, error: entryError } = await supabase
      .from('reader_entries')
      .insert({
        campaign_id,
        email,
        first_name,
        last_name,
        entry_method,
        entry_data,
        marketing_opt_in,
        referral_code,
        user_id,
        ip_address: clientIP, // Add real IP address tracking
        user_agent: userAgent, // Add user agent tracking
        verified: true,
        status: 'valid'
      })
      .select()
      .single()

    if (entryError) {
      return NextResponse.json({ error: entryError.message }, { status: 500 })
    }

    // Update campaign entry count
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ entry_count: supabase.rpc('increment', { table_name: 'campaigns', column_name: 'entry_count' }) })
      .eq('id', campaign_id)

    if (updateError) {
      console.error('Error updating campaign entry count:', updateError)
    }

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
