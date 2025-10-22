import { z } from 'zod'

// Security environment schema
const securityEnvSchema = z.object({
  SECURITY_ENABLE_AUDIT_LOGGING: z.string().optional().transform(val => val === 'true'),
  SECURITY_ENABLE_RATE_LIMITING: z.string().optional().transform(val => val !== 'false'),
  SECURITY_ENABLE_TOKEN_VALIDATION: z.string().optional().transform(val => val !== 'false'),
  SECURITY_ENABLE_FILE_ACCESS_CONTROL: z.string().optional().transform(val => val !== 'false'),
  RATE_LIMIT_MAX_REQUESTS_PER_MINUTE: z.string().optional().transform(val => parseInt(val || '100')),
  RATE_LIMIT_MAX_DOWNLOADS_PER_HOUR: z.string().optional().transform(val => parseInt(val || '20')),
  RATE_LIMIT_MAX_DOWNLOADS_PER_DAY: z.string().optional().transform(val => parseInt(val || '100')),
  DOWNLOAD_EXPIRY_HOURS: z.string().optional().transform(val => parseInt(val || '24')),
  DOWNLOAD_MAX_FILE_SIZE_MB: z.string().optional().transform(val => parseInt(val || '100')),
  DOWNLOAD_ENABLE_DUPLICATE_PREVENTION: z.string().optional().transform(val => val !== 'false'),
  SECURITY_ENABLE_FILE_SCANNING: z.string().optional().transform(val => val === 'true'),
  SECURITY_ENABLE_VIRUS_SCANNING: z.string().optional().transform(val => val === 'true'),
  SECURITY_MAX_FILE_SIZE_FOR_SCANNING_MB: z.string().optional().transform(val => parseInt(val || '10')),
})

// Parse security environment variables
const securityEnv = securityEnvSchema.parse(process.env)

// Security configuration
export const SECURITY_CONFIG = {
  // Audit logging
  enableAuditLogging: securityEnv.SECURITY_ENABLE_AUDIT_LOGGING ?? true,
  
  // Rate limiting
  enableRateLimiting: securityEnv.SECURITY_ENABLE_RATE_LIMITING ?? true,
  maxRequestsPerMinute: securityEnv.RATE_LIMIT_MAX_REQUESTS_PER_MINUTE ?? 100,
  maxDownloadsPerHour: securityEnv.RATE_LIMIT_MAX_DOWNLOADS_PER_HOUR ?? 20,
  maxDownloadsPerDay: securityEnv.RATE_LIMIT_MAX_DOWNLOADS_PER_DAY ?? 100,
  
  // Token validation
  enableTokenValidation: securityEnv.SECURITY_ENABLE_TOKEN_VALIDATION ?? true,
  
  // File access control
  enableFileAccessControl: securityEnv.SECURITY_ENABLE_FILE_ACCESS_CONTROL ?? true,
  
  // File scanning
  enableFileScanning: securityEnv.SECURITY_ENABLE_FILE_SCANNING ?? false,
  enableVirusScanning: securityEnv.SECURITY_ENABLE_VIRUS_SCANNING ?? false,
  maxFileSizeForScanningMB: securityEnv.SECURITY_MAX_FILE_SIZE_FOR_SCANNING_MB ?? 10,
  
  // Download settings
  downloadExpiryHours: securityEnv.DOWNLOAD_EXPIRY_HOURS ?? 24,
  maxFileSizeMB: securityEnv.DOWNLOAD_MAX_FILE_SIZE_MB ?? 100,
  enableDuplicatePrevention: securityEnv.DOWNLOAD_ENABLE_DUPLICATE_PREVENTION ?? true,
  
  // Allowed file types
  allowedFileTypes: [
    'application/pdf',
    'application/epub+zip',
    'application/x-mobipocket-ebook',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ] as const,
  
  // Allowed file extensions
  allowedExtensions: ['.pdf', '.epub', '.mobi', '.txt', '.doc', '.docx'] as const,
  
  // Security headers (CSP is handled by middleware)
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  } as const
}

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  // General API endpoints
  API_GENERAL: {
    limit: SECURITY_CONFIG.maxRequestsPerMinute,
    window: 60 // 1 minute
  },
  
  // Authentication endpoints
  AUTH_LOGIN: {
    limit: 5,
    window: 300 // 5 minutes
  },
  
  AUTH_SIGNUP: {
    limit: 3,
    window: 3600 // 1 hour
  },
  
  // Download endpoints
  DOWNLOAD_BOOK: {
    limit: SECURITY_CONFIG.maxDownloadsPerHour,
    window: 3600 // 1 hour
  },
  
  DOWNLOAD_GENERAL: {
    limit: SECURITY_CONFIG.maxDownloadsPerDay,
    window: 86400 // 24 hours
  },
  
  // Vote endpoints
  VOTE: {
    limit: 10,
    window: 60 // 1 minute
  },
  
  // Comment endpoints
  COMMENT: {
    limit: 5,
    window: 300 // 5 minutes
  },
  
  // Campaign/Entry endpoints
  CAMPAIGN_ENTRY: {
    limit: 3,
    window: 3600 // 1 hour
  }
} as const

// Type exports
export type SecurityConfig = typeof SECURITY_CONFIG
export type RateLimitConfig = typeof RATE_LIMIT_CONFIG

// Helper functions
export function isSecurityEnabled(security: keyof SecurityConfig): boolean {
  const value = SECURITY_CONFIG[security]
  return typeof value === 'boolean' ? value : false
}

export function getRateLimit(key: keyof RateLimitConfig) {
  return RATE_LIMIT_CONFIG[key]
}
