/**
 * Shared validation utilities
 * Common validation patterns and utilities used across the application
 */

import { z } from 'zod'

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  DISPLAY_NAME: /^[a-zA-Z0-9\s\-_\.]{2,50}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,20}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIMEZONE: /^[A-Za-z_]+\/[A-Za-z_]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA: /^[a-zA-Z\s]+$/,
  NUMERIC: /^\d+$/,
  DECIMAL: /^\d+(\.\d+)?$/
} as const

/**
 * Common validation schemas using Zod
 */
export const CommonSchemas = {
  email: z.string().email().max(255),
  username: z.string().min(3).max(30).regex(VALIDATION_PATTERNS.USERNAME),
  displayName: z.string().min(2).max(50).regex(VALIDATION_PATTERNS.DISPLAY_NAME),
  url: z.string().url().max(2048),
  phone: z.string().regex(VALIDATION_PATTERNS.PHONE).optional(),
  zipCode: z.string().regex(VALIDATION_PATTERNS.ZIP_CODE).optional(),
  date: z.string().regex(VALIDATION_PATTERNS.DATE),
  timezone: z.string().regex(VALIDATION_PATTERNS.TIMEZONE).optional(),
  uuid: z.string().uuid(),
  slug: z.string().regex(VALIDATION_PATTERNS.SLUG),
  alphanumeric: z.string().regex(VALIDATION_PATTERNS.ALPHANUMERIC),
  alpha: z.string().regex(VALIDATION_PATTERNS.ALPHA),
  numeric: z.string().regex(VALIDATION_PATTERNS.NUMERIC),
  decimal: z.string().regex(VALIDATION_PATTERNS.DECIMAL),
  
  // Common field combinations
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10)
  }),
  
  sorting: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),
  
  search: z.object({
    query: z.string().min(1).max(100).optional(),
    filters: z.record(z.string()).optional()
  })
} as const

/**
 * Validation result interface
 */
export interface ValidationResult<T = unknown> {
  success: boolean
  data?: T
  errors: string[]
  fieldErrors?: Record<string, string[]>
}

/**
 * Safe validation wrapper
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data)
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        errors: []
      }
    } else {
      return {
        success: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
        fieldErrors: result.error.errors.reduce((acc, err) => {
          const path = err.path.join('.')
          if (!acc[path]) acc[path] = []
          acc[path].push(err.message)
          return acc
        }, {} as Record<string, string[]>)
      }
    }
  } catch (error) {
    return {
      success: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION_PATTERNS.EMAIL.test(email)
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return VALIDATION_PATTERNS.URL.test(url)
  } catch {
    return false
  }
}

/**
 * Validate UUID format
 */
export function isValidUuid(uuid: string): boolean {
  return VALIDATION_PATTERNS.UUID.test(uuid)
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  return VALIDATION_PATTERNS.PHONE.test(phone)
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDate(date: string): boolean {
  if (!VALIDATION_PATTERNS.DATE.test(date)) return false
  
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime()) && parsedDate.toISOString().split('T')[0] === date
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, options: {
  maxLength?: number
  trim?: boolean
  removeHtml?: boolean
} = {}): string {
  let sanitized = input

  if (options.trim !== false) {
    sanitized = sanitized.trim()
  }

  if (options.removeHtml) {
    // Basic HTML tag removal
    sanitized = sanitized.replace(/<[^>]*>/g, '')
  }

  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength)
  }

  return sanitized
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long')
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter')
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number')
  } else {
    score += 1
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character')
  } else {
    score += 1
  }

  return {
    isValid: score >= 4,
    score,
    feedback
  }
}

/**
 * Type guards for validation
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Common validation error messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE: 'Please enter a valid date (YYYY-MM-DD)',
  INVALID_UUID: 'Please enter a valid UUID',
  TOO_SHORT: 'This field is too short',
  TOO_LONG: 'This field is too long',
  INVALID_FORMAT: 'This field has an invalid format',
  PASSWORD_WEAK: 'Password is too weak',
  USERNAME_TAKEN: 'This username is already taken',
  EMAIL_TAKEN: 'This email is already registered'
} as const
