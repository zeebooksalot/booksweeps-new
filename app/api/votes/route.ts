import { withApiHandler, createRateLimitConfig } from '@/lib/api-middleware'
import { parseBody } from '@/lib/api-request'
import { successResponse, createdResponse, badRequestError, notFoundError, conflictError } from '@/lib/api-response'
import { CreateVoteSchema } from '@/lib/api-schemas'
import { RATE_LIMITS } from '@/lib/rate-limiter'
import type { SupabaseClient } from '@supabase/supabase-js'

export const POST = withApiHandler(
  async (req, { supabase }) => {
    const validated = await parseBody(req, CreateVoteSchema)
    
    // Check for existing vote
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', validated.user_id)
      .eq('vote_type', validated.vote_type)

    if (checkError) {
      throw new Error(`Database error: ${checkError.message}`)
    }

    if (validated.book_id) {
      const existingBookVote = existingVote?.find((vote: { book_id?: string }) => vote.book_id === validated.book_id)
      if (existingBookVote) {
        return conflictError('You have already voted on this book')
      }
    }

    if (validated.pen_name_id) {
      const existingPenNameVote = existingVote?.find((vote: { pen_name_id?: string }) => vote.pen_name_id === validated.pen_name_id)
      if (existingPenNameVote) {
        return conflictError('You have already voted on this pen name')
      }
    }

    // Insert vote
    const { data, error } = await supabase
      .from('votes')
      .insert({
        user_id: validated.user_id,
        book_id: validated.book_id,
        pen_name_id: validated.pen_name_id,
        vote_type: validated.vote_type
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Update vote counts
    if (validated.book_id) {
      const { error: updateError } = await supabase.rpc('update_book_vote_count', {
        book_id_param: validated.book_id,
        vote_type_param: validated.vote_type
      })

      if (updateError) {
        console.error('Error updating book vote count:', updateError)
      }
    }

    if (validated.pen_name_id) {
      const { error: updateError } = await supabase.rpc('update_pen_name_vote_count', {
        pen_name_id_param: validated.pen_name_id,
        vote_type_param: validated.vote_type
      })

      if (updateError) {
        console.error('Error updating pen name vote count:', updateError)
      }
    }

    return createdResponse({ vote: data })
  },
  {
    auth: 'required',
    rateLimit: createRateLimitConfig('vote', RATE_LIMITS.VOTE),
    clientType: 'authenticated'
  }
)

export const DELETE = withApiHandler(
  async (req, { supabase, query }) => {
    const { user_id, book_id, pen_name_id } = query

    if (!user_id || (!book_id && !pen_name_id)) {
      return badRequestError('Missing required fields')
    }

    // Get the vote before deleting to know what type it was
    const { data: existingVote, error: fetchError } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user_id as string)
      .eq(book_id ? 'book_id' : 'pen_name_id', (book_id || pen_name_id) as string)
      .single()

    if (fetchError || !existingVote) {
      return notFoundError('Vote not found')
    }

    // Delete vote
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('id', existingVote.id)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Decrement vote counts
    await updateVoteCounts(supabase, book_id as string, pen_name_id as string, existingVote.vote_type, null)

    return successResponse({ message: 'Vote removed successfully' })
  },
  {
    auth: 'required',
    clientType: 'authenticated'
  }
)

async function updateVoteCounts(
  supabase: SupabaseClient,
  book_id: string | null, 
  pen_name_id: string | null, 
  oldVoteType: string | null, 
  newVoteType: string | null
) {
  if (!supabase) return

  if (book_id) {
    // Handle book vote counts
    if (oldVoteType === 'upvote' && newVoteType !== 'upvote') {
      await supabase.rpc('decrement_book_upvotes', { book_id_param: book_id })
    }
    if (oldVoteType === 'downvote' && newVoteType !== 'downvote') {
      await supabase.rpc('decrement_book_downvotes', { book_id_param: book_id })
    }
    if (newVoteType === 'upvote' && oldVoteType !== 'upvote') {
      await supabase.rpc('increment_book_upvotes', { book_id_param: book_id })
    }
    if (newVoteType === 'downvote' && oldVoteType !== 'downvote') {
      await supabase.rpc('increment_book_downvotes', { book_id_param: book_id })
    }
  }

  if (pen_name_id) {
    // Handle pen name vote counts
    if (oldVoteType === 'upvote' && newVoteType !== 'upvote') {
      await supabase.rpc('decrement_pen_name_upvotes', { pen_name_id_param: pen_name_id })
    }
    if (oldVoteType === 'downvote' && newVoteType !== 'downvote') {
      await supabase.rpc('decrement_pen_name_downvotes', { pen_name_id_param: pen_name_id })
    }
    if (newVoteType === 'upvote' && oldVoteType !== 'upvote') {
      await supabase.rpc('increment_pen_name_upvotes', { pen_name_id_param: pen_name_id })
    }
    if (newVoteType === 'downvote' && oldVoteType !== 'downvote') {
      await supabase.rpc('increment_pen_name_downvotes', { pen_name_id_param: pen_name_id })
    }
  }
}
