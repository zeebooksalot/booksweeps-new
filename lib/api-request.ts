import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getClientIP } from '@/lib/client-ip'
import { badRequestError, validationError } from '@/lib/api-response'

export interface ParsedQuery {
  page: number
  limit: number
  search?: string
  genre?: string
  user_id?: string
  status?: string
  sortBy?: string
  featured?: boolean
  [key: string]: string | number | boolean | undefined
}

export interface ClientMetadata {
  ip: string
  userAgent: string | null
  userId?: string
}

// Parse and validate request body with optional Zod schema
export async function parseBody<T>(
  req: NextRequest, 
  schema?: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json()
    
    if (schema) {
      const result = schema.safeParse(body)
      if (!result.success) {
        const errors = result.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        )
        throw new Error(`Validation failed: ${errors.join(', ')}`)
      }
      return result.data
    }
    
    return body as T
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      throw error
    }
    throw new Error('Invalid JSON in request body')
  }
}

// Parse query parameters with type conversion
export function parseQuery(req: NextRequest): ParsedQuery {
  const { searchParams } = new URL(req.url)
  
  const query: ParsedQuery = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    search: searchParams.get('search') || undefined,
    genre: searchParams.get('genre') || undefined,
    user_id: searchParams.get('user_id') || undefined,
    status: searchParams.get('status') || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    featured: searchParams.get('featured') === 'true'
  }

  // Add any additional query parameters
  for (const [key, value] of searchParams.entries()) {
    if (!(key in query)) {
      query[key] = value
    }
  }

  return query
}

// Extract client metadata from request
export function getClientMetadata(req: NextRequest, userId?: string): ClientMetadata {
  return {
    ip: getClientIP(req),
    userAgent: req.headers.get('user-agent'),
    userId
  }
}

// Validate pagination parameters
export function validatePagination(page: number, limit: number) {
  const validPage = Math.max(1, page)
  const validLimit = Math.min(Math.max(1, limit), 100) // Max 100 items per page
  return { page: validPage, limit: validLimit }
}

// Parse and validate query parameters with schema
export function parseQueryWithSchema<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): T {
  const query = parseQuery(req)
  
  const result = schema.safeParse(query)
  if (!result.success) {
    const errors = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    )
    throw new Error(`Query validation failed: ${errors.join(', ')}`)
  }
  
  return result.data
}

// Extract specific query parameter with validation
export function getQueryParam(
  req: NextRequest, 
  key: string, 
  defaultValue?: string
): string | undefined {
  const { searchParams } = new URL(req.url)
  return searchParams.get(key) || defaultValue
}

// Extract numeric query parameter with validation
export function getNumericQueryParam(
  req: NextRequest, 
  key: string, 
  defaultValue?: number
): number | undefined {
  const { searchParams } = new URL(req.url)
  const value = searchParams.get(key)
  if (!value) return defaultValue
  
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

// Extract boolean query parameter
export function getBooleanQueryParam(
  req: NextRequest, 
  key: string, 
  defaultValue?: boolean
): boolean | undefined {
  const { searchParams } = new URL(req.url)
  const value = searchParams.get(key)
  if (!value) return defaultValue
  
  return value.toLowerCase() === 'true'
}

// Validate required fields in request body
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => 
    !(field in body) || body[field] === null || body[field] === undefined
  )
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }
}

// Sanitize string input
export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }
  
  const sanitized = input.trim().substring(0, maxLength)
  
  if (sanitized.length === 0) {
    throw new Error('Input cannot be empty')
  }
  
  return sanitized
}

// Validate email format
export function validateEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format')
  }
  return email.toLowerCase().trim()
}

// Validate UUID format
export function validateUUID(uuid: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    throw new Error('Invalid UUID format')
  }
  return uuid
}
