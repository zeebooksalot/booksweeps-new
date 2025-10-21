import { NextResponse } from 'next/server'

// Success response utilities
export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function createdResponse(data: unknown) {
  return NextResponse.json({ data }, { status: 201 })
}

export function paginatedResponse(
  data: unknown, 
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
) {
  return NextResponse.json({
    data,
    pagination
  })
}

// Error response utilities
export function badRequestError(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  )
}

export function unauthorizedError(message = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}

export function forbiddenError(message = 'Forbidden') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  )
}

export function notFoundError(message = 'Resource not found') {
  return NextResponse.json(
    { error: message },
    { status: 404 }
  )
}

export function rateLimitError(retryAfter: number) {
  return NextResponse.json(
    { 
      error: 'Too many requests. Please try again later.',
      retryAfter 
    },
    { 
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString()
      }
    }
  )
}

export function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal server error'
  
  console.error('Server error:', error)
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export function serviceUnavailableError(message = 'Service temporarily unavailable') {
  return NextResponse.json(
    { error: message },
    { status: 503 }
  )
}

// Validation error response
export function validationError(errors: string[]) {
  return NextResponse.json(
    { 
      error: 'Validation failed',
      details: errors 
    },
    { status: 422 }
  )
}

// Conflict error response
export function conflictError(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 409 }
  )
}

// Helper function to create custom error responses
export function createErrorResponse(
  message: string,
  status: number,
  details?: unknown
) {
  const response: any = { error: message }
  if (details) {
    response.details = details
  }
  
  return NextResponse.json(response, { status })
}

// Helper function to create success responses with custom structure
export function createSuccessResponse(
  data: unknown,
  status = 200,
  meta?: Record<string, unknown>
) {
  const response: any = { data }
  if (meta) {
    response.meta = meta
  }
  
  return NextResponse.json(response, { status })
}