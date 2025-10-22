import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PublicAuthor } from '@/types/author'

// Helper function to map pen_name data to PublicAuthor interface
function mapPenNameToPublicAuthor(penNameData: Record<string, unknown>): PublicAuthor {
  return {
    id: penNameData.id as string,
    slug: penNameData.slug as string,
    name: penNameData.name as string,
    bio: penNameData.bio as string,
    genre: penNameData.genre as string,
    website: penNameData.website as string,
    avatar_url: penNameData.avatar_url as string,
    social_links: (penNameData.social_links as Record<string, string>) || {},
    created_at: penNameData.created_at as string,
    followers: (penNameData.followers as number) || 0,
    books: (penNameData.books as Record<string, unknown>[])?.map((book: Record<string, unknown>) => ({
      id: book.id as string,
      title: book.title as string,
      author: (book.author as string) || (penNameData.name as string),
      description: book.description as string,
      cover_image_url: book.cover_image_url as string,
      page_count: book.page_count as number,
      language: (book.language as string) || 'English',
      created_at: book.created_at as string
    })) || [],
    campaigns: (penNameData.campaigns as Record<string, unknown>[])?.map((campaign: Record<string, unknown>) => ({
      id: campaign.id as string,
      title: campaign.title as string,
      description: campaign.description as string,
      start_date: campaign.start_date as string,
      end_date: campaign.end_date as string,
      status: campaign.status as string,
      created_at: campaign.created_at as string
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

    const { id: slug } = await params
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
      .eq('slug', slug)
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

    const { id: slug } = await params
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
      .eq('slug', slug)
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