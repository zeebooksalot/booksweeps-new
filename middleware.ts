import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { shouldRedirectUser, getPlatformHosts } from '@/lib/config'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Handle session errors
    if (sessionError) {
      console.error('Session error in middleware:', sessionError)
      // Redirect to login with error parameter
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('error', 'session_error')
      return NextResponse.redirect(redirectUrl)
    }

    const currentHost = req.nextUrl.hostname

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
      }
    }

    // Handle API routes with authentication
    // Only protect non-auth API routes
    if (req.nextUrl.pathname.startsWith('/api/') && 
        !req.nextUrl.pathname.startsWith('/api/auth/') &&
        !req.nextUrl.pathname.startsWith('/api/reader-magnets/')) {
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    
    // For critical errors, redirect to error page
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
    
    // For page requests, redirect to login with error
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('error', 'middleware_error')
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
