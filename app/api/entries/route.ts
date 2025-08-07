import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

    // Create entry
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
