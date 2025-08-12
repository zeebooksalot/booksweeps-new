import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
  // Security configuration
  SECURITY_ENABLE_AUDIT_LOGGING: z.string().optional().transform(val => val === 'true'),
  SECURITY_ENABLE_RATE_LIMITING: z.string().optional().transform(val => val !== 'false'), // Default true
  SECURITY_ENABLE_TOKEN_VALIDATION: z.string().optional().transform(val => val !== 'false'), // Default true
  SECURITY_ENABLE_FILE_ACCESS_CONTROL: z.string().optional().transform(val => val !== 'false'), // Default true
  
  // Rate limiting configuration
  RATE_LIMIT_MAX_REQUESTS_PER_MINUTE: z.string().optional().transform(val => parseInt(val || '100')),
  RATE_LIMIT_MAX_DOWNLOADS_PER_HOUR: z.string().optional().transform(val => parseInt(val || '20')),
  RATE_LIMIT_MAX_DOWNLOADS_PER_DAY: z.string().optional().transform(val => parseInt(val || '100')),
  
  // Download configuration
  DOWNLOAD_EXPIRY_HOURS: z.string().optional().transform(val => parseInt(val || '24')),
  DOWNLOAD_MAX_FILE_SIZE_MB: z.string().optional().transform(val => parseInt(val || '100')),
  DOWNLOAD_ENABLE_DUPLICATE_PREVENTION: z.string().optional().transform(val => val !== 'false'), // Default true
  
  // Feature flags
  FEATURE_ENABLE_ACCESS_TOKENS: z.string().optional().transform(val => val !== 'false'), // Default true
  FEATURE_ENABLE_FILE_SECURITY: z.string().optional().transform(val => val !== 'false'), // Default true
  FEATURE_ENABLE_PERFORMANCE_MONITORING: z.string().optional().transform(val => val === 'true'),
  FEATURE_ENABLE_SECURITY_MONITORING: z.string().optional().transform(val => val === 'true'),
  
  // Monitoring configuration
  MONITORING_ENABLE_CONSOLE_LOGGING: z.string().optional().transform(val => val !== 'false'), // Default true
  MONITORING_ENABLE_PERFORMANCE_TRACKING: z.string().optional().transform(val => val === 'true'),
  MONITORING_ENABLE_SECURITY_ALERTS: z.string().optional().transform(val => val === 'true'),
  
  // Cross-domain configuration
  CROSS_DOMAIN_AUTH_ENABLED: z.string().optional().transform(val => val === 'true'),
  CROSS_DOMAIN_ALLOWED_ORIGINS: z.string().optional().transform(val => 
    val ? val.split(',').map(origin => origin.trim()) : []
  ),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Check if we're in an Edge Function environment (missing Supabase URL)
const isEdgeFunction = !process.env.NEXT_PUBLIC_SUPABASE_URL

// Validate environment variables with fallbacks for Edge Functions
let env: any

if (isEdgeFunction) {
  // Use fallback values for Edge Functions
  console.warn('Running in Edge Function environment, using fallback values')
  env = {
    NEXT_PUBLIC_SUPABASE_URL: '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
    SECURITY_ENABLE_AUDIT_LOGGING: true,
    SECURITY_ENABLE_RATE_LIMITING: true,
    SECURITY_ENABLE_TOKEN_VALIDATION: true,
    SECURITY_ENABLE_FILE_ACCESS_CONTROL: true,
    RATE_LIMIT_MAX_REQUESTS_PER_MINUTE: 100,
    RATE_LIMIT_MAX_DOWNLOADS_PER_HOUR: 20,
    RATE_LIMIT_MAX_DOWNLOADS_PER_DAY: 100,
    DOWNLOAD_EXPIRY_HOURS: 24,
    DOWNLOAD_MAX_FILE_SIZE_MB: 100,
    DOWNLOAD_ENABLE_DUPLICATE_PREVENTION: true,
    FEATURE_ENABLE_ACCESS_TOKENS: true,
    FEATURE_ENABLE_FILE_SECURITY: true,
    FEATURE_ENABLE_PERFORMANCE_MONITORING: false,
    FEATURE_ENABLE_SECURITY_MONITORING: false,
    MONITORING_ENABLE_CONSOLE_LOGGING: true,
    MONITORING_ENABLE_PERFORMANCE_TRACKING: false,
    MONITORING_ENABLE_SECURITY_ALERTS: false,
    CROSS_DOMAIN_AUTH_ENABLED: false,
    CROSS_DOMAIN_ALLOWED_ORIGINS: [],
    NODE_ENV: 'production' as const,
  }
} else {
  // Normal validation for non-Edge Function environments
  const validationResult = envSchema.safeParse(process.env)
  if (!validationResult.success) {
    console.warn('Environment validation failed:', validationResult.error.issues)
    throw new Error('Environment validation failed')
  }
  env = validationResult.data
}

