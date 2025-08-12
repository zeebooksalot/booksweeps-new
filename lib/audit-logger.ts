import { NextRequest } from 'next/server'
import { getClientIP } from './utils'

export interface AuditLogEntry {
  id: string
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'SECURITY'
  category: 'API_REQUEST' | 'AUTH' | 'DOWNLOAD' | 'SECURITY' | 'SYSTEM'
  action: string
  userId?: string
  ip: string
  userAgent?: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  requestBody?: unknown
  error?: string
  metadata?: Record<string, unknown>
}

export interface SecurityEvent {
  type: 'RATE_LIMIT_EXCEEDED' | 'INVALID_TOKEN' | 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ACTIVITY'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  ip: string
  userAgent?: string
  userId?: string
  metadata?: Record<string, unknown>
  timestamp?: string
}

export interface PerformanceMetrics {
  endpoint: string
  method: string
  averageResponseTime: number
  requestCount: number
  errorCount: number
  successRate: number
  lastUpdated: string
}

// In-memory storage for development (in production, use external service)
class AuditLogger {
  private logs: AuditLogEntry[] = []
  private securityEvents: SecurityEvent[] = []
  private performanceMetrics: Map<string, PerformanceMetrics> = new Map()
  private maxLogs = 10000 // Keep last 10k logs in memory

  /**
   * Log an API request
   */
  async logApiRequest(
    request: NextRequest,
    response: Response,
    responseTime: number,
    userId?: string,
    requestBody?: unknown,
    error?: string
  ): Promise<void> {
    const logEntry: Omit<AuditLogEntry, 'id'> = {
      timestamp: new Date().toISOString(),
      level: error ? 'ERROR' : response.ok ? 'INFO' : 'WARN',
      category: 'API_REQUEST',
      action: `${request.method} ${request.nextUrl.pathname}`,
      userId,
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
      endpoint: request.nextUrl.pathname,
      method: request.method,
      statusCode: response.status,
      responseTime,
      requestBody: this.sanitizeRequestBody(requestBody),
      error,
      metadata: {
        referer: request.headers.get('referer'),
        origin: request.headers.get('origin'),
        cfConnectingIP: request.headers.get('cf-connecting-ip'),
        xForwardedFor: request.headers.get('x-forwarded-for')
      }
    }

    this.addLog(logEntry)
    this.updatePerformanceMetrics(logEntry)
  }

  /**
   * Log a security event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    this.securityEvents.push({
      ...event,
      timestamp: new Date().toISOString()
    })

    // Keep only last 1000 security events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = this.getSecurityEventEmoji(event.severity)
      console.log(`${emoji} SECURITY EVENT [${event.severity}]: ${event.description}`)
      console.log(`   IP: ${event.ip}, User: ${event.userId || 'anonymous'}`)
      if (event.metadata) {
        console.log(`   Metadata:`, event.metadata)
      }
    }

    // TODO: Send to external security monitoring service in production
    // await sendToSecurityService(event)
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    action: string,
    userId: string,
    ip: string,
    success: boolean,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const logEntry: Omit<AuditLogEntry, 'id'> = {
      timestamp: new Date().toISOString(),
      level: success ? 'INFO' : 'WARN',
      category: 'AUTH',
      action,
      userId,
      ip,
      endpoint: '/api/auth',
      method: 'POST',
      statusCode: success ? 200 : 401,
      responseTime: 0,
      metadata
    }

    this.addLog(logEntry)
  }

  /**
   * Log download events
   */
  async logDownloadEvent(
    deliveryId: string,
    userId: string,
    ip: string,
    success: boolean,
    fileSize?: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const logEntry: Omit<AuditLogEntry, 'id'> = {
      timestamp: new Date().toISOString(),
      level: success ? 'INFO' : 'ERROR',
      category: 'DOWNLOAD',
      action: `DOWNLOAD_${success ? 'SUCCESS' : 'FAILED'}`,
      userId,
      ip,
      endpoint: '/api/reader-magnets/downloads',
      method: 'POST',
      statusCode: success ? 200 : 400,
      responseTime: 0,
      metadata: {
        deliveryId,
        fileSize,
        ...metadata
      }
    }

    this.addLog(logEntry)
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 100, category?: string): AuditLogEntry[] {
    let logs = this.logs
    if (category) {
      logs = logs.filter(log => log.category === category)
    }
    return logs.slice(-limit).reverse()
  }

