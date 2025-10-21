import { withApiHandler } from '@/lib/api-middleware'
import { parseBody } from '@/lib/api-request'
import { paginatedResponse, createdResponse } from '@/lib/api-response'
import { CreateBookSchema } from '@/lib/api-schemas'
import { applyCommonFilters, applySorting, applyPagination } from '@/lib/api-utils'

export const GET = withApiHandler(
  async (req, { supabase, query }) => {
    const { page, limit, genre, search, user_id, sortBy } = query
    
    console.log('🔍 Books API - Query params:', { page, limit, genre, search, user_id, sortBy })

    // Build query with delivery methods included
    let dbQuery = supabase
      .from('books')
      .select(`
        *,
        pen_names (
          id,
          name,
          bio,
          avatar_url
        ),
        book_delivery_methods!book_id (
          id,
          slug,
          format,
          delivery_method,
          is_active
        )
      `)

    // Apply common filters
    dbQuery = applyCommonFilters(dbQuery, { 
      genre: typeof genre === 'string' ? genre : null,
      search: typeof search === 'string' ? search : null,
      user_id: typeof user_id === 'string' ? user_id : null
    })
    
    // Only show active books
    dbQuery = dbQuery.eq('status', 'active')
    
    console.log('🔍 Books API - After filters applied')

    // Apply sorting
    dbQuery = applySorting(dbQuery, sortBy as string)
    
    console.log('🔍 Books API - After sorting applied')

    // Apply pagination and execute
    const pageNum = typeof page === 'string' ? parseInt(page) : (typeof page === 'number' ? page : 1)
    const limitNum = typeof limit === 'string' ? parseInt(limit) : (typeof limit === 'number' ? limit : 10)
    const { data, error, count } = await applyPagination(dbQuery, pageNum, limitNum)
    
    console.log('🔍 Books API - Query result:', { 
      dataCount: data?.length || 0, 
      totalCount: count || 0, 
      error: error?.message 
    })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return paginatedResponse(
      data,
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
  async (req, { supabase }) => {
    const validated = await parseBody(req, CreateBookSchema)
    
    const { data, error } = await supabase
      .from('books')
      .insert({
        user_id: validated.user_id,
        title: validated.title,
        author: validated.author,
        description: validated.description,
        cover_image_url: validated.cover_image_url,
        publisher: validated.publisher,
        published_date: validated.published_date,
        genre: validated.genre,
        page_count: validated.page_count,
        language: validated.language,
        isbn: validated.isbn,
        asin: validated.asin,
        pen_name_id: validated.pen_name_id,
        series_id: validated.series_id,
        series_order: validated.series_order,
        status: 'active',
        source: 'manual'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return createdResponse({ book: data })
  },
  {
    auth: 'required',
    clientType: 'service'
  }
) 