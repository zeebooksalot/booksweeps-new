import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  createApiResponse, 
  createErrorResponse,
  createSuccessResponse,
  parseQueryParams,
  applyCommonFilters,
  applySorting,
  applyPagination,
  checkSupabaseConnection
} from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    // Use service role client to bypass RLS for public access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Parse query parameters
    const { page, limit, genre, search, user_id, sortBy } = parseQueryParams(request)
    
    console.log('🔍 Books API - Query params:', { page, limit, genre, search, user_id, sortBy })

    // Build query with delivery methods included
    let query = supabase
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
    query = applyCommonFilters(query, { genre, search, user_id })
    
    // Only show active books
    query = query.eq('status', 'active')
    
    console.log('🔍 Books API - After filters applied')

    // Apply sorting
    query = applySorting(query, sortBy)
    
    console.log('🔍 Books API - After sorting applied')

    // Apply pagination and execute
    const { data, error, count } = await applyPagination(query, page, limit)
    
    console.log('🔍 Books API - Query result:', { 
      dataCount: data?.length || 0, 
      totalCount: count || 0, 
      error: error?.message 
    })

    if (error) {
      console.error('❌ Books API - Database error:', error)
      return createErrorResponse(error, 500, 'Database operation failed')
    }

    return createApiResponse(data, page, limit, count || 0)
  } catch (error) {
    console.error('❌ Books API - Unexpected error:', error)
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