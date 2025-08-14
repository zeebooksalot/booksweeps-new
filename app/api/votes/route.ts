import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

    const body = await request.json()
    const { user_id, book_id, pen_name_id, vote_type } = body

    if (!user_id || !vote_type || (!book_id && !pen_name_id)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (vote_type !== 'upvote' && vote_type !== 'downvote') {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      )
    }

    // Check for existing vote
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user_id)
      .eq('vote_type', vote_type)

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (book_id) {
      const existingBookVote = existingVote?.find(vote => vote.book_id === book_id)
      if (existingBookVote) {
        return NextResponse.json(
          { error: 'You have already voted on this book' },
          { status: 400 }
        )
      }
    }

    if (pen_name_id) {
      const existingPenNameVote = existingVote?.find(vote => vote.pen_name_id === pen_name_id)
      if (existingPenNameVote) {
        return NextResponse.json(
          { error: 'You have already voted on this pen name' },
          { status: 400 }
        )
      }
    }

    // Insert vote
    const { data, error } = await supabase
      .from('votes')
      .insert({
        user_id,
        book_id,
        pen_name_id,
        vote_type
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update vote counts
    if (book_id) {
      const { error: updateError } = await supabase.rpc('update_book_vote_count', {
        book_id_param: book_id,
        vote_type_param: vote_type
      })

      if (updateError) {
        console.error('Error updating book vote count:', updateError)
      }
    }

    if (pen_name_id) {
      const { error: updateError } = await supabase.rpc('update_pen_name_vote_count', {
        pen_name_id_param: pen_name_id,
        vote_type_param: vote_type
      })

      if (updateError) {
        console.error('Error updating pen name vote count:', updateError)
      }
    }

    return NextResponse.json({ vote: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Create authenticated client
    const supabase = createRouteHandlerClient({ cookies })

    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')
    const book_id = searchParams.get('book_id')
    const pen_name_id = searchParams.get('pen_name_id')

    if (!user_id || (!book_id && !pen_name_id)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the vote before deleting to know what type it was
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user_id)
      .eq(book_id ? 'book_id' : 'pen_name_id', book_id || pen_name_id)
      .single()

    if (!existingVote) {
      return NextResponse.json(
        { error: 'Vote not found' },
        { status: 404 }
      )
    }

    // Delete vote
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('id', existingVote.id)

    if (error) {
      console.error('Vote deletion error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Decrement vote counts
    await updateVoteCounts(supabase, book_id, pen_name_id, existingVote.vote_type, null)

    return NextResponse.json({ message: 'Vote removed successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
