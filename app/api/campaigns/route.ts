import { withApiHandler } from '@/lib/api-middleware'
import { parseBody, validatePagination } from '@/lib/api-request'
import { paginatedResponse, createdResponse } from '@/lib/api-response'
import { CreateCampaignSchema } from '@/lib/api-schemas'

export const GET = withApiHandler(
  async (req, { supabase, query }) => {
    const { page, limit, user_id, status, search } = query

    const { page: validPage, limit: validLimit } = validatePagination(
      typeof page === 'string' ? parseInt(page) : 1,
      typeof limit === 'string' ? parseInt(limit) : 10
    )

    let dbQuery = supabase
      .from('campaigns')
      .select(`
        *,
        books (
          id,
          title,
          author,
          cover_image_url,
          genre
        ),
        pen_names (
          id,
          name,
          avatar_url
        )
      `)

    if (user_id && typeof user_id === 'string') {
      dbQuery = dbQuery.eq('user_id', user_id)
    }

    if (status && typeof status === 'string') {
      dbQuery = dbQuery.eq('status', status)
    }

    if (search && typeof search === 'string') {
      dbQuery = dbQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    dbQuery = dbQuery.order('created_at', { ascending: false })

    // Apply pagination
    const offset = (validPage - 1) * validLimit
    const { data, error, count } = await dbQuery.range(offset, offset + validLimit - 1)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return paginatedResponse(
      { campaigns: data },
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
    clientType: 'service'
  }
)

export const POST = withApiHandler(
  async (req, { supabase }) => {
    const validated = await parseBody(req, CreateCampaignSchema)
    
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: validated.user_id,
        title: validated.title,
        description: validated.description,
        book_id: validated.book_id,
        pen_name_id: validated.pen_name_id,
        campaign_type: validated.campaign_type,
        prize_description: validated.prize_description,
        rules: validated.rules,
        start_date: validated.start_date,
        end_date: validated.end_date,
        max_entries: validated.max_entries,
        number_of_winners: validated.number_of_winners,
        target_entries: validated.target_entries,
        duration: validated.duration,
        entry_methods: validated.entry_methods,
        selected_books: validated.selected_books,
        gdpr_checkbox: validated.gdpr_checkbox,
        custom_thank_you_page: validated.custom_thank_you_page,
        social_media_config: validated.social_media_config,
        status: 'draft',
        entry_count: 0,
        is_featured: false
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return createdResponse({ campaign: data })
  },
  {
    auth: 'required',
    clientType: 'service'
  }
) 