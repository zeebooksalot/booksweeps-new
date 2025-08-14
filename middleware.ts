import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { shouldRedirectUser, getPlatformHosts } from '@/lib/config'
import { validateCsrfToken, generateCsrfToken } from '@/lib/csrf'
import { logSecurityEvent, ErrorSeverity, extractErrorContext } from '@/lib/error-handler'

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

  // Generate nonce for CSP
  const nonce = generateNonce()
  
  // Add nonce to response headers for CSP
  res.headers.set('X-CSP-Nonce', nonce)
  
  // Update CSP header with nonce - more permissive in development
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  let cspHeader: string
  if (isDevelopment) {
    // More permissive CSP for development (allows hot reloading, etc.)
    cspHeader = `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://yomnitxefrkuvnbnbhut.supabase.co ws://localhost:* wss://localhost:*; frame-ancestors 'none';`
  } else {
    // Production CSP - allows unsafe-eval and unsafe-inline for Next.js
    cspHeader = `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://yomnitxefrkuvnbnbhut.supabase.co; frame-ancestors 'none';`
  }
  
  res.headers.set('Content-Security-Policy', cspHeader)

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Handle session errors more gracefully
    if (sessionError) {
      console.error('Session error in middleware:', sessionError)
      
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

    // CSRF Protection for state-changing operations
    const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH']
    if (stateChangingMethods.includes(req.method)) {
      // Skip CSRF check for auth endpoints and public endpoints
      const skipCsrfPaths = [
        '/api/auth/',
        '/api/csrf/generate', // CSRF token generation endpoint
        '/api/reader-magnets/downloads',
        '/api/entries',
        '/api/votes'
      ]
      
      const shouldSkipCsrf = skipCsrfPaths.some(path => 
        req.nextUrl.pathname.startsWith(path)
      )
      
      if (!shouldSkipCsrf && session) {
        const csrfToken = req.headers.get('x-csrf-token')
        if (!validateCsrfToken(csrfToken, session.user.id)) {
          console.warn(`CSRF token validation failed for user ${session.user.id}`)
          
          // Log security event
          logSecurityEvent(
            'CSRF token invalid',
            ErrorSeverity.CRITICAL,
            extractErrorContext(req),
            { 
              userId: session.user.id,
              endpoint: req.nextUrl.pathname,
              method: req.method
            }
          )
          
          return NextResponse.json(
            { error: 'CSRF token invalid or missing' }, 
            { status: 403 }
          )
        }
      }
    }

    // Rate limiting check (basic implementation)
    const clientIp = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    req.headers.get('cf-connecting-ip') || 
                    'unknown'
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\.\.\//, // Directory traversal
      /<script/i, // Script injection
      /javascript:/i, // JavaScript protocol
      /data:text\/html/i, // Data URLs
    ]
    
    const requestUrl = req.nextUrl.toString()
    const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(requestUrl))
    
    if (hasSuspiciousPattern) {
      // Log security event
      logSecurityEvent(
        'Suspicious request pattern detected',
        ErrorSeverity.HIGH,
        extractErrorContext(req),
        { 
          suspiciousUrl: requestUrl,
          clientIp,
          userAgent: req.headers.get('user-agent')
        }
      )
      
      return NextResponse.json(
        { error: 'Invalid request' }, 
        { status: 400 }
      )
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
          console.error('Error fetching user type:', userError)
          // Continue without user type validation - don't block the request
          // This prevents blocking dashboard access when database is unavailable
        } else if (userData?.user_type) {
          const userType = userData.user_type

          // Use config utility to determine redirects
          const redirectCheck = shouldRedirectUser(userType, currentHost)
          
          if (redirectCheck.shouldRedirect && redirectCheck.targetUrl) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`Redirecting user ${session.user.id} (${userType}) from ${currentHost} to ${redirectCheck.targetUrl}`)
            }
            return NextResponse.redirect(redirectCheck.targetUrl)
          }
        }
      } catch (error) {
        console.error('Error in user type validation:', error)
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
    
    // Only protect non-auth, non-public API routes
    if (req.nextUrl.pathname.startsWith('/api/') && 
        !req.nextUrl.pathname.startsWith('/api/auth/') &&
        !isPublicApiEndpoint) {
      if (!session) {
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
    console.error('Middleware error:', error)
    
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
