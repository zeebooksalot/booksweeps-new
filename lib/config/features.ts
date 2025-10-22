import { z } from 'zod'

// Feature flags environment schema
const featuresEnvSchema = z.object({
  FEATURE_ENABLE_ACCESS_TOKENS: z.string().optional().transform(val => val !== 'false'),
  FEATURE_ENABLE_FILE_SECURITY: z.string().optional().transform(val => val !== 'false'),
  FEATURE_ENABLE_PERFORMANCE_MONITORING: z.string().optional().transform(val => val === 'true'),
  FEATURE_ENABLE_SECURITY_MONITORING: z.string().optional().transform(val => val === 'true'),
})

// Parse feature environment variables
const featuresEnv = featuresEnvSchema.parse(process.env)

// Feature flags
export const FEATURE_FLAGS = {
  enableAccessTokens: featuresEnv.FEATURE_ENABLE_ACCESS_TOKENS ?? true,
  enableFileSecurity: featuresEnv.FEATURE_ENABLE_FILE_SECURITY ?? true,
  enablePerformanceMonitoring: featuresEnv.FEATURE_ENABLE_PERFORMANCE_MONITORING ?? false,
  enableSecurityMonitoring: featuresEnv.FEATURE_ENABLE_SECURITY_MONITORING ?? false,
} as const

// Type exports
export type FeatureFlags = typeof FEATURE_FLAGS

// Helper functions
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return FEATURE_FLAGS[feature]
}
