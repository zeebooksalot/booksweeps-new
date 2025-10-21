import { withApiHandler } from '@/lib/api-middleware'
import { parseBody } from '@/lib/api-request'
import { paginatedResponse, createdResponse } from '@/lib/api-response'
import { applyPagination } from '@/lib/api-utils'
import { CreateReaderMagnetSchema } from '@/lib/api-schemas'

export const GET = withApiHandler(
  async (req, { supabase, query }) => {
    const { page, limit, user_id, genre, search } = query
    
    console.log('🔍 Reader Magnets API - Query params:', { page, limit, user_id, genre, search })

    let dbQuery = supabase
      .from('book_delivery_methods')
      .select(`
        *,
        books (
          id, title, author, description, cover_image_url, genre, page_count, pen_name_id, user_id,
          pen_names (id, name, bio, website, avatar_url),
          upvotes_count,
          downvotes_count,
          comments_count
        ),
        reader_deliveries!delivery_method_id (id)
      `)

    // Only show active reader magnets
    dbQuery = dbQuery.eq('is_active', true)
    
    // Make sure we're only getting ebook delivery methods (as per RLS policy)
    dbQuery = dbQuery.eq('delivery_method', 'ebook')

    // Apply filters
    if (typeof user_id === 'string' && user_id) {
      dbQuery = dbQuery.eq('books.user_id', user_id)
    }

    if (typeof genre === 'string' && genre) {
      dbQuery = dbQuery.eq('books.genre', genre)
    }

    if (typeof search === 'string' && search) {
      dbQuery = dbQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,books.author.ilike.%${search}%`)
    }

    // Apply sorting
    dbQuery = dbQuery.order('created_at', { ascending: false })

    console.log('🔍 Reader Magnets API - After filters applied')

    // Apply pagination and execute
    const pageNum = typeof page === 'string' ? parseInt(page) : (typeof page === 'number' ? page : 1)
    const limitNum = typeof limit === 'string' ? parseInt(limit) : (typeof limit === 'number' ? limit : 10)
    const { data, error, count } = await applyPagination(dbQuery, pageNum, limitNum)
    
    console.log('🔍 Reader Magnets API - Query result:', { 
      dataCount: data?.length || 0, 
      totalCount: count || 0, 
      error: error?.message 
    })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Transform data to match expected structure
    const transformedData = (data || []).map((magnet: {
      id: string
      slug?: string
      title: string
      description: string
      format: string
      created_at: string
      is_active: boolean
      books?: {
        id: string
        title: string
        author: string
        cover_image_url: string
        genre: string
        page_count?: number
        pen_names?: {
          id: string
          name: string
          bio: string
          website?: string
          avatar_url?: string
        }
        upvotes_count?: number
        downvotes_count?: number
        comments_count?: number
      } | null
      reader_deliveries?: Array<{ id: string }>
    }) => {
      // Get vote counts from the books table
      const upvotes = magnet.books?.upvotes_count || 0
      const downvotes = magnet.books?.downvotes_count || 0
      const totalVotes = upvotes + downvotes
      
      // Calculate rating based on upvotes vs total votes (4-5 stars)
      const rating = totalVotes > 0 ? Math.max(4, Math.min(5, 4 + (upvotes / totalVotes))) : 4.5
      
      return {
        id: magnet.id,
        type: "book" as const,
        title: magnet.title,
        author: magnet.books?.author || 'Unknown Author',
        description: magnet.description,
        cover: magnet.books?.cover_image_url || '/placeholder.svg',
        votes: totalVotes,
        comments: magnet.books?.comments_count || 0,
        rating: Math.round(rating * 10) / 10,
        genres: magnet.books?.genre ? [magnet.books.genre] : [],
        hasGiveaway: false,
        publishDate: new Date(magnet.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        rank: 1, // Will be set by the component
        slug: magnet.slug || `magnet-${magnet.id}`,
        format: magnet.format,
        download_count: magnet.reader_deliveries?.length || 0,
        created_at: magnet.created_at,
        is_active: magnet.is_active,
        books: magnet.books || null,
        pen_names: magnet.books?.pen_names || null
      }
    })

    return paginatedResponse(
      { reader_magnets: transformedData },
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

export const POST = withApiHandler(
  async (req, { supabase, body, clientMetadata }) => {
    const validated = await parseBody(req, CreateReaderMagnetSchema)
    
    // Use authenticated user's ID if not provided
    const userId = validated.user_id || clientMetadata.userId
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('reader_magnets')
      .insert({
        user_id: userId,
        title: validated.title,
        description: validated.description,
        cover_image_url: validated.cover_image_url,
        genre: validated.genre,
        author_name: validated.author_name,
        file_url: validated.file_url,
        download_limit: validated.download_limit,
        status: 'active',
        download_count: 0
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return createdResponse({ reader_magnet: data })
  },
  {
    auth: 'required',
    clientType: 'authenticated'
  }
)
