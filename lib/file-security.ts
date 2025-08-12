import { supabase } from './supabase'
import { isValidUUID } from './validation'
import { generateAccessToken, validateAccessToken } from './access-token'

export interface FileAccessRequest {
  deliveryId: string
  userId?: string
  ip: string
  userAgent: string
  referer?: string
}

export interface SecureDownloadUrl {
  url: string
  token: string
  expiresAt: string
  deliveryId: string
}

export interface FileAccessAudit {
  id: string
  deliveryId: string
  userId?: string
  ip: string
  userAgent: string
  referer?: string
  accessGranted: boolean
  reason?: string
  timestamp: string
}

/**
 * Validate file access permissions
 */
export async function validateFileAccess(
  deliveryId: string,
  ip: string,
  userId?: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    if (!supabase) {
      return { allowed: false, reason: 'Database unavailable' }
    }

    if (!isValidUUID(deliveryId)) {
      return { allowed: false, reason: 'Invalid delivery ID' }
    }

    // Check if delivery method exists and is active
    const { data: deliveryMethod, error: methodError } = await supabase!
      .from('book_delivery_methods')
      .select('id, book_id, is_active')
      .eq('id', deliveryId)
      .eq('is_active', true)
      .single()

    if (methodError || !deliveryMethod) {
      return { allowed: false, reason: 'Delivery method not found or inactive' }
    }

    // Check if user has already downloaded (for duplicate prevention)
    if (userId) {
      const { data: existingDelivery } = await supabase!
        .from('reader_deliveries')
        .select('id')
        .eq('delivery_method_id', deliveryId)
        .eq('reader_email', userId)
        .single()

      if (existingDelivery) {
        // Allow re-download but log it
        return { allowed: true, reason: 'Re-download allowed' }
      }
    }

    return { allowed: true }
  } catch (error) {
    console.error('File access validation error:', error)
    return { allowed: false, reason: 'Validation failed' }
  }
}

/**
 * Generate secure download URL with access token
 */
export async function generateSecureDownloadUrl(
  request: FileAccessRequest,
  expiryHours: number = 24
): Promise<SecureDownloadUrl | null> {
  try {
    if (!supabase) {
      console.error('Supabase client not available')
      return null
    }

    // Validate file access
    const accessValidation = await validateFileAccess(
      request.deliveryId,
      request.ip,
      request.userId
    )

    if (!accessValidation.allowed) {
      console.warn('File access denied:', accessValidation.reason)
      await logFileAccess({
        ...request,
        accessGranted: false,
        reason: accessValidation.reason
      })
      return null
    }

    // Get delivery method and book info
    const { data: deliveryMethod, error: deliveryError } = await supabase!
      .from('book_delivery_methods')
      .select('id, book_id')
      .eq('id', request.deliveryId)
      .single()

    if (deliveryError || !deliveryMethod) {
      console.error('Delivery method not found')
      return null
    }

    // Get book files
    const { data: bookFiles, error: filesError } = await supabase!
      .from('book_files')
      .select('id, file_path, file_name, file_type')
      .eq('book_id', deliveryMethod.book_id)
      .limit(1)

    if (filesError || !bookFiles?.[0]) {
      console.error('Book files not found')
      return null
    }

    const file = bookFiles[0]

    // Generate access token
    const token = await generateAccessToken(request.deliveryId, expiryHours)
    if (!token) {
      console.error('Failed to generate access token')
      return null
    }

    // Generate signed URL
    const { data: signedUrl, error: signedUrlError } = await supabase!.storage
      .from('book-files')
      .createSignedUrl(file.file_path, expiryHours * 3600)

    if (signedUrlError || !signedUrl?.signedUrl) {
      console.error('Failed to generate signed URL:', signedUrlError)
      return null
    }

    // Log successful access
    await logFileAccess({
      ...request,
      accessGranted: true
    })

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expiryHours)

    return {
      url: signedUrl.signedUrl,
      token,
      expiresAt: expiresAt.toISOString(),
      deliveryId: request.deliveryId
    }
  } catch (error) {
    console.error('Secure download URL generation error:', error)
    return null
  }
}

/**
 * Validate download URL with token
 */
