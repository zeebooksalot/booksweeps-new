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
    const { page, limit, search, sortBy } = parseQueryParams(request)

    // Build query
    let query = supabase
      .from('pen_names')
      .select('*')

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%`)
    }

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
    const { name, bio, avatar_url, website_url, twitter_url, goodreads_url } = body

    if (!name || !bio || !avatar_url) {
      return createErrorResponse(new Error('Missing required fields'), 400)
    }

    const { data, error } = await supabase
      .from('pen_names')
      .insert({
        name,
        bio,
        avatar_url,
        website_url,
        twitter_url,
        goodreads_url,
        upvotes_count: 0,
        downvotes_count: 0,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      return createErrorResponse(error, 500, 'Database operation failed')
    }

    return createSuccessResponse({ author: data }, 201)
  } catch (error) {
    return createErrorResponse(error)
  }
} 