import { NextRequest, NextResponse } from 'next/server'

export interface SecurityHeadersConfig {
  // Content Security Policy
  csp?: {
    directives: {
      'default-src'?: string[]
      'script-src'?: string[]
      'style-src'?: string[]
      'img-src'?: string[]
      'font-src'?: string[]
      'connect-src'?: string[]
      'frame-src'?: string[]
      'object-src'?: string[]
      'base-uri'?: string[]
      'form-action'?: string[]
      'frame-ancestors'?: string[]
    }
    reportOnly?: boolean
  }
  
  // Other security headers
  hsts?: {
    maxAge: number
    includeSubDomains?: boolean
    preload?: boolean
  }
  
  // CORS configuration
  cors?: {
    origin: string | string[] | boolean
    methods?: string[]
    allowedHeaders?: string[]
    credentials?: boolean
    maxAge?: number
  }
  
  // Additional headers
  additionalHeaders?: Record<string, string>
}

const DEFAULT_CONFIG: SecurityHeadersConfig = {
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Next.js
        "'unsafe-eval'", // Required for Next.js development
        'https://vercel.live',
        'https://va.vercel-scripts.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for styled-components and CSS-in-JS
        'https://fonts.googleapis.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
        'blob:'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'connect-src': [
        "'self'",
        'https://*.supabase.co',
        'https://*.vercel.app',
        'wss://*.supabase.co'
      ],
      'frame-src': [
        "'self'",
        'https://*.supabase.co'
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"]
    },
    reportOnly: false
  },
  
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://booksweeps.com', 'https://www.booksweeps.com']
      : true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-Forwarded-For',
      'X-Real-IP'
    ],
    credentials: true,
    maxAge: 86400 // 24 hours
  },
  
  additionalHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  }
}

export function createSecurityHeaders(config: SecurityHeadersConfig = {}) {
  const mergedConfig = {
    csp: { ...DEFAULT_CONFIG.csp, ...config.csp },
    hsts: { ...DEFAULT_CONFIG.hsts, ...config.hsts },
    cors: { ...DEFAULT_CONFIG.cors, ...config.cors },
    additionalHeaders: { ...DEFAULT_CONFIG.additionalHeaders, ...config.additionalHeaders }
  }

  return function securityHeaders(request: NextRequest) {
    const response = NextResponse.next()
    
    // Set CORS headers
    if (mergedConfig.cors) {
      const { origin, methods, allowedHeaders, credentials, maxAge } = mergedConfig.cors
      
      // Handle multiple origins
      if (Array.isArray(origin)) {
        const requestOrigin = request.headers.get('origin')
        if (requestOrigin && origin.includes(requestOrigin)) {
          response.headers.set('Access-Control-Allow-Origin', requestOrigin)
        }
      } else if (origin === true) {
        const requestOrigin = request.headers.get('origin')
        if (requestOrigin) {
          response.headers.set('Access-Control-Allow-Origin', requestOrigin)
        }
      } else if (typeof origin === 'string') {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }
      
      if (methods) {
        response.headers.set('Access-Control-Allow-Methods', methods.join(', '))
      }
      
      if (allowedHeaders) {
        response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))
      }
      
      if (credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }
      
      if (maxAge) {
        response.headers.set('Access-Control-Max-Age', maxAge.toString())
      }
    }
    
    // Set HSTS header
    if (mergedConfig.hsts) {
      const { maxAge, includeSubDomains, preload } = mergedConfig.hsts
      let hstsValue = `max-age=${maxAge}`
      
      if (includeSubDomains) {
        hstsValue += '; includeSubDomains'
      }
      
      if (preload) {
        hstsValue += '; preload'
      }
      
      response.headers.set('Strict-Transport-Security', hstsValue)
    }
    
    // Set Content Security Policy
    if (mergedConfig.csp && mergedConfig.csp.directives) {
      const { directives, reportOnly } = mergedConfig.csp
      const cspDirectives = Object.entries(directives)
        .map(([key, values]) => {
          if (Array.isArray(values)) {
            return `${key} ${values.join(' ')}`
          }
          return `${key} ${values}`
        })
        .join('; ')
      
      const headerName = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'
      response.headers.set(headerName, cspDirectives)
    }
    
    // Set additional security headers
    Object.entries(mergedConfig.additionalHeaders || {}).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }
}

// Pre-configured security headers for different environments
export const productionSecurityHeaders = createSecurityHeaders({
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Still needed for Next.js
        'https://vercel.live'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'connect-src': [
        "'self'",
        'https://*.supabase.co'
      ],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"]
    }
  }
})

export const developmentSecurityHeaders = createSecurityHeaders({
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'", // Required for Next.js development
        'https://vercel.live',
        'https://va.vercel-scripts.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
        'blob:',
        'http://localhost:*'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'connect-src': [
        "'self'",
        'https://*.supabase.co',
        'wss://*.supabase.co',
        'http://localhost:*',
        'ws://localhost:*'
      ],
      'frame-src': [
        "'self'",
        'https://*.supabase.co'
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"]
    }
  }
})

// Export the appropriate security headers based on environment
export const securityHeaders = process.env.NODE_ENV === 'production' 
  ? productionSecurityHeaders 
  : developmentSecurityHeaders
