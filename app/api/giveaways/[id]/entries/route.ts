import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: giveawayId } = await params
    const body = await req.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    // Use the imported supabase client
    
          // Try to check if the giveaways table exists by querying it
          const { data: giveaway, error: giveawayError } = await supabase
            .from('giveaways')
      .select('id, title, status')
      .eq('id', giveawayId)
      .single()

    if (giveawayError) {
      console.error('Database error:', giveawayError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: giveawayError.message,
        tables_exist: false
      })
    }

    // If we get here, the table exists and we can create an entry
    const { data: entry, error: entryError } = await supabase
      .from('giveaway_entries')
      .insert({
        giveaway_id: giveawayId,
        email: email.toLowerCase().trim(),
        entry_method: 'email',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })
      .select()
      .single()

    if (entryError) {
      console.error('Entry creation error:', entryError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create entry',
        details: entryError.message
      })
    }

    return NextResponse.json({
      success: true,
      message: `Entry created for giveaway ${giveawayId} with email ${email}`,
      entry: entry,
      tables_exist: true
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: giveawayId } = await params
    
    return NextResponse.json({
      entryCount: 0,
      giveawayId: giveawayId
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
