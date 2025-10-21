import { withApiHandler } from '@/lib/api-middleware'
import { parseBody } from '@/lib/api-request'
import { successResponse, badRequestError, forbiddenError } from '@/lib/api-response'
import { z } from 'zod'

const UpgradeUserTypeSchema = z.object({
  user_id: z.string().uuid(),
  new_user_type: z.literal('both'),
  upgrade_reason: z.string().optional(),
  domain_referrer: z.string().url().optional()
})

export const POST = withApiHandler(
  async (req, { supabase, clientMetadata }) => {
    const { user_id, new_user_type, upgrade_reason, domain_referrer } = await parseBody(req, UpgradeUserTypeSchema)

    console.log('🔍 Upgrade User Type API - User ID:', user_id, 'New Type:', new_user_type)

    // Security check: ensure user can only upgrade their own account
    if (clientMetadata.userId !== user_id) {
      return forbiddenError('Unauthorized: can only upgrade your own account')
    }

    // Update user type
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        user_type: new_user_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)

    if (updateError) {
      throw new Error(`Database error: ${updateError.message}`)
    }

    // Log the upgrade event for analytics (optional until migration is ready)
    try {
      const { error: logError } = await supabase
        .from('user_upgrade_logs')
        .insert({
          user_id,
          from_user_type: 'author', // We know they were author type
          to_user_type: new_user_type,
          upgrade_reason,
          domain_referrer,
          ip_address: clientMetadata.ip,
          user_agent: clientMetadata.userAgent,
          upgraded_at: new Date().toISOString()
        })

      if (logError) {
        console.error('Error logging upgrade:', logError)
        // Don't fail the request if logging fails
      }
    } catch (error) {
      console.error('Upgrade logging not available yet (table may not exist):', error)
      // Continue without logging - this is expected until migration is run
    }

    return successResponse({
      success: true,
      message: 'User type upgraded successfully',
      new_user_type,
      cache_invalidated: true, // Hint for client to clear cache
      timestamp: new Date().toISOString()
    })
  },
  {
    auth: 'required',
    clientType: 'authenticated'
  }
)
