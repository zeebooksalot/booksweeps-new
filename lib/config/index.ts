// Import all configuration modules
import * as security from './security'
import * as features from './features'
import * as monitoring from './monitoring'
import * as validation from './validation'
import * as environment from './environment'
import * as platform from './platform'

// Export the main config object
export const CONFIG = {
  security: security.SECURITY_CONFIG,
  features: features.FEATURE_FLAGS,
  monitoring: monitoring.MONITORING_CONFIG,
  externalLogging: monitoring.EXTERNAL_LOGGING_CONFIG,
  crossDomain: environment.CROSS_DOMAIN_CONFIG,
  env: environment.ENV_CONFIG,
  rateLimit: security.RATE_LIMIT_CONFIG,
  validation: validation.VALIDATION_CONFIG,
  error: environment.ERROR_CONFIG,
  database: environment.DATABASE_CONFIG,
} as const

// Re-export everything from all modules
export * from './security'
export * from './features'
export * from './monitoring'
export * from './validation'
export * from './environment'
export * from './platform'

// Main config type
export type Config = typeof CONFIG

// Configuration validation
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validate required environment variables
  if (!environment.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  
  if (!environment.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  
  if (!environment.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required')
  }
  
  // Validate rate limiting configuration
  if (security.SECURITY_CONFIG.maxRequestsPerMinute <= 0) {
    errors.push('RATE_LIMIT_MAX_REQUESTS_PER_MINUTE must be positive')
  }
  
  if (security.SECURITY_CONFIG.maxDownloadsPerHour <= 0) {
    errors.push('RATE_LIMIT_MAX_DOWNLOADS_PER_HOUR must be positive')
  }
  
  if (security.SECURITY_CONFIG.maxDownloadsPerDay <= 0) {
    errors.push('RATE_LIMIT_MAX_DOWNLOADS_PER_DAY must be positive')
  }
  
  // Validate download configuration
  if (security.SECURITY_CONFIG.downloadExpiryHours <= 0) {
    errors.push('DOWNLOAD_EXPIRY_HOURS must be positive')
  }
  
  if (security.SECURITY_CONFIG.maxFileSizeMB <= 0) {
    errors.push('DOWNLOAD_MAX_FILE_SIZE_MB must be positive')
  }
  
  // Validate external logging configuration
  if (monitoring.EXTERNAL_LOGGING_CONFIG.sentry.enabled && !monitoring.EXTERNAL_LOGGING_CONFIG.sentry.dsn) {
    errors.push('SENTRY_DSN is required when Sentry is enabled')
  }
  
  if (monitoring.EXTERNAL_LOGGING_CONFIG.logrocket.enabled && !monitoring.EXTERNAL_LOGGING_CONFIG.logrocket.appId) {
    errors.push('LOGROCKET_APP_ID is required when LogRocket is enabled')
  }
  
  if (monitoring.EXTERNAL_LOGGING_CONFIG.datadog.enabled && !monitoring.EXTERNAL_LOGGING_CONFIG.datadog.apiKey) {
    errors.push('DATADOG_API_KEY is required when Datadog is enabled')
  }
  
  if (monitoring.EXTERNAL_LOGGING_CONFIG.newRelic.enabled && !monitoring.EXTERNAL_LOGGING_CONFIG.newRelic.licenseKey) {
    errors.push('NEW_RELIC_LICENSE_KEY is required when New Relic is enabled')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}