import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  
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
let env: {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  CROSS_DOMAIN_AUTH_ENABLED: boolean
  CROSS_DOMAIN_ALLOWED_ORIGINS: string[]
  NODE_ENV: 'development' | 'production' | 'test'
}

if (isEdgeFunction) {
  // Use fallback values for Edge Functions
  console.warn('Running in Edge Function environment, using fallback values')
  env = {
    NEXT_PUBLIC_SUPABASE_URL: '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
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
  env = validationResult.data as typeof env
}

// Environment configuration
export const ENV_CONFIG = {
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  nodeEnv: env.NODE_ENV,
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

// Type exports
export type EnvConfig = typeof ENV_CONFIG
export type CrossDomainConfig = typeof CROSS_DOMAIN_CONFIG
export type ErrorConfig = typeof ERROR_CONFIG
export type DatabaseConfig = typeof DATABASE_CONFIG

// Helper functions
export function shouldLogError(): boolean {
  return ERROR_CONFIG.logErrors
}

export function shouldSanitizeErrors(): boolean {
  return ERROR_CONFIG.sanitizeErrors
}

// Export environment for backward compatibility
export { env }
