import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PublicAuthor } from '@/types/author'

// Helper function to map pen_name data to PublicAuthor interface
function mapPenNameToPublicAuthor(penNameData: any): PublicAuthor {
  return {
    id: penNameData.id,
    name: penNameData.name,
    bio: penNameData.bio,
    genre: penNameData.genre,
    website: penNameData.website,
    avatar_url: penNameData.avatar_url,
    social_links: penNameData.social_links || {},
    created_at: penNameData.created_at,
    followers: penNameData.followers || 0,
    books: penNameData.books?.map((book: any) => ({
      id: book.id,
      title: book.title,
      author: book.author || penNameData.name,
      description: book.description,
      cover_image_url: book.cover_image_url,
      page_count: book.page_count,
      language: book.language || 'English',
      created_at: book.created_at
    })) || [],
    campaigns: penNameData.campaigns?.map((campaign: any) => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      status: campaign.status,
      created_at: campaign.created_at
    })) || []
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // For public access, use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { id } = await params
    const { data, error } = await supabase
      .from('pen_names')
      .select(`
        *,
        books!books_pen_name_id_fkey (
          id, title, author, description, cover_image_url, genre, page_count, language, created_at, status
        ),
        campaigns!campaigns_pen_name_id_fkey (
          id, title, description, start_date, end_date, status, created_at
        )
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    // Map the data to PublicAuthor interface
    const author = mapPenNameToPublicAuthor(data)

    return NextResponse.json({ author })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

    const { id } = await params
    const body = await request.json()
    const { name, bio, website, social_links, avatar_url, genre } = body

    const { data, error } = await supabase
      .from('pen_names')
      .update({
        name,
        bio,
        website,
        social_links,
        avatar_url,
        genre,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ author: data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 