export async function validateDownloadUrl(
  token: string,
  deliveryId: string
): Promise<{ valid: boolean; reason?: string; fileInfo?: Record<string, unknown> }> {
  try {
    // Validate access token
    const tokenValidation = await validateAccessToken(token, deliveryId)
    if (!tokenValidation.isValid) {
      return { valid: false, reason: tokenValidation.error }
    }

    // Get file information
    if (!supabase) {
      return { valid: false, reason: 'Database unavailable' }
    }

    // Get delivery method and book info
    const { data: deliveryMethod, error: deliveryError } = await supabase!
      .from('book_delivery_methods')
      .select('id, book_id')
      .eq('id', deliveryId)
      .single()

    if (deliveryError || !deliveryMethod) {
      return { valid: false, reason: 'Delivery method not found' }
    }

    // Get book files
    const { data: bookFiles, error: filesError } = await supabase!
      .from('book_files')
      .select('id, file_path, file_name, file_type')
      .eq('book_id', deliveryMethod.book_id)
      .limit(1)

    if (filesError || !bookFiles?.[0]) {
      return { valid: false, reason: 'File not found' }
    }

    return { valid: true, fileInfo: bookFiles[0] }
  } catch (error) {
    console.error('Download URL validation error:', error)
    return { valid: false, reason: 'Validation failed' }
  }
}

/**
 * Log file access for audit trail
 */
async function logFileAccess(audit: Omit<FileAccessAudit, 'id' | 'timestamp'>): Promise<void> {
  try {
    if (!supabase) {
      console.error('Cannot log file access - Supabase unavailable')
      return
    }

    const auditRecord: Omit<FileAccessAudit, 'id'> = {
      ...audit,
      timestamp: new Date().toISOString()
    }

    // Note: This would require a file_access_audit table in the database
    // For now, we'll log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 File Access Audit:', auditRecord)
    }

    // TODO: Implement actual audit logging when table is created
    // await supabase!.from('file_access_audit').insert(auditRecord)
  } catch (error) {
    console.error('Failed to log file access:', error)
  }
}

/**
 * Get file access statistics
 */
export async function getFileAccessStats(deliveryId: string): Promise<{
  totalAccesses: number
  successfulAccesses: number
  failedAccesses: number
  uniqueUsers: number
  averageDownloadsPerUser: number
}> {
  try {
    if (!supabase) {
      return {
        totalAccesses: 0,
        successfulAccesses: 0,
        failedAccesses: 0,
        uniqueUsers: 0,
        averageDownloadsPerUser: 0
      }
    }

    // Get delivery statistics
    const { data: deliveries, error } = await supabase!
      .from('reader_deliveries')
      .select('reader_email, download_count, delivered_at')
      .eq('delivery_method_id', deliveryId)

    if (error || !deliveries) {
      return {
        totalAccesses: 0,
        successfulAccesses: 0,
        failedAccesses: 0,
        uniqueUsers: 0,
        averageDownloadsPerUser: 0
      }
    }

    const totalAccesses = deliveries.reduce((sum, d) => sum + (d.download_count || 1), 0)
    const uniqueUsers = new Set(deliveries.map(d => d.reader_email)).size
    const averageDownloadsPerUser = uniqueUsers > 0 ? totalAccesses / uniqueUsers : 0

    return {
      totalAccesses,
      successfulAccesses: totalAccesses, // All recorded deliveries are successful
      failedAccesses: 0, // Failed accesses aren't recorded in current system
      uniqueUsers,
      averageDownloadsPerUser: Math.round(averageDownloadsPerUser * 100) / 100
    }
  } catch (error) {
    console.error('File access stats error:', error)
    return {
      totalAccesses: 0,
      successfulAccesses: 0,
      failedAccesses: 0,
      uniqueUsers: 0,
      averageDownloadsPerUser: 0
    }
  }
}

/**
 * Clean up expired file access records
 */
export async function cleanupExpiredFileAccess(): Promise<number> {
  try {
    if (!supabase) {
      return 0
    }

    // Clean up expired access tokens
    const { count, error } = await supabase!
      .from('reader_deliveries')
      .update({
        status: 'expired',
        access_token: null,
        expires_at: null
      })
      .lt('expires_at', new Date().toISOString())
      .neq('status', 'expired')
      .not('access_token', 'is', null)

    if (error) {
      console.error('Failed to cleanup expired file access:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('File access cleanup error:', error)
    return 0
  }
}

/**
 * Validate file format and security
 */
export function validateFileFormat(fileName: string, fileType: string): boolean {
  const allowedExtensions = ['.pdf', '.epub', '.mobi', '.txt', '.doc', '.docx']
  const allowedFileTypes = ['pdf', 'epub', 'mobi', 'txt', 'doc', 'docx']

  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  return allowedExtensions.includes(extension) && allowedFileTypes.includes(fileType.toLowerCase())
}