// Security configuration
export const SECURITY_CONFIG = {
  // Audit logging
  enableAuditLogging: env.SECURITY_ENABLE_AUDIT_LOGGING ?? true,
  
  // Rate limiting
  enableRateLimiting: env.SECURITY_ENABLE_RATE_LIMITING ?? true,
  maxRequestsPerMinute: env.RATE_LIMIT_MAX_REQUESTS_PER_MINUTE ?? 100,
  maxDownloadsPerHour: env.RATE_LIMIT_MAX_DOWNLOADS_PER_HOUR ?? 20,
  maxDownloadsPerDay: env.RATE_LIMIT_MAX_DOWNLOADS_PER_DAY ?? 100,
  
  // Token validation
  enableTokenValidation: env.SECURITY_ENABLE_TOKEN_VALIDATION ?? true,
  
  // File access control
  enableFileAccessControl: env.SECURITY_ENABLE_FILE_ACCESS_CONTROL ?? true,
  
  // Download settings
  downloadExpiryHours: env.DOWNLOAD_EXPIRY_HOURS ?? 24,
  maxFileSizeMB: env.DOWNLOAD_MAX_FILE_SIZE_MB ?? 100,
  enableDuplicatePrevention: env.DOWNLOAD_ENABLE_DUPLICATE_PREVENTION ?? true,
  
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
  
  // Security headers
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  } as const
}

// Feature flags
export const FEATURE_FLAGS = {
  enableAccessTokens: env.FEATURE_ENABLE_ACCESS_TOKENS ?? true,
  enableFileSecurity: env.FEATURE_ENABLE_FILE_SECURITY ?? true,
  enablePerformanceMonitoring: env.FEATURE_ENABLE_PERFORMANCE_MONITORING ?? false,
  enableSecurityMonitoring: env.FEATURE_ENABLE_SECURITY_MONITORING ?? false,
} as const

// Monitoring configuration
export const MONITORING_CONFIG = {
  enableConsoleLogging: env.MONITORING_ENABLE_CONSOLE_LOGGING ?? true,
  enablePerformanceTracking: env.MONITORING_ENABLE_PERFORMANCE_TRACKING ?? false,
  enableSecurityAlerts: env.MONITORING_ENABLE_SECURITY_ALERTS ?? false,
} as const

// Cross-domain configuration
export const CROSS_DOMAIN_CONFIG = {
  enabled: env.CROSS_DOMAIN_AUTH_ENABLED ?? false,
  allowedOrigins: env.CROSS_DOMAIN_ALLOWED_ORIGINS ?? [
    'http://localhost:3000',
    'https://booksweeps.com',
    'https://www.booksweeps.com'
  ],
} as const

// Environment configuration
export const ENV_CONFIG = {
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  nodeEnv: env.NODE_ENV,
} as const

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

// Validation configuration
export const VALIDATION_CONFIG = {
  // Email validation
  emailMaxLength: 255,
  emailRegex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  // Name validation
  nameMaxLength: 100,
  nameRegex: /^[a-zA-Z\s\-'\.]+$/,
  
  // UUID validation
  uuidRegex: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Token validation
  tokenMinLength: 10,
  tokenMaxLength: 255,
} as const

// Error configuration
export const ERROR_CONFIG = {
  // Error message sanitization
  sanitizeErrors: ENV_CONFIG.isProduction,
  
  // Error logging
  logErrors: true,
  logErrorStack: ENV_CONFIG.isDevelopment,
  
  // Error response format
  includeErrorType: ENV_CONFIG.isDevelopment,
  includeErrorDetails: ENV_CONFIG.isDevelopment,
} as const

// Database configuration
export const DATABASE_CONFIG = {
  // Connection settings
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  
  // Query settings
  queryTimeout: 30000, // 30 seconds
  maxQueryResults: 1000,
  
  // RLS (Row Level Security)
  enableRLS: true,
} as const

// Export the main config object
export const CONFIG = {
  security: SECURITY_CONFIG,
  features: FEATURE_FLAGS,
  monitoring: MONITORING_CONFIG,
  crossDomain: CROSS_DOMAIN_CONFIG,
  env: ENV_CONFIG,
  rateLimit: RATE_LIMIT_CONFIG,
  validation: VALIDATION_CONFIG,
  error: ERROR_CONFIG,
  database: DATABASE_CONFIG,
} as const

// Type exports
export type SecurityConfig = typeof SECURITY_CONFIG
export type FeatureFlags = typeof FEATURE_FLAGS
export type MonitoringConfig = typeof MONITORING_CONFIG
export type CrossDomainConfig = typeof CROSS_DOMAIN_CONFIG
export type EnvConfig = typeof ENV_CONFIG
export type RateLimitConfig = typeof RATE_LIMIT_CONFIG
export type ValidationConfig = typeof VALIDATION_CONFIG
export type ErrorConfig = typeof ERROR_CONFIG
export type DatabaseConfig = typeof DATABASE_CONFIG
export type Config = typeof CONFIG

// Helper functions
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return FEATURE_FLAGS[feature]
}

