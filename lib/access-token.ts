import { supabase } from './supabase'
import { isValidUUID } from './validation'

// Helper function to check if Supabase is available
function checkSupabase(): boolean {
  if (!supabase) {
    console.error('Supabase client not available')
    return false
  }
  return true
}

export interface AccessTokenData {
  id: string
  delivery_method_id: string
  reader_email: string
  access_token: string
  expires_at: string
  download_count: number
  last_download_at: string
  status: 'delivered' | 'failed' | 'expired'
}

export interface TokenValidationResult {
  isValid: boolean
  token?: AccessTokenData
  error?: string
  reason?: 'invalid' | 'expired' | 'not_found' | 'rate_limited'
}

/**
 * Validate an access token for download access
 */
export async function validateAccessToken(
  token: string,
  deliveryId?: string
): Promise<TokenValidationResult> {
  try {
    // Check if Supabase client is available
    if (!checkSupabase()) {
      return {
        isValid: false,
        error: 'Database connection not available',
        reason: 'invalid'
      }
    }

    // Basic token format validation
    if (!token || typeof token !== 'string' || token.length < 10) {
      return {
        isValid: false,
        error: 'Invalid token format',
        reason: 'invalid'
      }
    }

    // Build query
    let query = supabase!
      .from('reader_deliveries')
      .select(`
        id,
        delivery_method_id,
        reader_email,
        access_token,
        expires_at,
        download_count,
        last_download_at,
        status
      `)
      .eq('access_token', token)

    // Add delivery ID filter if provided
    if (deliveryId && isValidUUID(deliveryId)) {
      query = query.eq('delivery_method_id', deliveryId)
    }

    const { data: delivery, error } = await query.single()

    if (error || !delivery) {
      return {
        isValid: false,
        error: 'Token not found',
        reason: 'not_found'
      }
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(delivery.expires_at)
    
    if (now > expiresAt) {
      return {
        isValid: false,
        error: 'Token has expired',
        reason: 'expired'
      }
    }

    // Check if delivery is in valid status
    if (delivery.status !== 'delivered') {
      return {
        isValid: false,
        error: 'Delivery is not in valid status',
        reason: 'invalid'
      }
    }

    // Rate limiting check for token usage
    const rateLimitResult = await checkTokenRateLimit(delivery.id)
    if (!rateLimitResult.allowed) {
      return {
        isValid: false,
        error: 'Token usage rate limit exceeded',
        reason: 'rate_limited'
      }
    }

    return {
      isValid: true,
      token: delivery as AccessTokenData
    }

  } catch (error) {
    console.error('Token validation error:', error)
    return {
      isValid: false,
      error: 'Token validation failed',
      reason: 'invalid'
    }
  }
}

/**
 * Generate a new access token for a delivery
 */
export async function generateAccessToken(
  deliveryId: string,
  expiryHours: number = 24
): Promise<string | null> {
  try {
    if (!checkSupabase()) {
      return null
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expiryHours)

    const { error } = await supabase!
      .from('reader_deliveries')
      .update({
        access_token: token,
        expires_at: expiresAt.toISOString()
      })
      .eq('id', deliveryId)

    if (error) {
      console.error('Failed to generate access token:', error)
      return null
    }

    return token
  } catch (error) {
    console.error('Token generation error:', error)
    return null
  }
}

/**
 * Revoke an access token
 */
export async function revokeAccessToken(token: string): Promise<boolean> {
  try {
    if (!checkSupabase()) {
      return false
    }

    const { error } = await supabase!
      .from('reader_deliveries')
      .update({
        access_token: null,
        expires_at: null
      })
      .eq('access_token', token)

    if (error) {
      console.error('Failed to revoke access token:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Token revocation error:', error)
    return false
  }
}

/**
 * Check rate limiting for token usage
 */
async function checkTokenRateLimit(deliveryId: string): Promise<{ allowed: boolean }> {
  try {
    if (!checkSupabase()) {
      return { allowed: false }
    }

    // Get current download count
    const { data: delivery } = await supabase!
      .from('reader_deliveries')
      .select('download_count, last_download_at')
      .eq('id', deliveryId)
      .single()

    if (!delivery) {
      return { allowed: false }
    }

    // Allow up to 10 downloads per token per day
    const maxDownloadsPerDay = 10
    const lastDownload = new Date(delivery.last_download_at)
    const now = new Date()
    const hoursSinceLastDownload = (now.getTime() - lastDownload.getTime()) / (1000 * 60 * 60)

    // If it's been more than 24 hours, reset the count
    if (hoursSinceLastDownload > 24) {
      return { allowed: true }
    }

    // Check if we're within the daily limit
    if (delivery.download_count >= maxDownloadsPerDay) {
      return { allowed: false }
    }

    return { allowed: true }
  } catch (error) {
    console.error('Token rate limit check error:', error)
    return { allowed: false }
  }
}

/**
 * Update token usage statistics
 */
export async function updateTokenUsage(deliveryId: string): Promise<boolean> {
  try {
    if (!checkSupabase()) {
      return false
    }

    const { error } = await supabase!
      .from('reader_deliveries')
      .update({
        download_count: supabase!.rpc('increment', { n: 1 }),
        last_download_at: new Date().toISOString()
      })
      .eq('id', deliveryId)

    if (error) {
      console.error('Failed to update token usage:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Token usage update error:', error)
    return false
  }
}

/**
 * Clean up expired tokens
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    if (!checkSupabase()) {
      return 0
    }

    const { count, error } = await supabase!
      .from('reader_deliveries')
      .update({
        status: 'expired',
        access_token: null,
        expires_at: null
      })
      .lt('expires_at', new Date().toISOString())
      .neq('status', 'expired')

    if (error) {
      console.error('Failed to cleanup expired tokens:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Token cleanup error:', error)
    return 0
  }
}

/**
 * Get token statistics
 */
export async function getTokenStats(): Promise<{
  totalTokens: number
  activeTokens: number
  expiredTokens: number
  averageDownloadsPerToken: number
}> {
  try {
    if (!checkSupabase()) {
      return {
        totalTokens: 0,
        activeTokens: 0,
        expiredTokens: 0,
        averageDownloadsPerToken: 0
      }
    }

    const now = new Date().toISOString()

    // Get total tokens
    const { count: totalTokens } = await supabase!
      .from('reader_deliveries')
      .select('*', { count: 'exact', head: true })
      .not('access_token', 'is', null)

    // Get active tokens
    const { count: activeTokens } = await supabase!
      .from('reader_deliveries')
      .select('*', { count: 'exact', head: true })
      .not('access_token', 'is', null)
      .gt('expires_at', now)

    // Get expired tokens
    const { count: expiredTokens } = await supabase!
      .from('reader_deliveries')
      .select('*', { count: 'exact', head: true })
      .not('access_token', 'is', null)
      .lt('expires_at', now)

    // Get average downloads per token
    const { data: avgData } = await supabase!
      .from('reader_deliveries')
      .select('download_count')
      .not('access_token', 'is', null)

    const averageDownloadsPerToken = avgData && avgData.length > 0
      ? avgData.reduce((sum, item) => sum + (item.download_count || 0), 0) / avgData.length
      : 0

    return {
      totalTokens: totalTokens || 0,
      activeTokens: activeTokens || 0,
      expiredTokens: expiredTokens || 0,
      averageDownloadsPerToken: Math.round(averageDownloadsPerToken * 100) / 100
    }
  } catch (error) {
    console.error('Token stats error:', error)
    return {
      totalTokens: 0,
      activeTokens: 0,
      expiredTokens: 0,
      averageDownloadsPerToken: 0
    }
  }
}
