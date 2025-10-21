import { withApiHandler } from '@/lib/api-middleware'
import { parseBody } from '@/lib/api-request'
import { paginatedResponse, createdResponse } from '@/lib/api-response'
import { applyPagination } from '@/lib/api-utils'
import { CreatePenNameSchema } from '@/lib/api-schemas'

export const GET = withApiHandler(
  async (req, { supabase, query }) => {
    const { page, limit, user_id, search } = query
    
    console.log('🔍 Pen Names API - Query params:', { page, limit, user_id, search })

    let dbQuery = supabase
      .from('pen_names')
      .select('*')

    // Apply user filter
    if (typeof user_id === 'string' && user_id) {
      dbQuery = dbQuery.eq('user_id', user_id)
    }

    // Apply search filter
    if (typeof search === 'string' && search) {
      dbQuery = dbQuery.or(`name.ilike.%${search}%,bio.ilike.%${search}%`)
    }

    // Only show active pen names
    dbQuery = dbQuery.eq('status', 'active')

    // Apply sorting
    dbQuery = dbQuery.order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })

    console.log('🔍 Pen Names API - After filters applied')

    // Apply pagination and execute
    const pageNum = typeof page === 'string' ? parseInt(page) : (typeof page === 'number' ? page : 1)
    const limitNum = typeof limit === 'string' ? parseInt(limit) : (typeof limit === 'number' ? limit : 10)
    const { data, error, count } = await applyPagination(dbQuery, pageNum, limitNum)
    
    console.log('🔍 Pen Names API - Query result:', { 
      dataCount: data?.length || 0, 
      totalCount: count || 0, 
      error: error?.message 
    })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return paginatedResponse(
      { pen_names: data },
      {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    )
  },
  {
    auth: 'optional',
    clientType: 'authenticated'
  }
)

export const POST = withApiHandler(
  async (req, { supabase, body, clientMetadata }) => {
    const validated = await parseBody(req, CreatePenNameSchema)
    
    // Use authenticated user's ID if not provided
    const userId = validated.user_id || clientMetadata.userId
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('pen_names')
      .insert({
        user_id: userId,
        name: validated.name,
        bio: validated.bio,
        website: validated.website,
        social_links: validated.social_links || {},
        avatar_url: validated.avatar_url,
        genre: validated.genre,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return createdResponse({ pen_name: data })
  },
  {
    auth: 'required',
    clientType: 'authenticated'
  }
)
