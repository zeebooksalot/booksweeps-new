import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { user_id, book_id, pen_name_id, vote_type } = body

    if (!user_id || (!book_id && !pen_name_id) || !vote_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['upvote', 'downvote'].includes(vote_type)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      )
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user_id)
      .eq(book_id ? 'book_id' : 'pen_name_id', book_id || pen_name_id)
      .single()

    if (existingVote) {
      // Update existing vote
      const { data: updatedVote, error: updateError } = await supabase
        .from('votes')
        .update({ 
          vote_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingVote.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      // Update vote counts
      await updateVoteCounts(book_id, pen_name_id, existingVote.vote_type, vote_type)

      return NextResponse.json({ vote: updatedVote })
    }

    // Create new vote
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        user_id,
        book_id,
        pen_name_id,
        vote_type
      })
      .select()
      .single()

    if (voteError) {
      console.error('Vote creation error:', voteError)
      return NextResponse.json({ error: voteError.message }, { status: 500 })
    }

    // Update vote counts
    await updateVoteCounts(book_id, pen_name_id, null, vote_type)

    return NextResponse.json({ vote }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

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
    await updateVoteCounts(book_id, pen_name_id, existingVote.vote_type, null)

    return NextResponse.json({ message: 'Vote removed successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateVoteCounts(
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
