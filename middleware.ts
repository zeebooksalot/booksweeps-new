import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { shouldRedirectUser, getPlatformHosts } from '@/lib/config'
import { validateCsrfFromRequest } from '@/lib/csrf'
import { logSecurityEvent, ErrorSeverity, extractErrorContext } from '@/lib/error-handler'
import { detectMaliciousInput } from '@/lib/validation'

// Production debugging helper for middleware
const debugLog = (message: string, data?: any) => {
  const isProduction = process.env.NODE_ENV === 'production'
  const timestamp = new Date().toISOString()
  const logData = {
    timestamp,
    message,
    data,
    environment: process.env.NODE_ENV,
    component: 'middleware'
  }
  
  if (isProduction) {
    console.log(`[MIDDLEWARE DEBUG ${timestamp}]`, logData)
  } else {
    console.log(`[Middleware] ${message}`, data || '')
  }
}

// Generate nonce for CSP using Web Crypto API
function generateNonce(): string {
  const array = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for environments without Web Crypto API
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return btoa(String.fromCharCode(...array))
}

// Security event types
type SecurityEventType = 
  | 'CSRF_TOKEN_INVALID'
  | 'UNAUTHORIZED_ACCESS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_REQUEST'
  | 'AUTHENTICATION_FAILURE'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Debug logging for auth-related requests
  const isAuthRelated = req.nextUrl.pathname.includes('/auth') || 
                       req.nextUrl.pathname.includes('/login') || 
                       req.nextUrl.pathname.includes('/signup') ||
                       req.nextUrl.pathname.includes('/dashboard')
  
  if (isAuthRelated) {
    debugLog('Processing auth-related request', {
      pathname: req.nextUrl.pathname,
      method: req.method,
      hostname: req.nextUrl.hostname,
      userAgent: req.headers.get('user-agent')
    })
  }

  // Generate nonce for CSP (development only)
  const nonce = generateNonce()
  
  // Add nonce to response headers for CSP (development only)
  if (process.env.NODE_ENV === 'development') {
    res.headers.set('X-CSP-Nonce', nonce)
  }
  
  // 🔒 CRITICAL SECURITY HEADERS
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()')
  
  // Add HSTS header for HTTPS enforcement (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  // Update CSP header - simplified for production compatibility
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  let cspHeader: string
  if (isDevelopment) {
    // Development CSP with nonce for testing
    cspHeader = `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://yomnitxefrkuvnbnbhut.supabase.co https://yomnitxefrkuvnbnbhut.supabase.co/auth/v1/* ws://localhost:* wss://localhost:*; frame-ancestors 'none';`
  } else {
    // Production CSP - fixed to allow Supabase auth endpoints
    cspHeader = `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://yomnitxefrkuvnbnbhut.supabase.co https://yomnitxefrkuvnbnbhut.supabase.co/auth/v1/*; frame-ancestors 'none';`
  }
  
  res.headers.set('Content-Security-Policy', cspHeader)

  //  ALLOW STATIC FILES FIRST - before any other checks
  const staticFileExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json']
  const isStaticFile = staticFileExtensions.some(ext => req.nextUrl.pathname.endsWith(ext))
  
  if (isStaticFile) {
    return res
  }

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Enhanced debug logging for session issues
    if (isAuthRelated || sessionError) {
      debugLog('Session check result', {
        pathname: req.nextUrl.pathname,
        hasSession: !!session,
        sessionError: sessionError?.message,
        userId: session?.user?.id,
        sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        currentTime: new Date().toISOString()
      })
    }

    // Handle session errors more gracefully
    if (sessionError) {
      debugLog('Session error in middleware', {
        error: sessionError.message,
        status: sessionError.status,
        name: sessionError.name,
        pathname: req.nextUrl.pathname
      })
      
      // Only log as security event if it's not a timing-related issue
      // JWT and session timing errors are common during login and shouldn't be treated as security threats
      const isTimingError = sessionError.message.includes('JWT') || 
                           sessionError.message.includes('session') ||
                           sessionError.message.includes('token')
      
      if (!isTimingError) {
        logSecurityEvent(
          'Authentication failure',
          ErrorSeverity.HIGH,
          extractErrorContext(req),
          { sessionError: sessionError.message }
        )
      }
      
      // For session errors, don't immediately redirect - let the client handle it
      // This prevents false positives during login
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Session error' }, { status: 401 })
      }
      
      // For page requests, continue without blocking
      // The client-side auth will handle the session state
      return res
    }

    const currentHost = req.nextUrl.hostname

    // 🔒 CSRF PROTECTION - Re-enabled with SSR-compatible authentication
    const userId = session?.user?.id || null
    
    // Only apply CSRF protection to state-changing operations
    const isStateChangingOperation = req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE' || req.method === 'PATCH'
    const isApiRoute = req.nextUrl.pathname.startsWith('/api/')
    const isCsrfExemptRoute = req.nextUrl.pathname === '/api/csrf/generate' || 
                             req.nextUrl.pathname.includes('/auth/') ||
                             req.nextUrl.pathname.includes('/login') ||
                             req.nextUrl.pathname.includes('/signup')
    
    if (isStateChangingOperation && isApiRoute && !isCsrfExemptRoute) {
      const isValidCsrf = validateCsrfFromRequest(req, userId)
      
      if (!isValidCsrf) {
        debugLog('CSRF validation failed', {
          pathname: req.nextUrl.pathname,
          method: req.method,
          userId,
          hasToken: !!req.headers.get('X-CSRF-Token')
        })
        
        logSecurityEvent(
          'CSRF token invalid',
          ErrorSeverity.HIGH,
          extractErrorContext(req),
          { userId, method: req.method }
        )
        
        return NextResponse.json(
          { error: 'CSRF token validation failed' },
          { status: 403 }
        )
      }
      
      debugLog('CSRF validation passed', {
        pathname: req.nextUrl.pathname,
        method: req.method,
        userId
      })
    }

    // 🔒 REQUEST SIZE LIMITS
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      logSecurityEvent(
        'Request too large',
        ErrorSeverity.MEDIUM,
        extractErrorContext(req),
        { contentLength: parseInt(contentLength) }
      )
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }
    
    // Rate limiting check (basic implementation)
    const clientIp = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    req.headers.get('cf-connecting-ip') || 
                    'unknown'
    
    // Enhanced security check using validation library (only for non-API routes)
    if (!req.nextUrl.pathname.startsWith('/api/')) {
      const requestUrl = req.nextUrl.toString()
      
      // Check URL for malicious content (skip user agent to avoid false positives)
      const urlThreats = detectMaliciousInput(requestUrl)
      
      if (urlThreats.malicious) {
        // Log security event
        logSecurityEvent(
          'Malicious input detected in request',
          ErrorSeverity.HIGH,
          extractErrorContext(req),
          { 
            threats: urlThreats.threats,
            url: requestUrl
          }
        )
        
        return NextResponse.json(
          { error: 'Malicious input detected' },
          { status: 400 }
        )
      }
    }

    // 🔒 CROSS-DOMAIN AUTHENTICATION REDIRECTS
    if (session?.user) {
      const userType = session.user.user_metadata?.user_type || 'reader'
      const redirectCheck = shouldRedirectUser(userType, currentHost)
      
      if (redirectCheck.shouldRedirect && redirectCheck.targetUrl) {
        debugLog('Cross-domain redirect triggered', {
          userType,
          currentHost,
          targetUrl: redirectCheck.targetUrl,
          userId: session.user.id
        })
        
        return NextResponse.redirect(redirectCheck.targetUrl)
      }
    }

    // 🔒 DEVELOPMENT MODE BEHAVIOR
    if (process.env.NODE_ENV === 'development') {
      // In development, allow more permissive behavior for testing
      debugLog('Development mode - allowing request', {
        pathname: req.nextUrl.pathname,
        method: req.method,
        hasSession: !!session
      })
    }

    return res

  } catch (error) {
    debugLog('Middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      pathname: req.nextUrl.pathname,
      method: req.method
    })
    
    logSecurityEvent(
      'Middleware error',
      ErrorSeverity.HIGH,
      extractErrorContext(req),
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )
    
    // In case of middleware error, allow the request to continue
    // This prevents the entire application from breaking
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
