import { z } from 'zod'

// Monitoring environment schema
const monitoringEnvSchema = z.object({
  MONITORING_ENABLE_CONSOLE_LOGGING: z.string().optional().transform(val => val !== 'false'),
  MONITORING_ENABLE_PERFORMANCE_TRACKING: z.string().optional().transform(val => val === 'true'),
  MONITORING_ENABLE_SECURITY_ALERTS: z.string().optional().transform(val => val === 'true'),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional().default('production'),
  SENTRY_TRACES_SAMPLE_RATE: z.string().optional().transform(val => parseFloat(val || '0.1')),
  SENTRY_PROFILES_SAMPLE_RATE: z.string().optional().transform(val => parseFloat(val || '0.1')),
  LOGROCKET_APP_ID: z.string().optional(),
  LOGROCKET_ENABLE: z.string().optional().transform(val => val === 'true'),
  DATADOG_API_KEY: z.string().optional(),
  DATADOG_ENABLE: z.string().optional().transform(val => val === 'true'),
  DATADOG_SERVICE: z.string().optional().default('booksweeps'),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
  NEW_RELIC_APP_NAME: z.string().optional().default('booksweeps'),
  NEW_RELIC_ENABLE: z.string().optional().transform(val => val === 'true'),
})

// Parse monitoring environment variables
const monitoringEnv = monitoringEnvSchema.parse(process.env)

// Monitoring configuration
export const MONITORING_CONFIG = {
  enableConsoleLogging: monitoringEnv.MONITORING_ENABLE_CONSOLE_LOGGING ?? true,
  enablePerformanceTracking: monitoringEnv.MONITORING_ENABLE_PERFORMANCE_TRACKING ?? false,
  enableSecurityAlerts: monitoringEnv.MONITORING_ENABLE_SECURITY_ALERTS ?? false,
} as const

// External logging services configuration
export const EXTERNAL_LOGGING_CONFIG = {
  // Sentry configuration
  sentry: {
    dsn: monitoringEnv.NEXT_PUBLIC_SENTRY_DSN,
    environment: monitoringEnv.SENTRY_ENVIRONMENT,
    tracesSampleRate: monitoringEnv.SENTRY_TRACES_SAMPLE_RATE,
    profilesSampleRate: monitoringEnv.SENTRY_PROFILES_SAMPLE_RATE,
    enabled: !!monitoringEnv.NEXT_PUBLIC_SENTRY_DSN,
  },
  
  // LogRocket configuration
  logrocket: {
    appId: monitoringEnv.LOGROCKET_APP_ID,
    enabled: monitoringEnv.LOGROCKET_ENABLE && !!monitoringEnv.LOGROCKET_APP_ID,
  },
  
  // Datadog configuration
  datadog: {
    apiKey: monitoringEnv.DATADOG_API_KEY,
    service: monitoringEnv.DATADOG_SERVICE,
    enabled: monitoringEnv.DATADOG_ENABLE && !!monitoringEnv.DATADOG_API_KEY,
  },
  
  // New Relic configuration
  newRelic: {
    licenseKey: monitoringEnv.NEW_RELIC_LICENSE_KEY,
    appName: monitoringEnv.NEW_RELIC_APP_NAME,
    enabled: monitoringEnv.NEW_RELIC_ENABLE && !!monitoringEnv.NEW_RELIC_LICENSE_KEY,
  },
} as const

// Type exports
export type MonitoringConfig = typeof MONITORING_CONFIG
export type ExternalLoggingConfig = typeof EXTERNAL_LOGGING_CONFIG

// Helper functions
export function isExternalLoggingEnabled(service: keyof ExternalLoggingConfig): boolean {
  const serviceConfig = EXTERNAL_LOGGING_CONFIG[service]
  return serviceConfig.enabled
}
