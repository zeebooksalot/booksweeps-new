'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { AuthorChoiceModal } from '@/components/auth/AuthorChoiceModal'
import { useSystemHealth } from '@/hooks/useSystemHealth'
import { AUTH_TIMING } from '@/constants/auth'
import { validateEmail, validatePassword, detectMaliciousInput } from '@/lib/validation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loginInProgress, setLoginInProgress] = useState(false)
  const [checkingUserType, setCheckingUserType] = useState(false)
  const [showAuthorChoice, setShowAuthorChoice] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)
  
  const { signIn, user, userType, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  
  // Use shared system health hook
  const { healthStatus, isHealthy, isUnhealthy } = useSystemHealth()

  // Fix the auth state check to prevent multiple redirects
  useEffect(() => {
    console.log('=== LOGIN PAGE AUTH STATE CHECK ===')
    console.log('Auth state check triggered:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authLoading,
      showAuthorChoice,
      hasRedirected,
      loginInProgress,
      redirectTo
    })

    // Only redirect if user is authenticated, not loading, and login was successful
    if (user && !authLoading && !showAuthorChoice && !hasRedirected && loginInProgress) {
      console.log('Redirect conditions met - initiating redirect')
      // Set flags immediately to prevent multiple redirects
      setHasRedirected(true)
      setLoginInProgress(false)
      setCheckingUserType(true)
      
      console.log('Redirecting to:', redirectTo)
      // Use Next.js router for smooth client-side navigation
      router.push(redirectTo)
    } else {
      console.log('Redirect conditions not met:', {
        hasUser: !!user,
        authLoading,
        showAuthorChoice,
        hasRedirected,
        loginInProgress
      })
    }
  }, [user, authLoading, showAuthorChoice, hasRedirected, loginInProgress, router, redirectTo])

  // Fallback timeout for login progress - using shared timing constant
  useEffect(() => {
    if (loginInProgress) {
      const timeout = setTimeout(() => {
        setLoginInProgress(false)
        setLoading(false)
        setHasRedirected(false) // Reset redirect flag
        
        // Check system health before showing timeout message
        const healthMessage = isUnhealthy 
          ? 'System is currently experiencing issues. Please try again later.'
          : 'Please try again. If the problem persists, contact support.'
        
        toast({ 
          title: 'Login timeout', 
          description: healthMessage, 
          variant: 'destructive' 
        })
      }, AUTH_TIMING.LOGIN_TIMEOUT)
      return () => clearTimeout(timeout)
    }
  }, [loginInProgress, toast, isUnhealthy])

  // Auto-clear errors after timeout - using shared timing constant
  useEffect(() => {
    if (errorMessage && !loading) {
      // Clear error after timeout to prevent stuck state
      const timeout = setTimeout(() => {
        setErrorMessage(null)
      }, AUTH_TIMING.ERROR_AUTO_CLEAR)
      
      return () => clearTimeout(timeout)
    }
  }, [errorMessage, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('=== LOGIN FORM SUBMISSION START ===')
    console.log('Form submission triggered:', {
      email: email ? `${email.substring(0, 3)}***@${email.split('@')[1]}` : 'null',
      passwordLength: password?.length || 0,
      loading,
      authLoading,
      isUnhealthy
    })
    
    // Prevent concurrent submissions
    if (loading || authLoading) {
      console.log('Submission blocked - already loading')
      return
    }
    
    // Check system health before attempting login
    if (isUnhealthy) {
      console.log('Submission blocked - system unhealthy')
      setErrorMessage('System is currently experiencing issues. Please try again later.')
      toast({ 
        title: 'System Unavailable', 
        description: 'Please try again when the system is healthy.', 
        variant: 'destructive' 
      })
      return
    }
    
    setLoading(true)
    setErrorMessage(null)
    setLoginInProgress(true) // Set flag to indicate login is in progress
    setHasRedirected(false) // Reset redirect flag
    
    console.log('Starting input validation...')
    
    // Comprehensive input validation
    const emailValidation = validateEmail(email)
    console.log('Email validation result:', {
      valid: emailValidation.valid,
      errors: emailValidation.errors,
      sanitized: emailValidation.sanitized ? `${emailValidation.sanitized.substring(0, 3)}***@${emailValidation.sanitized.split('@')[1]}` : 'null'
    })
    
    if (!emailValidation.valid) {
      console.log('Email validation failed')
      setErrorMessage(emailValidation.errors[0])
      setLoading(false)
      setLoginInProgress(false)
      return
    }
    
    const passwordValidation = validatePassword(password, email)
    console.log('Password validation result:', {
      valid: passwordValidation.valid,
      errors: passwordValidation.errors,
      strength: passwordValidation.strength,
      score: passwordValidation.score
    })
    
    if (!passwordValidation.valid) {
      console.log('Password validation failed')
      setErrorMessage(passwordValidation.errors[0])
      setLoading(false)
      setLoginInProgress(false)
      return
    }
    
    // Security check for malicious input
    const emailThreats = detectMaliciousInput(email)
    const passwordThreats = detectMaliciousInput(password, true) // Allow special characters in passwords
    
    console.log('Security check results:', {
      emailThreats: emailThreats.malicious,
      passwordThreats: passwordThreats.malicious
    })
    
    if (emailThreats.malicious || passwordThreats.malicious) {
      console.warn('Malicious input detected:', { email: emailThreats.threats, password: passwordThreats.threats })
      setErrorMessage('Invalid input detected. Please check your credentials.')
      setLoading(false)
      setLoginInProgress(false)
      return
    }
    
    try {
      console.log('Calling signIn function...')
      
      // Sign in the user with sanitized input
      await signIn(emailValidation.sanitized!, passwordValidation.sanitized!)
      
      console.log('SignIn function completed successfully')
      // The auth state change will trigger the redirect via useEffect
      
    } catch (error) {
      console.error('Login error:', {
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack?.substring(0, 200) : 'No stack'
      })
      
      let message = 'Login failed'
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Please verify your email address before signing in.'
        } else if (error.message.includes('Too many requests')) {
          message = 'Too many login attempts. Please wait a moment and try again.'
        } else if (error.message.includes('Failed to fetch')) {
          message = 'Network error. Please check your connection and try again.'
        } else {
          message = error.message
        }
      }
      
      setErrorMessage(message)
      setLoginInProgress(false) // Reset flag on error
      toast({ title: 'Sign in failed', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
      console.log('=== LOGIN FORM SUBMISSION END ===')
    }
  }

  const handleAuthorChoiceClose = () => {
    setShowAuthorChoice(false)
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-6 md:p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
              <p className="mt-2 text-14 text-gray-600 dark:text-gray-400">Sign in to continue</p>
            </div>

            {/* System Health Indicator */}
            {isUnhealthy && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  ⚠️ System is currently experiencing issues. Some features may be limited.
                </p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="h-11 w-full rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-orange-500"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {errorMessage && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200" role="alert" aria-live="polite">
                  {errorMessage}
                  <div className="mt-1 text-xs text-red-600">
                    This error will clear automatically in {Math.ceil(AUTH_TIMING.ERROR_AUTO_CLEAR / 1000)} seconds.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-14">
                <Link href="/forgot-password" className="text-orange-600 hover:text-orange-700">Forgot your password?</Link>
              </div>

              <button
                type="submit"
                disabled={loading || authLoading || isUnhealthy}
                className="inline-flex items-center justify-center h-11 w-full rounded-full bg-orange-500 text-white text-14 font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-describedby={errorMessage ? "error-message" : undefined}
              >
                {loading ? 'Signing in...' : (checkingUserType ? 'Checking account...' : 'Sign in')}
              </button>

              <div className="text-center text-14 text-gray-600 dark:text-gray-400">
                <span>Don&apos;t have an account? </span>
                <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-semibold">Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Author Choice Modal - simplified */}
      {showAuthorChoice && user && (
        <AuthorChoiceModal
          isOpen={showAuthorChoice}
          onClose={handleAuthorChoiceClose}
          user={user}
          redirectTo={redirectTo}
        />
      )}
    </>
  )
}
