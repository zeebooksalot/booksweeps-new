import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export class FailedLoginTracker {
  private static readonly MAX_EMAIL_ATTEMPTS = 5
  private static readonly MAX_IP_ATTEMPTS = 10
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

  /**
   * Track a failed login attempt
   */
  static async trackFailedAttempt(
    email: string, 
    ipAddress: string, 
    referringUrl?: string,
    loginPageUrl?: string
  ): Promise<{
    attempts: number
    ipAttempts: number
    isLocked: boolean
    isIpLocked: boolean
    lockoutUntil?: string
    ipLockoutUntil?: string
  }> {
    const supabase = createRouteHandlerClient({ cookies })

    // Record the failed attempt
    await supabase
      .from('failed_login_attempts')
      .insert({
        email: email.toLowerCase(),
        ip_address: ipAddress,
        timestamp: new Date().toISOString(),
        success: false,
        referring_url: referringUrl,
        login_page_url: loginPageUrl
      })

    // Get current attempt counts
    const attempts = await this.getFailedAttempts(email)
    const ipAttempts = await this.getFailedAttemptsByIP(ipAddress)
    
    return {
      attempts,
      ipAttempts,
      isLocked: attempts >= this.MAX_EMAIL_ATTEMPTS,
      isIpLocked: ipAttempts >= this.MAX_IP_ATTEMPTS,
      lockoutUntil: attempts >= this.MAX_EMAIL_ATTEMPTS 
        ? new Date(Date.now() + this.LOCKOUT_DURATION).toISOString()
        : undefined,
      ipLockoutUntil: ipAttempts >= this.MAX_IP_ATTEMPTS
        ? new Date(Date.now() + this.LOCKOUT_DURATION).toISOString()
        : undefined
    }
  }

  /**
   * Check if login is allowed for this email and IP
   */
  static async isLoginAllowed(email: string, ipAddress: string): Promise<{
    allowed: boolean
    reason?: string
    attempts?: number
    ipAttempts?: number
    lockoutUntil?: string
    ipLockoutUntil?: string
  }> {
    const attempts = await this.getFailedAttempts(email)
    const ipAttempts = await this.getFailedAttemptsByIP(ipAddress)
    
    // Check email-based lockout
    if (attempts >= this.MAX_EMAIL_ATTEMPTS) {
      const lastAttemptTime = await this.getLastAttemptTime(email)
      
      if (lastAttemptTime) {
        const lockoutUntil = new Date(lastAttemptTime.getTime() + this.LOCKOUT_DURATION)
        
        // Check if lockout period has expired
        if (new Date() < lockoutUntil) {
          return {
            allowed: false,
            reason: 'Account temporarily locked due to too many failed attempts',
            attempts,
            ipAttempts,
            lockoutUntil: lockoutUntil.toISOString()
          }
        } else {
          // Lockout expired, clear attempts
          await this.clearFailedAttempts(email)
        }
      }
    }

    // Check IP-based lockout
    if (ipAttempts >= this.MAX_IP_ATTEMPTS) {
      const lastIpAttemptTime = await this.getLastAttemptTimeByIP(ipAddress)
      
      if (lastIpAttemptTime) {
        const ipLockoutUntil = new Date(lastIpAttemptTime.getTime() + this.LOCKOUT_DURATION)
        
        // Check if IP lockout period has expired
        if (new Date() < ipLockoutUntil) {
          return {
            allowed: false,
            reason: 'IP address temporarily locked due to too many failed attempts',
            attempts,
            ipAttempts,
            ipLockoutUntil: ipLockoutUntil.toISOString()
          }
        } else {
          // IP lockout expired, clear IP attempts
          await this.clearFailedAttemptsByIP(ipAddress)
        }
      }
    }

    return { allowed: true, attempts, ipAttempts }
  }

  /**
   * Track a successful login attempt and reset counters
   */
  static async trackSuccessfulAttempt(
    email: string, 
    ipAddress: string, 
    referringUrl?: string,
    loginPageUrl?: string
  ): Promise<void> {
    const supabase = createRouteHandlerClient({ cookies })

    // Record the successful attempt
    await supabase
      .from('failed_login_attempts')
      .insert({
        email: email.toLowerCase(),
        ip_address: ipAddress,
        timestamp: new Date().toISOString(),
        success: true,
        reason: 'Successful login',
        referring_url: referringUrl,
        login_page_url: loginPageUrl
      })

    // Clear failed attempts for this email
    await this.clearFailedAttempts(email)
  }

  /**
   * Clear failed attempts on successful login
   */
  static async clearFailedAttempts(email: string): Promise<void> {
    const supabase = createRouteHandlerClient({ cookies })

    await supabase
      .from('failed_login_attempts')
      .delete()
      .eq('email', email.toLowerCase())
      .eq('success', false)
  }

  /**
   * Get number of failed attempts for an email in the last 24 hours
   */
  private static async getFailedAttempts(email: string): Promise<number> {
    const supabase = createRouteHandlerClient({ cookies })
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours

    const { data, error } = await supabase
      .from('failed_login_attempts')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('success', false)
      .gte('timestamp', cutoffTime.toISOString())

    if (error) {
      console.error('Error getting failed attempts:', error)
      return 0
    }

    return data?.length || 0
  }

  /**
   * Get the timestamp of the last failed attempt for an email
   */
  private static async getLastAttemptTime(email: string): Promise<Date | null> {
    const supabase = createRouteHandlerClient({ cookies })
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours

    const { data, error } = await supabase
      .from('failed_login_attempts')
      .select('timestamp')
      .eq('email', email.toLowerCase())
      .eq('success', false)
      .gte('timestamp', cutoffTime.toISOString())
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return new Date(data.timestamp)
  }

  /**
   * Get number of failed attempts for an IP address in the last 24 hours
   */
  private static async getFailedAttemptsByIP(ipAddress: string): Promise<number> {
    const supabase = createRouteHandlerClient({ cookies })
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours

    const { data, error } = await supabase
      .from('failed_login_attempts')
      .select('*')
      .eq('ip_address', ipAddress)
      .eq('success', false)
      .gte('timestamp', cutoffTime.toISOString())

    if (error) {
      console.error('Error getting failed attempts by IP:', error)
      return 0
    }

    return data?.length || 0
  }

  /**
   * Get the timestamp of the last failed attempt for an IP address
   */
  private static async getLastAttemptTimeByIP(ipAddress: string): Promise<Date | null> {
    const supabase = createRouteHandlerClient({ cookies })
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours

    const { data, error } = await supabase
      .from('failed_login_attempts')
      .select('timestamp')
      .eq('ip_address', ipAddress)
      .eq('success', false)
      .gte('timestamp', cutoffTime.toISOString())
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return new Date(data.timestamp)
  }

  /**
   * Clear failed attempts for an IP address
   */
  private static async clearFailedAttemptsByIP(ipAddress: string): Promise<void> {
    const supabase = createRouteHandlerClient({ cookies })

    await supabase
      .from('failed_login_attempts')
      .delete()
      .eq('ip_address', ipAddress)
      .eq('success', false)
  }
}