  /**
   * Get recent security events
   */
  getRecentSecurityEvents(limit: number = 50): SecurityEvent[] {
    return this.securityEvents.slice(-limit).reverse()
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics[] {
    return Array.from(this.performanceMetrics.values())
  }

  /**
   * Get performance metrics for specific endpoint
   */
  getEndpointMetrics(endpoint: string, method: string): PerformanceMetrics | null {
    const key = `${method}:${endpoint}`
    return this.performanceMetrics.get(key) || null
  }

  /**
   * Detect suspicious activity
   */
  detectSuspiciousActivity(ip: string, timeWindowMinutes: number = 5): boolean {
    const now = new Date()
    const windowStart = new Date(now.getTime() - timeWindowMinutes * 60 * 1000)

    // Count requests from this IP in the time window
    const recentRequests = this.logs.filter(log => 
      log.ip === ip && 
      new Date(log.timestamp) >= windowStart
    )

    // Count security events from this IP in the time window
    const recentSecurityEvents = this.securityEvents.filter(event =>
      event.ip === ip &&
      event.timestamp &&
      new Date(event.timestamp) >= windowStart
    )

    // Suspicious if more than 50 requests or 5 security events in 5 minutes
    return recentRequests.length > 50 || recentSecurityEvents.length > 5
  }

  /**
   * Get system health metrics
   */
  getSystemHealth(): {
    totalRequests: number
    errorRate: number
    averageResponseTime: number
    activeUsers: number
    securityEvents: number
  } {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentLogs = this.logs.filter(log => new Date(log.timestamp) >= last24Hours)
    const recentSecurityEvents = this.securityEvents.filter(event => 
      event.timestamp &&
      new Date(event.timestamp) >= last24Hours
    )

    const totalRequests = recentLogs.length
    const errorCount = recentLogs.filter(log => log.level === 'ERROR').length
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0
    const averageResponseTime = recentLogs.length > 0 
      ? recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / recentLogs.length 
      : 0
    const activeUsers = new Set(recentLogs.map(log => log.userId).filter(Boolean)).size

    return {
      totalRequests,
      errorRate: Math.round(errorRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime),
      activeUsers,
      securityEvents: recentSecurityEvents.length
    }
  }

  /**
   * Export logs for analysis
   */
  exportLogs(startDate?: Date, endDate?: Date): AuditLogEntry[] {
    let logs = this.logs

    if (startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= startDate)
    }

    if (endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= endDate)
    }

    return logs
  }

  /**
   * Clear old logs
   */
  clearOldLogs(daysToKeep: number = 30): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
    this.logs = this.logs.filter(log => new Date(log.timestamp) >= cutoffDate)
  }

  // Private helper methods
  private addLog(logEntry: Omit<AuditLogEntry, 'id'>): void {
    const fullEntry: AuditLogEntry = {
      ...logEntry,
      id: crypto.randomUUID()
    }

    this.logs.push(fullEntry)

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
  }

  private updatePerformanceMetrics(logEntry: Omit<AuditLogEntry, 'id'>): void {
    const key = `${logEntry.method}:${logEntry.endpoint}`
    const existing = this.performanceMetrics.get(key)

    if (existing) {
      const totalTime = existing.averageResponseTime * existing.requestCount + logEntry.responseTime
      const newCount = existing.requestCount + 1
      const newErrorCount = existing.errorCount + (logEntry.level === 'ERROR' ? 1 : 0)

      this.performanceMetrics.set(key, {
        endpoint: logEntry.endpoint,
        method: logEntry.method,
        averageResponseTime: totalTime / newCount,
        requestCount: newCount,
        errorCount: newErrorCount,
        successRate: ((newCount - newErrorCount) / newCount) * 100,
        lastUpdated: new Date().toISOString()
      })
    } else {
      this.performanceMetrics.set(key, {
        endpoint: logEntry.endpoint,
        method: logEntry.method,
        averageResponseTime: logEntry.responseTime,
        requestCount: 1,
        errorCount: logEntry.level === 'ERROR' ? 1 : 0,
        successRate: logEntry.level === 'ERROR' ? 0 : 100,
        lastUpdated: new Date().toISOString()
      })
    }
  }

  private sanitizeRequestBody(body: unknown): unknown {
    if (!body) return body

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'apiKey']
    
    if (typeof body === 'object' && body !== null) {
      const sanitized = { ...body as Record<string, unknown> }
      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]'
        }
      })
      return sanitized
    }

    return body
  }

  private getSecurityEventEmoji(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return '🚨'
      case 'HIGH': return '🔴'
      case 'MEDIUM': return '🟡'
      case 'LOW': return '🟢'
      default: return 'ℹ️'
    }
  }
}

// Global audit logger instance
export const auditLogger = new AuditLogger()

// Helper functions for common logging scenarios
export async function logApiRequest(
  request: NextRequest,
  response: Response,
  responseTime: number,
  userId?: string,
  requestBody?: unknown,
  error?: string
): Promise<void> {
  await auditLogger.logApiRequest(request, response, responseTime, userId, requestBody, error)
}

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  await auditLogger.logSecurityEvent(event)
}

export async function logAuthEvent(
  action: string,
  userId: string,
  ip: string,
  success: boolean,
  metadata?: Record<string, unknown>
): Promise<void> {
  await auditLogger.logAuthEvent(action, userId, ip, success, metadata)
}

export async function logDownloadEvent(
  deliveryId: string,
  userId: string,
  ip: string,
  success: boolean,
  fileSize?: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  await auditLogger.logDownloadEvent(deliveryId, userId, ip, success, fileSize, metadata)
}
