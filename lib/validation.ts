import { z } from 'zod'

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Base validation schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .max(255, 'Email is too long')
  .regex(EMAIL_REGEX, 'Invalid email format')
  .transform(email => email.toLowerCase().trim())

export const uuidSchema = z
  .string()
  .min(1, 'ID is required')
  .regex(UUID_REGEX, 'Invalid UUID format')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters')
  .transform(name => name.trim())

// Download request validation schema
export const downloadRequestSchema = z.object({
  delivery_method_id: uuidSchema,
  email: emailSchema,
  name: nameSchema.optional(),
})

export type DownloadRequest = z.infer<typeof downloadRequestSchema>

// Rate limit request validation schema
export const rateLimitRequestSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required').max(255, 'Identifier is too long'),
  limit: z.number().int().positive().max(1000, 'Limit is too high'),
  window: z.number().int().positive().max(86400, 'Window is too large'), // Max 24 hours
})

export type RateLimitRequest = z.infer<typeof rateLimitRequestSchema>

// Access token validation schema
export const accessTokenSchema = z.object({
  token: z.string().min(1, 'Token is required').max(255, 'Token is too long'),
  delivery_id: uuidSchema.optional(),
})

export type AccessTokenRequest = z.infer<typeof accessTokenSchema>

// Validation functions
export function validateDownloadRequest(body: unknown): DownloadRequest {
  try {
    return downloadRequestSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
      throw new ValidationError('Invalid download request', issues)
    }
    throw new ValidationError('Invalid request format')
  }
}

export function validateRateLimitRequest(body: unknown): RateLimitRequest {
  try {
    return rateLimitRequestSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
      throw new ValidationError('Invalid rate limit request', issues)
    }
    throw new ValidationError('Invalid request format')
  }
}

export function validateAccessTokenRequest(body: unknown): AccessTokenRequest {
  try {
    return accessTokenSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
      throw new ValidationError('Invalid access token request', issues)
    }
    throw new ValidationError('Invalid request format')
  }
}

// Email validation function
export function isValidEmail(email: string): boolean {
  try {
    emailSchema.parse(email)
    return true
  } catch {
    return false
  }
}

// UUID validation function
export function isValidUUID(uuid: string): boolean {
  try {
    uuidSchema.parse(uuid)
    return true
  } catch {
    return false
  }
}

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .substring(0, 1000) // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

// Custom error classes
export class ValidationError extends Error {
  public readonly issues?: Array<{
    field: string
    message: string
    code: string
  }>

  constructor(message: string, issues?: Array<{ field: string; message: string; code: string }>) {
    super(message)
    this.name = 'ValidationError'
    this.issues = issues
  }
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SecurityError'
  }
}

// Security validation functions
export function validateRequestOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // Allow requests without origin/referer (direct API calls)
  if (!origin && !referer) {
    return true
  }
  
  // Validate origin if present
  if (origin) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://booksweeps.com',
      'https://www.booksweeps.com',
      // Add other allowed domains
    ]
    
    if (!allowedOrigins.includes(origin)) {
      return false
    }
  }
  
  return true
}

export function validateUserAgent(userAgent: string | null): boolean {
  if (!userAgent) {
    return false // Require user agent
  }
  
  // Block common bot user agents
  const blockedUserAgents = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python',
    'java',
    'perl',
    'ruby',
    'php',
    'go-http-client',
    'okhttp',
    'axios',
    'requests',
  ]
  
  const lowerUserAgent = userAgent.toLowerCase()
  return !blockedUserAgents.some(blocked => lowerUserAgent.includes(blocked))
}

// Rate limiting validation
export function validateRateLimitConfig(limit: number, window: number): boolean {
  return (
    Number.isInteger(limit) &&
    limit > 0 &&
    limit <= 1000 &&
    Number.isInteger(window) &&
    window > 0 &&
    window <= 86400 // Max 24 hours
  )
}
