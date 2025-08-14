import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { generateCsrfToken } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    // Get user session (but don't require it)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // If no session, generate a temporary token for unauthenticated users
    if (sessionError || !session) {
      // Generate a temporary CSRF token for unauthenticated users
      const tempToken = generateCsrfToken('anonymous')
      
      return NextResponse.json({
        token: tempToken,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        temporary: true
      })
    }

    // Generate CSRF token for the authenticated user
    const token = generateCsrfToken(session.user.id)

    return NextResponse.json({
      token,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      temporary: false
    })
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}
