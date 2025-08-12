import { NextRequest } from 'next/server'
import { 
  checkSupabaseConnection, 
  createApiResponse, 
  createErrorResponse,
  createSuccessResponse,
  parseQueryParams,
  applyCommonFilters,
  applySorting,
  applyPagination
} from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase client is available
    const connection = checkSupabaseConnection()
    if (connection.error) return connection.error
    const { supabase } = connection

    // Parse query parameters
    const { page, limit, genre, search, user_id, sortBy } = parseQueryParams(request)

    // Build query
    let query = supabase
      .from('books')
      .select(`
        *,
        pen_names (
          id,
          name,
          bio,
          avatar_url
        )
      `)

    // Apply common filters
    query = applyCommonFilters(query, { genre, search, user_id })
    
    // Only show active books
    query = query.eq('status', 'active')

    // Apply sorting
    query = applySorting(query, sortBy)

    // Apply pagination and execute
    const { data, error, count } = await applyPagination(query, page, limit)

    if (error) {
      return createErrorResponse(error, 500, 'Database operation failed')
    }

    return createApiResponse(data, page, limit, count || 0)
  } catch (error) {
    return createErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase client is available
    const connection = checkSupabaseConnection()
    if (connection.error) return connection.error
    const { supabase } = connection

    const body = await request.json()
    const { 
      user_id, 
      title, 
      author, 
      description, 
      cover_image_url, 
      publisher, 
      published_date, 
      genre, 
      page_count, 
      language = 'English',
      isbn,
      asin,
      pen_name_id,
      series_id,
      series_order
    } = body

    if (!user_id || !title || !author) {
      return createErrorResponse(new Error('Missing required fields'), 400)
    }

    const { data, error } = await supabase
      .from('books')
      .insert({
        user_id,
        title,
        author,
        description,
        cover_image_url,
        publisher,
        published_date,
        genre,
        page_count,
        language,
        isbn,
        asin,
        pen_name_id,
        series_id,
        series_order,
        status: 'active',
        source: 'manual'
      })
      .select()
      .single()

    if (error) {
      return createErrorResponse(error, 500, 'Database operation failed')
    }

    return createSuccessResponse({ book: data }, 201)
  } catch (error) {
    return createErrorResponse(error)
  }
} 