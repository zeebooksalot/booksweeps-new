'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { AuthorChoiceModal } from '@/components/auth/AuthorChoiceModal'
import { User } from '@supabase/supabase-js'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingUserType, setCheckingUserType] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showAuthorChoice, setShowAuthorChoice] = useState(false)
  const [authorUser, setAuthorUser] = useState<User | null>(null)
  const [loginInProgress, setLoginInProgress] = useState(false)
  
  const { signIn, user, userType, loading: authLoading, sessionEstablished } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  // Handle user type checking after successful login
  useEffect(() => {
    if (user && userType && !authLoading && !showAuthorChoice && loginInProgress && sessionEstablished) {
      setCheckingUserType(true)
      setLoginInProgress(false) // Reset login progress flag
      
      // If user is author type, show choice modal
      if (userType === 'author') {
        setAuthorUser(user)
        setShowAuthorChoice(true)
        setCheckingUserType(false)
        return
      }

      // For reader and both types, proceed normally
      toast({ title: 'Signed in', description: 'Welcome back!' })
      router.push(redirectTo)
      setCheckingUserType(false)
    }
  }, [user, userType, authLoading, showAuthorChoice, loginInProgress, sessionEstablished, toast, router, redirectTo])

  // Fallback timeout for login progress - prevents stuck state
  useEffect(() => {
    if (loginInProgress) {
      const timeout = setTimeout(() => {
        console.warn('Login timeout - resetting progress state')
        setLoginInProgress(false)
        setLoading(false)
      }, 5000) // 5 second timeout as fallback
      
      return () => clearTimeout(timeout)
    }
  }, [loginInProgress])

  // Handle auth errors and provide retry option
  useEffect(() => {
    if (errorMessage && !loading) {
      // Clear error after 5 seconds to prevent stuck state
      const timeout = setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      
      return () => clearTimeout(timeout)
    }
  }, [errorMessage, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent concurrent submissions
    if (loading || authLoading) {
      return
    }
    
    const loginStartTime = performance.now()
    setLoading(true)
    setErrorMessage(null)
    setLoginInProgress(true) // Set flag to indicate login is in progress
    
    // Client-side validation
    if (!email.trim()) {
      setErrorMessage('Email is required')
      setLoading(false)
      setLoginInProgress(false)
      return
    }
    
    if (!password.trim()) {
      setErrorMessage('Password is required')
      setLoading(false)
      setLoginInProgress(false)
      return
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address')
      setLoading(false)
      setLoginInProgress(false)
      return
    }
    
    try {
      // Sign in the user
      await signIn(email.trim(), password)
      
      // No arbitrary delay needed - the auth state change will trigger the redirect
      // The useEffect above will handle the user type checking when the session is established
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        const loginTime = performance.now() - loginStartTime
        console.log(`Login initiated in ${loginTime.toFixed(2)}ms`)
      }
      
    } catch (error) {
      console.error('Login error:', error)
      const message = (error as Error).message || 'Login failed'
      setErrorMessage(message)
      setLoginInProgress(false) // Reset flag on error
      toast({ title: 'Sign in failed', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleAuthorChoiceClose = () => {
    setShowAuthorChoice(false)
    setAuthorUser(null)
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
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200" role="alert" aria-live="polite">{errorMessage}</div>
              )}

              <div className="flex items-center justify-between text-14">
                <Link href="/forgot-password" className="text-orange-600 hover:text-orange-700">Forgot your password?</Link>
              </div>

              <button
                type="submit"
                disabled={loading || authLoading}
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

      {/* Author Choice Modal */}
      {authorUser && (
        <AuthorChoiceModal
          isOpen={showAuthorChoice}
          onClose={handleAuthorChoiceClose}
          user={authorUser}
          redirectTo={redirectTo}
        />
      )}
    </>
  )
}
