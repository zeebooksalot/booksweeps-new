import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Define bonus entry amounts for each method
const ENTRY_METHODS = {
  email: { bonus_entries: 1, label: 'Email Entry' },
  twitter: { bonus_entries: 2, label: 'Twitter Follow' },
  facebook: { bonus_entries: 2, label: 'Facebook Share' },
  newsletter: { bonus_entries: 1, label: 'Newsletter Subscribe' },
  early_bird_books: { bonus_entries: 1, label: 'Early Bird Books Newsletter' }
} as const

type EntryMethod = keyof typeof ENTRY_METHODS

type UserEntry = {
  method: string
  label: string
  bonus_entries: number
  created_at: string
  entry_data: any
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: giveawayId } = await params
    const body = await req.json()
    const { email, entries = {} } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    // Validate giveaway exists and is active
    const { data: giveaway, error: giveawayError } = await supabase
      .from('giveaways')
      .select('id, title, status, entry_methods')
      .eq('id', giveawayId)
      .single()

    if (giveawayError) {
      console.error('Database error:', giveawayError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: giveawayError.message
      })
    }

    if (giveaway.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'Giveaway is not active'
      }, { status: 400 })
    }

    // Determine which entry methods to create
    const entryMethods: EntryMethod[] = ['email'] // Always include email entry
    
    // Add bonus entries based on what user selected
    if (entries.twitter) entryMethods.push('twitter')
    if (entries.facebook) entryMethods.push('facebook')  
    if (entries.newsletter) entryMethods.push('newsletter')
    if (entries.earlyBirdBooks) entryMethods.push('early_bird_books')

    const createdEntries = []
    const errors = []
    let totalBonusEntries = 0

    // Create entries for each method
    for (const method of entryMethods) {
      const methodConfig = ENTRY_METHODS[method]
      
      try {
        const { data: entry, error: entryError } = await supabase
          .from('giveaway_entries')
          .insert({
            giveaway_id: giveawayId,
            email: email.toLowerCase().trim(),
            entry_method: method,
            bonus_entries: methodConfig.bonus_entries,
            entry_data: entries[method === 'early_bird_books' ? 'earlyBirdBooks' : method] || {},
            ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown'
          })
          .select()
          .single()

        if (entryError) {
          // If it's a duplicate entry, that's expected - skip it
          if (entryError.code === '23505') {
            console.log(`Entry method ${method} already exists for this email`)
            continue
          }
          throw entryError
        }

        createdEntries.push({
          method,
          label: methodConfig.label,
          bonus_entries: methodConfig.bonus_entries,
          entry
        })
        
        totalBonusEntries += methodConfig.bonus_entries

      } catch (error) {
        console.error(`Error creating ${method} entry:`, error)
        errors.push({
          method,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    if (createdEntries.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No new entries were created. You may have already entered this giveaway.',
        errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdEntries.length} entries totaling ${totalBonusEntries} chances to win`,
      entries: createdEntries,
      total_bonus_entries: totalBonusEntries,
      errors: errors.length > 0 ? errors : undefined
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
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    
    // Get giveaway info
    const { data: giveaway, error: giveawayError } = await supabase
      .from('giveaways')
      .select('id, title, entry_count')
      .eq('id', giveawayId)
      .single()

    if (giveawayError) {
      return NextResponse.json({
        error: 'Giveaway not found',
        details: giveawayError.message
      }, { status: 404 })
    }

    let userEntries: UserEntry[] = []
    let userTotalEntries = 0

    // If email provided, get user's entries
    if (email) {
      const { data: entries, error: entriesError } = await supabase
        .from('giveaway_entries')
        .select('entry_method, bonus_entries, created_at, entry_data')
        .eq('giveaway_id', giveawayId)
        .eq('email', email.toLowerCase().trim())

      if (!entriesError && entries) {
        userEntries = entries.map(entry => ({
          method: entry.entry_method,
          label: ENTRY_METHODS[entry.entry_method as EntryMethod]?.label || entry.entry_method,
          bonus_entries: entry.bonus_entries,
          created_at: entry.created_at,
          entry_data: entry.entry_data
        }))
        
        userTotalEntries = entries.reduce((sum, entry) => sum + (entry.bonus_entries || 1), 0)
      }
    }

    return NextResponse.json({
      giveawayId,
      totalEntryCount: giveaway.entry_count,
      userEntries,
      userTotalEntries,
      availableMethods: Object.entries(ENTRY_METHODS).map(([key, config]) => ({
        method: key,
        label: config.label,
        bonus_entries: config.bonus_entries,
        completed: userEntries.some(entry => entry.method === key)
      }))
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
