import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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
    followers: penNameData.followers || 0, // We'll calculate this from votes
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

export async function GET(request: NextRequest) {
  try {
    // For public access, use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')
    const genre = searchParams.get('genre')
    const sortBy = searchParams.get('sortBy') || 'popularity'

    console.log('Fetching pen_names with service role...')
    
    // Build query with joins to books and campaigns
    let query = supabase
      .from('pen_names')
      .select(`
        *,
        books!books_pen_name_id_fkey (
          id, title, author, description, cover_image_url, genre, page_count, language, created_at, status
        ),
        campaigns!campaigns_pen_name_id_fkey (
          id, title, description, start_date, end_date, status, created_at
        )
      `, { count: 'exact' })

    // Only show active pen names
    query = query.eq('status', 'active')
    
    // Only show active books
    query = query.eq('books.status', 'active')

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%`)
    }

    // Apply genre filter
    if (genre && genre !== 'all') {
      query = query.eq('genre', genre)
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        query = query.order('name', { ascending: true })
        break
      case 'books':
        // Sort by number of books (we'll handle this in post-processing for now)
        query = query.order('created_at', { ascending: false })
        break
      case 'recent':
        query = query.order('created_at', { ascending: false })
        break
      case 'popularity':
      default:
        // Sort by upvotes count (we'll calculate followers from votes later)
        query = query.order('upvotes_count', { ascending: false })
        break
    }

    // Apply pagination
    const offset = (page - 1) * limit
    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
    }

    console.log('Pen names query result:', { 
      dataCount: data?.length || 0, 
      totalCount: count || 0 
    })

    // Map the data to PublicAuthor interface
    const authors = (data || []).map(mapPenNameToPublicAuthor)

    // Handle sorting that requires post-processing
    let sortedAuthors = authors
    if (sortBy === 'books') {
      sortedAuthors = authors.sort((a, b) => b.books.length - a.books.length)
    }

    return NextResponse.json({
      authors: sortedAuthors,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: (offset + limit) < (count || 0),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors. Please try again later.' },
      { status: 500 }
    )
  }
}