export function isSecurityEnabled(security: keyof SecurityConfig): boolean {
  const value = SECURITY_CONFIG[security]
  return typeof value === 'boolean' ? value : false
}

export function getRateLimit(key: keyof RateLimitConfig) {
  return RATE_LIMIT_CONFIG[key]
}

export function shouldLogError(): boolean {
  return ERROR_CONFIG.logErrors
}

export function shouldSanitizeErrors(): boolean {
  return ERROR_CONFIG.sanitizeErrors
}

// Configuration validation
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validate required environment variables
  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required')
  }
  
  // Validate rate limiting configuration
  if (SECURITY_CONFIG.maxRequestsPerMinute <= 0) {
    errors.push('RATE_LIMIT_MAX_REQUESTS_PER_MINUTE must be positive')
  }
  
  if (SECURITY_CONFIG.maxDownloadsPerHour <= 0) {
    errors.push('RATE_LIMIT_MAX_DOWNLOADS_PER_HOUR must be positive')
  }
  
  if (SECURITY_CONFIG.maxDownloadsPerDay <= 0) {
    errors.push('RATE_LIMIT_MAX_DOWNLOADS_PER_DAY must be positive')
  }
  
  // Validate download configuration
  if (SECURITY_CONFIG.downloadExpiryHours <= 0) {
    errors.push('DOWNLOAD_EXPIRY_HOURS must be positive')
  }
  
  if (SECURITY_CONFIG.maxFileSizeMB <= 0) {
    errors.push('DOWNLOAD_MAX_FILE_SIZE_MB must be positive')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Export environment for backward compatibility
export { env }

// Backward compatibility exports for existing code
export const config = {
  // Platform URLs
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://staging.booksweeps.com',
  readerUrl: process.env.NEXT_PUBLIC_READER_URL || 'https://read.booksweeps.com',
  authorUrl: process.env.NEXT_PUBLIC_AUTHOR_URL || 'https://app.booksweeps.com',
  
  // Supabase configuration
  supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceKey: env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Environment
  isDevelopment: ENV_CONFIG.isDevelopment,
  isProduction: ENV_CONFIG.isProduction,
  isTest: ENV_CONFIG.isTest,
} as const

// Helper functions for backward compatibility
export const getPlatformUrls = () => ({
  mainSite: config.siteUrl,
  reader: config.readerUrl,
  author: config.authorUrl,
})

export const getPlatformHosts = () => {
  const urls = getPlatformUrls()
  return {
    mainSite: new URL(urls.mainSite).hostname,
    reader: new URL(urls.reader).hostname,
    author: new URL(urls.author).hostname,
  }
}

export const getCurrentPlatform = (hostname: string) => {
  const hosts = getPlatformHosts()
  
  if (hostname === hosts.mainSite) return 'main'
  if (hostname === hosts.reader) return 'reader'
  if (hostname === hosts.author) return 'author'
  
  return 'unknown'
}

export const shouldRedirectUser = (userType: string, currentHost: string) => {
  const hosts = getPlatformHosts()
  
  // Readers shouldn't be on author platform - redirect them to reader site
  if (userType === 'reader' && currentHost === hosts.author) {
    return { shouldRedirect: true, targetUrl: `${config.readerUrl}/dashboard` }
  }
  
  // Author users on main site - let login page handle choice modal, don't auto-redirect
  if (userType === 'author' && currentHost === hosts.mainSite) {
    return { shouldRedirect: false } // Login page will show choice modal
  }
  
  // Users with both types can access all platforms
  if (userType === 'both') {
    return { shouldRedirect: false }
  }
  
  return { shouldRedirect: false }
}

// Validate environment variables for cross-domain auth
export const validateCrossDomainConfig = () => {
  const errors: string[] = []
  
  // Check required environment variables
  if (!process.env.NEXT_PUBLIC_AUTHOR_URL) {
    errors.push('NEXT_PUBLIC_AUTHOR_URL is not set - author site redirects may not work')
  }
  
  if (!process.env.NEXT_PUBLIC_READER_URL) {
    errors.push('NEXT_PUBLIC_READER_URL is not set - reader site redirects may not work')
  }
  
  // Validate URL formats
  try {
    if (process.env.NEXT_PUBLIC_AUTHOR_URL) {
      new URL(process.env.NEXT_PUBLIC_AUTHOR_URL)
    }
  } catch (error) {
    errors.push('NEXT_PUBLIC_AUTHOR_URL is not a valid URL')
  }
  
  try {
    if (process.env.NEXT_PUBLIC_READER_URL) {
      new URL(process.env.NEXT_PUBLIC_READER_URL)
    }
  } catch (error) {
    errors.push('NEXT_PUBLIC_READER_URL is not a valid URL')
  }
  
  return errors
}

// Type definitions
export type Platform = 'main' | 'reader' | 'author' | 'unknown'
export type UserType = 'reader' | 'author' | 'both' 