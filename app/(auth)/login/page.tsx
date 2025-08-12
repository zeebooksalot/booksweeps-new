'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider-refactored'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { AuthorChoiceModal } from '@/components/auth/AuthorChoiceModal'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

// Simple in-memory cache for user types
const userTypeCache = new Map<string, CachedUserType>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CachedUserType {
  userType: string
  timestamp: number
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingUserType, setCheckingUserType] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showAuthorChoice, setShowAuthorChoice] = useState(false)
  const [authorUser, setAuthorUser] = useState<User | null>(null)
  
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  // Function to get user type with caching
  const getUserType = async (userId: string): Promise<string | null> => {
    const now = Date.now()
    const cached = userTypeCache.get(userId) as CachedUserType | undefined
    
    // Return cached value if still valid
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.userType
    }
    
    // Fetch from database
    if (!supabase) {
      console.error('Supabase client not available')
      return null
    }
    
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user type:', error)
      return null
    }

    // Cache the result
    userTypeCache.set(userId, {
      userType: userProfile.user_type,
      timestamp: now
    })
    
    return userProfile.user_type
  }

  // Clear cache when user signs out
  useEffect(() => {
    const clearCache = () => {
      userTypeCache.clear()
    }
    
    // Listen for sign out events
    window.addEventListener('storage', (e) => {
      if (e.key === 'supabase.auth.token' && !e.newValue) {
        clearCache()
      }
    })
    
    // Listen for user type upgrade events
    const handleUserTypeUpgrade = (event: CustomEvent) => {
      const { userId } = event.detail
      userTypeCache.delete(userId)
              if (process.env.NODE_ENV === 'development') {
          console.log('User type cache cleared for user:', userId)
        }
    }
    
    window.addEventListener('userTypeUpgraded', handleUserTypeUpgrade as EventListener)
    
    return () => {
      window.removeEventListener('storage', clearCache)
      window.removeEventListener('userTypeUpgraded', handleUserTypeUpgrade as EventListener)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    
    try {
      // Sign in the user
      await signIn(email, password)
      
      // Wait a moment for AuthProvider to update
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Get the current user to check their type
      if (!supabase) {
        console.error('Supabase client not available')
        toast({ title: 'Signed in', description: 'Welcome back!' })
        router.push(redirectTo)
        return
      }
      
      setCheckingUserType(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check user type with caching
        const userType = await getUserType(user.id)

        if (!userType) {
          // Continue with normal flow if we can't check type
          toast({ title: 'Signed in', description: 'Welcome back!' })
          router.push(redirectTo)
          return
        }

        // If user is author type, show choice modal
        if (userType === 'author') {
          setAuthorUser(user)
          setShowAuthorChoice(true)
          return
        }

        // For reader and both types, proceed normally
        toast({ title: 'Signed in', description: 'Welcome back!' })
        router.push(redirectTo)
      }
      
    } catch (error) {
      console.error('Login error:', error)
      const message = (error as Error).message || 'Login failed'
      setErrorMessage(message)
      toast({ title: 'Sign in failed', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
      setCheckingUserType(false)
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
                disabled={loading}
                className="inline-flex items-center justify-center h-11 w-full rounded-full bg-orange-500 text-white text-14 font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-describedby={errorMessage ? "error-message" : undefined}
              >
                {loading ? (checkingUserType ? 'Checking account...' : 'Signing in...') : 'Sign in'}
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
