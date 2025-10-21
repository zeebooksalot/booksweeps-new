import { z } from 'zod'

// XSS Protection - HTML sanitization (client-side only)
export function sanitizeHtml(html: string): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // In server/edge environment, use basic sanitization
    return sanitizeText(html)
  }
  
  // In browser environment, use DOMPurify
  try {
    const DOMPurify = require('isomorphic-dompurify')
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    })
  } catch (error) {
    // Fallback to basic sanitization if DOMPurify fails
    return sanitizeText(html)
  }
}

// XSS Protection - Text sanitization (remove HTML tags)
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

// SQL Injection Protection - Escape special characters
export function sanitizeSql(input: string): string {
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment starts
    .replace(/\*\//g, '') // Remove block comment ends
    .replace(/xp_/gi, '') // Remove xp_ functions
    .replace(/sp_/gi, '') // Remove sp_ functions
}

// Path Traversal Protection
export function sanitizePath(path: string): string {
  return path
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/\/\//g, '/') // Remove double slashes
    .replace(/[^a-zA-Z0-9._/-]/g, '') // Remove dangerous characters
    .replace(/^\/+/, '/') // Ensure single leading slash
}

// Email sanitization
export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-zA-Z0-9@._-]/g, '') // Remove invalid characters
    .substring(0, 254) // Limit length
}

// Phone number sanitization
export function sanitizePhone(phone: string): string {
  return phone
    .replace(/[^0-9+()-]/g, '') // Keep only valid phone characters
    .substring(0, 20) // Limit length
}

// URL sanitization
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol')
    }
    
    // Remove dangerous characters from pathname
    parsed.pathname = sanitizePath(parsed.pathname)
    
    return parsed.toString()
  } catch {
    return ''
  }
}

// Comprehensive input sanitization
export interface SanitizationOptions {
  maxLength?: number
  allowHtml?: boolean
  allowedTags?: string[]
  stripHtml?: boolean
  trim?: boolean
  toLowerCase?: boolean
}

export function sanitizeInput(
  input: string, 
  options: SanitizationOptions = {}
): string {
  const {
    maxLength = 1000,
    allowHtml = false,
    allowedTags = [],
    stripHtml = true,
    trim = true,
    toLowerCase = false
  } = options

  let sanitized = input

  // Trim whitespace
  if (trim) {
    sanitized = sanitized.trim()
  }

  // Convert to lowercase
  if (toLowerCase) {
    sanitized = sanitized.toLowerCase()
  }

  // Handle HTML content
  if (stripHtml) {
    sanitized = sanitizeText(sanitized)
  } else if (allowHtml) {
    sanitized = sanitizeHtml(sanitized)
  }

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

// Zod schemas for common input validation
export const CommonSchemas = {
  // Basic text input
  text: z.string()
    .min(1, 'Text is required')
    .max(1000, 'Text is too long')
    .transform(sanitizeText),

  // HTML content (for rich text)
  html: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content is too long')
    .transform(sanitizeHtml),

  // Email validation
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email is too long')
    .transform(sanitizeEmail),

  // Phone number
  phone: z.string()
    .regex(/^[\+]?[0-9\-\(\)\s]+$/, 'Invalid phone number format')
    .max(20, 'Phone number is too long')
    .transform(sanitizePhone),

  // URL validation
  url: z.string()
    .url('Invalid URL format')
    .max(2048, 'URL is too long')
    .transform(sanitizeUrl),

  // File path
  filePath: z.string()
    .min(1, 'Path is required')
    .max(500, 'Path is too long')
    .transform(sanitizePath),

  // UUID validation
  uuid: z.string()
    .uuid('Invalid UUID format'),

  // Slug validation
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format')
    .min(1, 'Slug is required')
    .max(100, 'Slug is too long'),

  // Username validation
  username: z.string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username is too long')
    .transform(sanitizeText),

  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  // Search query
  searchQuery: z.string()
    .min(1, 'Search query is required')
    .max(100, 'Search query is too long')
    .transform(sanitizeText),

  // Comment content
  comment: z.string()
    .min(1, 'Comment is required')
    .max(1000, 'Comment is too long')
    .transform(sanitizeText),

  // Bio/description
  bio: z.string()
    .max(2000, 'Bio is too long')
    .transform(sanitizeText),

  // Title
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long')
    .transform(sanitizeText)
}

// Advanced validation with custom rules
export function createAdvancedValidator<T>(
  schema: z.ZodSchema<T>,
  customRules?: Array<(value: T) => string | null>
) {
  return (data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
    const result = schema.safeParse(data)
    
    if (!result.success) {
      return {
        success: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }

    // Apply custom validation rules
    if (customRules) {
      for (const rule of customRules) {
        const error = rule(result.data)
        if (error) {
          return {
            success: false,
            errors: [error]
          }
        }
      }
    }

    return {
      success: true,
      data: result.data
    }
  }
}

// Rate limiting for input validation
const validationAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function validateWithRateLimit<T>(
  key: string,
  validator: (data: unknown) => { success: boolean; errors?: string[] },
  data: unknown,
  maxAttempts: number = 10,
  windowMs: number = 60000 // 1 minute
): { success: boolean; errors?: string[]; rateLimited?: boolean } {
  const now = Date.now()
  const attempts = validationAttempts.get(key)
  
  if (attempts) {
    // Reset if window has passed
    if (now - attempts.lastAttempt > windowMs) {
      attempts.count = 0
    }
    
    // Check rate limit
    if (attempts.count >= maxAttempts) {
      return {
        success: false,
        rateLimited: true,
        errors: ['Too many validation attempts. Please try again later.']
      }
    }
    
    attempts.count++
    attempts.lastAttempt = now
  } else {
    validationAttempts.set(key, { count: 1, lastAttempt: now })
  }
  
  return validator(data)
}

// Clean up old validation attempts
setInterval(() => {
  const now = Date.now()
  for (const [key, attempts] of validationAttempts.entries()) {
    if (now - attempts.lastAttempt > 300000) { // 5 minutes
      validationAttempts.delete(key)
    }
  }
}, 300000) // Clean up every 5 minutes
