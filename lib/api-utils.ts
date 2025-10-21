import { NextRequest } from 'next/server'
import { PaginationState } from '@/types'

// Create standardized API response (legacy - use api-response.ts instead)
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

  return {
    data,
    pagination
  }
}

// Parse common query parameters (legacy - use api-request.ts instead)
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
      return query.order('created_at', { ascending: false })
    case 'oldest':
      return query.order('created_at', { ascending: true })
    case 'title':
      return query.order('title', { ascending: true })
    case 'author':
      return query.order('author', { ascending: true })
    default:
      return query.order('created_at', { ascending: false })
  }
}

// Apply pagination to Supabase query
export async function applyPagination(
  query: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  page: number,
  limit: number
) {
  const start = (page - 1) * limit
  const end = start + limit - 1

  const { data, error, count } = await query.range(start, end)

  return { data, error, count }
}

// Get client IP from request headers (still useful)
export function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         request.headers.get('cf-connecting-ip') || 
         'unknown'
}

// Validate and sanitize input (still useful)
export function validateInput(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input')
  }
  
  const sanitized = input.trim().substring(0, maxLength)
  
  if (sanitized.length === 0) {
    throw new Error('Input cannot be empty')
  }
  
  return sanitized
}

// Check if user has permission to access resource (still useful)
export function checkUserPermission(
  resourceUserId: string,
  currentUserId: string
): boolean {
  return resourceUserId === currentUserId
}

// Format error message for client (still useful)
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Validate pagination parameters (still useful)
export function validatePagination(page: number, limit: number) {
  const validPage = Math.max(1, page)
  const validLimit = Math.min(Math.max(1, limit), 100) // Max 100 items per page
  return { page: validPage, limit: validLimit }
}
