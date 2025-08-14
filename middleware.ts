import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { shouldRedirectUser, getPlatformHosts } from '@/lib/config'
// Remove CSRF imports since CSRF is disabled
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
    cspHeader = `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://yomnitxefrkuvnbnbhut.supabase.co ws://localhost:* wss://localhost:*; frame-ancestors 'none';`
  } else {
    // Production CSP - simplified without nonce to avoid conflicts with Next.js inline scripts
    cspHeader = `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://yomnitxefrkuvnbnbhut.supabase.co; frame-ancestors 'none';`
  }
  
  res.headers.set('Content-Security-Policy', cspHeader)

  // 🔒 ALLOW STATIC FILES FIRST - before any other checks
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

    // CSRF Protection disabled - removed validation logic
    // Note: CSRF protection has been disabled for this application
    
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
            suspiciousUrl: requestUrl,
            urlThreats: urlThreats.threats,
            clientIp,
            userAgent: req.headers.get('user-agent')
          }
        )
        
        return NextResponse.json(
          { error: 'Invalid request' }, 
          { status: 400 }
        )
      }
    }

    // Protected routes
    const protectedRoutes = ['/dashboard', '/books', '/campaigns']
    const isProtectedRoute = protectedRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    )

    // Auth pages (include update-password for recovery flow)
    const authPages = ['/login', '/signup', '/forgot-password', '/update-password']
    const isAuthPage = authPages.some(page => 
      req.nextUrl.pathname.startsWith(page)
    )

    // Allow update-password even if a session exists (Supabase recovery creates temp session)
    const isUpdatePassword = req.nextUrl.pathname.startsWith('/update-password')

    // Handle authentication for protected routes
    if (isProtectedRoute && !session) {
      debugLog('Unauthorized access to protected route', {
        pathname: req.nextUrl.pathname,
        hasSession: !!session,
        clientIp
      })
      
      // In development, be more permissive and let client-side auth handle it
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Allowing access to protected route without session, letting client handle auth')
        return res
      }
      
      // Log security event
      logSecurityEvent(
        'Unauthorized access attempt',
        ErrorSeverity.MEDIUM,
        extractErrorContext(req),
        { 
          protectedRoute: req.nextUrl.pathname,
          clientIp,
          userAgent: req.headers.get('user-agent')
        }
      )
      
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect authenticated users away from auth pages (except update-password)
    if (session && isAuthPage && !isUpdatePassword) {
      debugLog('Redirecting authenticated user from auth page', {
        pathname: req.nextUrl.pathname,
        userId: session.user.id
      })
      
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    // Handle cross-domain redirects based on user type
    if (session) {
      try {
        // Get user type from database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', session.user.id)
          .single()

        if (userError) {
          debugLog('Error fetching user type', {
            error: userError.message,
            userId: session.user.id,
            pathname: req.nextUrl.pathname
          })
          // Continue without user type validation - don't block the request
          // This prevents blocking dashboard access when database is unavailable
        } else if (userData?.user_type) {
          const userType = userData.user_type

          // Use config utility to determine redirects
          const redirectCheck = shouldRedirectUser(userType, currentHost)
          
          if (redirectCheck.shouldRedirect && redirectCheck.targetUrl) {
            debugLog('Cross-domain redirect', {
              userId: session.user.id,
              userType,
              fromHost: currentHost,
              toUrl: redirectCheck.targetUrl,
              pathname: req.nextUrl.pathname
            })
            
            if (process.env.NODE_ENV === 'development') {
              console.log(`Redirecting user ${session.user.id} (${userType}) from ${currentHost} to ${redirectCheck.targetUrl}`)
            }
            return NextResponse.redirect(redirectCheck.targetUrl)
          }
        }
      } catch (error) {
        debugLog('Error in user type validation', {
          error: error instanceof Error ? error.message : String(error),
          userId: session.user.id,
          pathname: req.nextUrl.pathname
        })
        // Continue without user type validation - don't block the request
        // This ensures dashboard access is not blocked by database issues
      }
    }

    // Handle API routes with authentication
    // Allow public access to read-only endpoints
    const publicApiEndpoints = [
      '/api/books',
      '/api/authors',
      '/api/giveaways',
      '/api/reader-magnets'
    ]

    const isPublicApiEndpoint = publicApiEndpoints.some(endpoint => 
      req.nextUrl.pathname.startsWith(endpoint) && req.method === 'GET'
    )

    // Allow CSRF generation endpoint for all methods (needed for auth)
    const isCsrfEndpoint = req.nextUrl.pathname.startsWith('/api/csrf/generate')

    // Only protect non-auth, non-public API routes
    if (req.nextUrl.pathname.startsWith('/api/') && 
        !req.nextUrl.pathname.startsWith('/api/auth/') &&
        !isPublicApiEndpoint &&
        !isCsrfEndpoint) {
      if (!session) {
        debugLog('Unauthorized API access attempt', {
          endpoint: req.nextUrl.pathname,
          method: req.method,
          clientIp
        })
        
        // Log security event
        logSecurityEvent(
          'Unauthorized API access attempt',
          ErrorSeverity.HIGH,
          extractErrorContext(req),
          { 
            apiEndpoint: req.nextUrl.pathname,
            method: req.method,
            clientIp,
            userAgent: req.headers.get('user-agent')
          }
        )
        
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    return res
  } catch (error) {
    debugLog('Middleware critical error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      pathname: req.nextUrl.pathname
    })
    
    // Only log critical errors, not timing issues
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isTimingError = errorMessage.includes('JWT') || 
                         errorMessage.includes('session') ||
                         errorMessage.includes('token') ||
                         errorMessage.includes('auth')
    
    if (!isTimingError) {
      logSecurityEvent(
        'Middleware critical error',
        ErrorSeverity.CRITICAL,
        extractErrorContext(req),
        { 
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        }
      )
    }
    
    // For critical errors, redirect to error page
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
    
    // For page requests, continue processing for non-critical errors
    // This prevents blocking legitimate requests due to timing issues
    return res
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
