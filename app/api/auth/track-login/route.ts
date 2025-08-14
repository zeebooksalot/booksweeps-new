import { NextRequest, NextResponse } from 'next/server'
import { FailedLoginTracker } from '@/lib/failed-login-tracker'
import { getClientIP } from '@/lib/client-ip'
import { getReferringURL } from '@/lib/referring-url'

export async function POST(request: NextRequest) {
  try {
    const { email, success, loginPageUrl } = await request.json()
    const ipAddress = getClientIP()
    const referringUrl = getReferringURL()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (success) {
      // Track successful login and clear failed attempts
      await FailedLoginTracker.trackSuccessfulAttempt(email, ipAddress, referringUrl, loginPageUrl)
      return NextResponse.json({ message: 'Login tracked and failed attempts cleared' })
    } else {
      // Track failed attempt
      const result = await FailedLoginTracker.trackFailedAttempt(email, ipAddress, referringUrl, loginPageUrl)
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('Error tracking login attempt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const ipAddress = getClientIP()

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      )
    }

    const result = await FailedLoginTracker.isLoginAllowed(email, ipAddress)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking login status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
