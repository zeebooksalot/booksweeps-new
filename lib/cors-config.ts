import { NextRequest, NextResponse } from 'next/server'

export interface CorsConfig {
  origin: string | string[] | boolean | ((origin: string) => boolean)
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
  preflightContinue?: boolean
  optionsSuccessStatus?: number
}

const DEFAULT_CORS_CONFIG: CorsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://booksweeps.com',
        'https://www.booksweeps.com',
        'https://app.booksweeps.com'
      ]
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://localhost:3000',
        'https://localhost:3001'
      ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'X-Forwarded-For',
    'X-Real-IP',
    'X-API-Key',
    'Accept',
    'Origin',
    'User-Agent'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
}

export function createCorsHandler(config: Partial<CorsConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CORS_CONFIG, ...config }

  return function corsHandler(request: NextRequest) {
    const response = NextResponse.next()
    const origin = request.headers.get('origin')

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const preflightResponse = new NextResponse(null, { status: 200 })
      
      // Set CORS headers for preflight
      setCorsHeaders(preflightResponse, origin, mergedConfig)
      
      return preflightResponse
    }

    // Set CORS headers for actual requests
    setCorsHeaders(response, origin, mergedConfig)
    
    return response
  }
}

function setCorsHeaders(
  response: NextResponse, 
  origin: string | null, 
  config: CorsConfig
) {
  // Handle origin
  if (config.origin === true) {
    // Allow all origins
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
  } else if (typeof config.origin === 'string') {
    // Single origin
    response.headers.set('Access-Control-Allow-Origin', config.origin)
  } else if (Array.isArray(config.origin)) {
    // Multiple origins
    if (origin && config.origin.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
  } else if (typeof config.origin === 'function') {
    // Custom origin function
    if (origin && config.origin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
  }

  // Set other CORS headers
  if (config.methods) {
    response.headers.set('Access-Control-Allow-Methods', config.methods.join(', '))
  }

  if (config.allowedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '))
  }

  if (config.exposedHeaders) {
    response.headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '))
  }

  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  if (config.maxAge) {
    response.headers.set('Access-Control-Max-Age', config.maxAge.toString())
  }

  // Add Vary header to indicate that the response varies by origin
  response.headers.set('Vary', 'Origin')
}

// Pre-configured CORS handlers for different environments
export const productionCors = createCorsHandler({
  origin: [
    'https://booksweeps.com',
    'https://www.booksweeps.com',
    'https://app.booksweeps.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
})

export const developmentCors = createCorsHandler({
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
})

export const apiCors = createCorsHandler({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://booksweeps.com',
        'https://www.booksweeps.com'
      ]
    : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'X-API-Key'
  ],
  credentials: true
})

// Export the appropriate CORS handler based on environment
export const corsHandler = process.env.NODE_ENV === 'production' 
  ? productionCors 
  : developmentCors

// CORS middleware for API routes
export function withCors(
  handler: (req: NextRequest) => Promise<NextResponse>,
  corsConfig?: CorsConfig
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const cors = corsConfig ? createCorsHandler(corsConfig) : corsHandler
    
    // Apply CORS
    const corsResponse = cors(req)
    
    // If it's a preflight request, return the CORS response
    if (req.method === 'OPTIONS') {
      return corsResponse
    }
    
    // Otherwise, execute the handler and merge CORS headers
    const response = await handler(req)
    
    // Copy CORS headers from the CORS response
    corsResponse.headers.forEach((value, key) => {
      if (key.startsWith('Access-Control-')) {
        response.headers.set(key, value)
      }
    })
    
    return response
  }
}
