import { withApiHandler } from '@/lib/api-middleware'
import { paginatedResponse } from '@/lib/api-response'
import { applyCommonFilters, applySorting, applyPagination } from '@/lib/api-utils'
import { PublicAuthor } from '@/types/author'
import { ApiAuthor } from '@/types'

// Helper function to convert PublicAuthor to ApiAuthor format for homepage compatibility
function mapPublicAuthorToApiAuthor(publicAuthor: PublicAuthor): ApiAuthor {
  return {
    id: publicAuthor.id,
    name: publicAuthor.name,
    bio: publicAuthor.bio,
    avatar_url: publicAuthor.avatar_url,
    votes_count: publicAuthor.followers || 0, // Using followers as votes for homepage
    books_count: publicAuthor.books.length,
    followers_count: publicAuthor.followers || 0,
    joined_date: publicAuthor.created_at,
    has_giveaway: publicAuthor.campaigns.some(c => c.status === 'active')
  }
}

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
    followers: (penNameData.followers as number) || 0, // We'll calculate this from votes
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

export const GET = withApiHandler(
  async (req, { supabase, query }) => {
    const { page, limit, search, genre, sortBy } = query
    
    console.log('🔍 Authors API - Query params:', { page, limit, search, genre, sortBy })

    // Build query with joins to books and campaigns
    let dbQuery = supabase
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
    dbQuery = dbQuery.eq('status', 'active')
    
    // Only show active books
    dbQuery = dbQuery.eq('books.status', 'active')

    // Apply genre filter
    if (typeof genre === 'string' && genre && genre !== 'all') {
      dbQuery = dbQuery.eq('genre', genre)
    }

    // Apply search filter for pen names (name and bio)
    if (typeof search === 'string' && search) {
      dbQuery = dbQuery.or(`name.ilike.%${search}%,bio.ilike.%${search}%`)
    }

    console.log('🔍 Authors API - After filters applied')

    // Apply sorting
    const sortByValue = typeof sortBy === 'string' ? sortBy : 'popularity'
    switch (sortByValue) {
      case 'name':
        dbQuery = dbQuery.order('name', { ascending: true })
        break
      case 'books':
        // Sort by number of books (we'll handle this in post-processing for now)
        dbQuery = dbQuery.order('created_at', { ascending: false })
        break
      case 'recent':
        dbQuery = dbQuery.order('created_at', { ascending: false })
        break
      case 'popularity':
      default:
        // Sort by upvotes count (we'll calculate followers from votes later)
        dbQuery = dbQuery.order('upvotes_count', { ascending: false })
        break
    }
    
    console.log('🔍 Authors API - After sorting applied')

    // Apply pagination and execute
    const pageNum = typeof page === 'string' ? parseInt(page) : (typeof page === 'number' ? page : 1)
    const limitNum = typeof limit === 'string' ? parseInt(limit) : (typeof limit === 'number' ? limit : 12)
    const { data, error, count } = await applyPagination(dbQuery, pageNum, limitNum)
    
    console.log('🔍 Authors API - Query result:', { 
      dataCount: data?.length || 0, 
      totalCount: count || 0, 
      error: error?.message 
    })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Map the data to PublicAuthor interface
    const authors = (data || []).map(mapPenNameToPublicAuthor)

    // Handle sorting that requires post-processing
    let sortedAuthors = authors
    if (sortByValue === 'books') {
      sortedAuthors = authors.sort((a: PublicAuthor, b: PublicAuthor) => b.books.length - a.books.length)
    }

    // Convert to ApiAuthor format for homepage compatibility
    const apiAuthors = sortedAuthors.map(mapPublicAuthorToApiAuthor)

    return paginatedResponse(
      {
        authors: sortedAuthors, // For author directory pages
        data: apiAuthors // For homepage compatibility
      },
      {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    )
  },
  {
    auth: 'none',
    clientType: 'service'
  }
) 