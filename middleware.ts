import { NextRequest, NextResponse } from 'next/server'
import { createNextSecurityMiddleware } from '@/lib/security-middleware'

// Create security middleware
const securityMiddleware = createNextSecurityMiddleware({
  enableCors: true,
  enableRateLimit: true,
  enableSecurityHeaders: true,
  enableInputSanitization: true
})

export function middleware(request: NextRequest) {
  // Apply security middleware
  const response = securityMiddleware(request)
  
  // Additional security checks
  const url = new URL(request.url)
  
  // Block access to sensitive files
  if (url.pathname.startsWith('/.env') || 
      url.pathname.startsWith('/.git') ||
      url.pathname.startsWith('/node_modules') ||
      url.pathname.includes('..')) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  
  // Add security headers for static files
  if (url.pathname.startsWith('/_next/static/') || 
      url.pathname.startsWith('/favicon.ico') ||
      url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }
  
  // Add security headers for API routes
  if (url.pathname.startsWith('/api/')) {
    response.headers.set('X-API-Version', '1.0')
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }
  
  return response
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}