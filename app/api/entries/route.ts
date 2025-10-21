import { withApiHandler } from '@/lib/api-middleware'
import { parseBody, validatePagination } from '@/lib/api-request'
import { paginatedResponse, badRequestError, createdResponse } from '@/lib/api-response'
import { CreateEntrySchema } from '@/lib/api-schemas'
import { RATE_LIMITS } from '@/lib/rate-limiter'

export const GET = withApiHandler(
  async (req, { supabase, query }) => {
    const { campaign_id, page, limit } = query
    
    if (!campaign_id || typeof campaign_id !== 'string') {
      return badRequestError('Campaign ID is required')
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(campaign_id)) {
      return badRequestError('Campaign ID must be a valid UUID')
    }

    const { page: validPage, limit: validLimit } = validatePagination(
      typeof page === 'string' ? parseInt(page) : 1,
      typeof limit === 'string' ? parseInt(limit) : 10
    )

    const { data, error, count } = await supabase
      .from('reader_entries')
      .select('*')
      .eq('campaign_id', campaign_id)
      .order('created_at', { ascending: false })
      .range((validPage - 1) * validLimit, validPage * validLimit - 1)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return paginatedResponse(
      { entries: data },
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
  async (req, { supabase, clientMetadata }) => {
    const validated = await parseBody(req, CreateEntrySchema)
    
    const { data, error } = await supabase
      .from('reader_entries')
      .insert({
        campaign_id: validated.campaign_id,
        email: validated.email,
        first_name: validated.first_name,
        last_name: validated.last_name,
        entry_method: validated.entry_method,
        entry_data: validated.entry_data || {},
        ip_address: clientMetadata.ip,
        user_agent: clientMetadata.userAgent,
        marketing_opt_in: validated.marketing_opt_in,
        referral_code: validated.referral_code,
        referred_by: validated.referred_by,
        status: 'pending',
        verified: false
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Update entry count
    const { error: updateError } = await supabase.rpc('increment_campaign_entries', {
      campaign_id_param: validated.campaign_id
    })

    if (updateError) {
      console.error('Error updating entry count:', updateError)
      // Don't fail the request if count update fails
    }

    return createdResponse({ entry: data })
  },
  {
    auth: 'none',
    rateLimit: {
      type: 'ip',
      action: 'campaign_entry',
      config: RATE_LIMITS.CAMPAIGN_ENTRY
    },
    clientType: 'authenticated'
  }
)
