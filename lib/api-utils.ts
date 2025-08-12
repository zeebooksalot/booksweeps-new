import { NextRequest, NextResponse } from 'next/server'
import { supabase } from './supabase'
import { PaginationState } from '@/types'

// Check if Supabase client is available
export function checkSupabaseConnection() {
  if (!supabase) {
    return {
      error: NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }
  }
  return { supabase }
}

// Create standardized API response
export function createApiResponse<T>(
  data: T, 
  page: number, 
  limit: number, 
  total: number
) {
  const pagination: PaginationState = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }

  return NextResponse.json({
    data,
    pagination
  })
}

// Create error response
export function createErrorResponse(
  error: unknown, 
  status: number = 500,
  defaultMessage: string = 'Internal server error'
) {
  const message = error instanceof Error ? error.message : defaultMessage
  return NextResponse.json({ error: message }, { status })
}

// Parse common query parameters
export function parseQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    genre: searchParams.get('genre'),
    search: searchParams.get('search'),
    user_id: searchParams.get('user_id'),
    sortBy: searchParams.get('sortBy') || 'created_at',
    status: searchParams.get('status'),
    featured: searchParams.get('featured') === 'true'
  }
}

// Apply common filters to Supabase query
export function applyCommonFilters(
  query: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  filters: {
    genre?: string | null
    search?: string | null
    user_id?: string | null
    status?: string | null
  }
) {
  if (filters.genre) {
    query = query.eq('genre', filters.genre)
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id)
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  return query
}

// Apply sorting to Supabase query
export function applySorting(query: any, sortBy: string) { // eslint-disable-line @typescript-eslint/no-explicit-any
  switch (sortBy) {
    case 'upvotes':
      return query.order('upvotes_count', { ascending: false })
    case 'trending':
      return query.order('upvotes_count', { ascending: false })
        .order('created_at', { ascending: false })
    case 'newest':
    default:
      return query.order('created_at', { ascending: false })
  }
}

// Apply pagination to Supabase query
export function applyPagination(query: any, page: number, limit: number) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const offset = (page - 1) * limit
  return query.range(offset, offset + limit - 1)
}

// Validate request body
export function validateRequestBody<T>(body: unknown, schema: any): T { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    return schema.parse(body)
  } catch {
    throw new Error('Invalid request body')
  }
}

// Handle database errors
export function handleDatabaseError(error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  console.error('Database error:', error)
  return createErrorResponse(error, 500, 'Database operation failed')
}

// Create success response
export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ 
    success: true, 
    data 
  }, { status })
}

// Parse and validate request body
export async function parseRequestBody<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json()
  } catch {
    throw new Error('Invalid JSON in request body')
  }
}

// Check if user is authenticated
export async function checkAuthentication(_request: NextRequest) {
  // This would typically check for valid JWT or session
  // For now, we'll assume authentication is handled by middleware
  return true
}

// Rate limiting helper
export function createRateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    { 
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(retryAfter / 1000)
    },
    { 
      status: 429,
      headers: {
        'Retry-After': Math.ceil(retryAfter / 1000).toString()
      }
    }
  )
}
