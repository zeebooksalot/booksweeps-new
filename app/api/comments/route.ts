import { withApiHandler, createRateLimitConfig } from '@/lib/api-middleware'
import { parseBody, validatePagination } from '@/lib/api-request'
import { paginatedResponse, badRequestError, createdResponse } from '@/lib/api-response'
import { CreateCommentSchema } from '@/lib/api-schemas'
import { RATE_LIMITS } from '@/lib/rate-limiter'

export const GET = withApiHandler(
  async (req, { supabase, query }) => {
    const { book_id, page, limit } = query
    
    if (!book_id || typeof book_id !== 'string') {
      return badRequestError('Book ID is required')
    }

    const { page: validPage, limit: validLimit } = validatePagination(
      typeof page === 'string' ? parseInt(page) : 1,
      typeof limit === 'string' ? parseInt(limit) : 10
    )

    const { data, error, count } = await supabase
      .from('comments')
      .select(`
        *,
        users (
          id,
          username,
          avatar_url
        )
      `)
      .eq('book_id', book_id)
      .order('created_at', { ascending: false })
      .range((validPage - 1) * validLimit, validPage * validLimit - 1)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return paginatedResponse(
      { comments: data },
      {
        page: validPage,
        limit: validLimit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validLimit)
      }
    )
  },
  {
    auth: 'none',
    clientType: 'authenticated'
  }
)

export const POST = withApiHandler(
  async (req, { supabase }) => {
    const validated = await parseBody(req, CreateCommentSchema)
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: validated.user_id,
        book_id: validated.book_id,
        content: validated.content
      })
      .select(`
        *,
        users (
          id,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Update comment count
    const { error: updateError } = await supabase.rpc('increment_book_comments', {
      book_id_param: validated.book_id
    })

    if (updateError) {
      console.error('Error updating comment count:', updateError)
      // Don't fail the request if count update fails
    }

    return createdResponse({ comment: data })
  },
  {
    auth: 'required',
    rateLimit: createRateLimitConfig('comment', RATE_LIMITS.COMMENT),
    clientType: 'authenticated'
  }
) 