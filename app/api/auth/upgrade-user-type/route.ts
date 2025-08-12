import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getClientIP } from '@/lib/utils'

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
      new_user_type, 
      upgrade_reason, 
      domain_referrer 
    } = body

    if (!user_id || !new_user_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get real IP address and user agent from request headers
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || null

    // Update user type
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        user_type: new_user_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (updateError) {
      console.error('Error updating user type:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log the upgrade event for analytics (optional until migration is ready)
    try {
      const { error: logError } = await supabase
        .from('user_upgrade_logs')
        .insert({
          user_id,
          from_user_type: 'author', // We know they were author type
          to_user_type: new_user_type,
          upgrade_reason,
          domain_referrer,
          ip_address: clientIP,
          user_agent: userAgent,
          upgraded_at: new Date().toISOString()
        })

      if (logError) {
        console.error('Error logging upgrade:', logError)
        // Don't fail the request if logging fails
      }
    } catch (error) {
      console.error('Upgrade logging not available yet (table may not exist):', error)
      // Continue without logging - this is expected until migration is run
    }

    // Return success with cache invalidation hint
    return NextResponse.json({
      success: true,
      message: 'User type upgraded successfully',
      new_user_type,
      cache_invalidated: true, // Hint for client to clear cache
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Upgrade user type error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
