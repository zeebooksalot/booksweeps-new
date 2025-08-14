'use client'

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { UserProfile, UserSettings, AuthContextType } from "@/types/auth"
import { ResourceError } from "@/components/ui/resource-error"
import { useRouter } from "next/navigation"
import { createAuthDebugLogger, debugStorageClearing, debugNavigation } from "@/lib/debug-utils"
import { User } from "@supabase/supabase-js"
import { AuthError } from "@/lib/auth-utils"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionEstablished, setSessionEstablished] = useState(false)
  const router = useRouter()

  // Use refs to maintain state across re-renders
  const isInitializedRef = useRef(false)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  // Use the new debug utilities
  const debug = createAuthDebugLogger('AuthProvider')

  // Create user profile
  const createUserProfile = useCallback(async (userId: string, email: string) => {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          user_type: 'reader',
          favorite_genres: [],
          reading_preferences: {
            email_notifications: true,
            marketing_emails: true,
            giveaway_reminders: true,
            weekly_reports: false,
            theme: 'auto',
            language: 'en',
            timezone: 'UTC',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Error creating user profile:', error)
        // Don't throw - profile creation is not critical for login
      }
    } catch (err) {
      console.error('Error creating user profile:', err)
      // Don't throw - profile creation is not critical for login
    }
  }, [])

  // Create user settings
  const createUserSettings = useCallback(async (userId: string) => {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }
    try {
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          theme: 'auto',
          font: 'Inter',
          sidebar_collapsed: false,
          keyboard_shortcuts_enabled: true,
          email_notifications: true,
          marketing_emails: true,
          weekly_reports: false,
          language: 'en',
          timezone: 'UTC',
          usage_analytics: true,
          auto_save_drafts: true,
        })

      if (error) {
        console.error('Error creating user settings:', error)
      }
    } catch (err) {
      console.error('Error creating user settings:', err)
    }
  }, [])

  // Load user profile - moved inside useEffect to avoid dependency issues
  const loadUserProfileInternal = useCallback(async (userId: string) => {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }
    setProfileLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          await createUserProfile(userId, user?.email || '')
          return
        }
        console.error('Error loading user profile:', error)
        return
      }

      setUserProfile(data as UserProfile)
    } catch (err) {
      console.error('Error loading user profile:', err)
    } finally {
      setProfileLoading(false)
    }
  }, [user?.email, createUserProfile])

  // Load user settings - moved inside useEffect to avoid dependency issues
  const loadUserSettingsInternal = useCallback(async (userId: string) => {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Settings don't exist, create them
          await createUserSettings(userId)
          return
        }
        console.error('Error loading user settings:', error)
        return
      }

      setUserSettings(data as UserSettings)
    } catch (err) {
      console.error('Error loading user settings:', err)
    }
  }, [createUserSettings])

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user || !supabase) return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      // Reload profile
      await loadUserProfileInternal(user.id)
    } catch (err) {
      console.error('Error updating profile:', err)
      throw err
    }
  }, [user, loadUserProfileInternal])

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user || !supabase) return
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating settings:', error)
        throw error
      }

      // Reload settings
      await loadUserSettingsInternal(user.id)
    } catch (err) {
      console.error('Error updating settings:', err)
      throw err
    }
  }, [user, loadUserSettingsInternal])

  // Simple sign in
  const signIn = useCallback(async (email: string, password: string) => {
    debug.log('=== SIGN IN PROCESS START ===')
    debug.log('Sign in initiated', {
      email: email ? `${email.substring(0, 3)}***@${email.split('@')[1]}` : 'null',
      passwordLength: password?.length || 0,
      supabaseInitialized: !!supabase,
      currentUser: user?.id,
      sessionEstablished,
      loading,
      profileLoading
    })

    if (!supabase) {
      debug.log('ERROR: Supabase client not initialized')
      debug.log('Environment check:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
        keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...'
      })
      throw new Error('Supabase client not initialized')
    }
    
    try {
      setError(null)
      debug.log('Calling Supabase auth.signInWithPassword...')
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      debug.log('Supabase sign in response received', {
        hasData: !!data,
        hasUser: !!data?.user,
        userId: data?.user?.id,
        userEmail: data?.user?.email,
        emailConfirmed: !!data?.user?.email_confirmed_at,
        hasError: !!signInError,
        errorMessage: signInError?.message,
        errorStatus: signInError?.status,
        errorName: signInError?.name
      })
      
      if (signInError) {
        debug.log('Supabase sign in error details:', {
          message: signInError.message,
          status: signInError.status,
          name: signInError.name
        })
        throw signInError
      }
      
      // Check email verification
      if (!data.user?.email_confirmed_at) {
        debug.log('Email not verified - signing out and throwing error')
        await supabase.auth.signOut()
        throw new Error('Please verify your email before signing in')
      }
      
      debug.log('Sign in successful - waiting for auth state change')
      debug.log('=== SIGN IN PROCESS END ===')
      
      // User is now signed in - the auth state change will handle the rest
    } catch (err) {
      debug.log('Sign in error caught:', {
        errorType: err?.constructor?.name,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        errorStack: err instanceof Error ? err.stack?.substring(0, 200) : 'No stack'
      })
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      throw err
    }
  }, [user, sessionEstablished, loading, profileLoading, debug])

  // Simple sign up
  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    try {
      setError(null)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (signUpError) throw signUpError
      
      // Create user profile if signup was successful
      if (data.user) {
        await createUserProfile(data.user.id, email)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(message)
      throw err
    }
  }, [createUserProfile])

  // Simple sign out
  const signOut = useCallback(async () => {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    try {
      setError(null)
      
      debug.logSignOut(user?.id, undefined, {
        hasUser: !!user,
        userEmail: user?.email,
        sessionEstablished
      })
      
      debug.log('Starting Supabase sign out...')
      
      // Clear local state FIRST to prevent UI issues
      setUser(null)
      setUserProfile(null)
      setUserSettings(null)
      setSessionEstablished(false)
      
      debug.log('Local state cleared')
      
      // Then attempt Supabase sign out with shorter timeout
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign out timeout')), 3000) // Reduced from 5000ms
      )
      
      try {
        const { error } = await Promise.race([signOutPromise, timeoutPromise]) as { error: AuthError | null }
        
        if (error) {
          debug.logSignOutError(error, user?.id)
          debug.log('Supabase sign out failed, but continuing with cleanup')
        } else {
          debug.log('Successfully signed out from Supabase')
        }
      } catch (timeoutError) {
        debug.log('Sign out timed out, continuing with cleanup', { error: timeoutError })
      }
      
      // Force clear any remaining session data
      if (typeof window !== 'undefined') {
        debug.log('Clearing browser storage')
        try {
          debugStorageClearing()
          debug.log('Browser storage cleared successfully')
        } catch (storageError) {
          debug.log('Error clearing browser storage', { error: storageError })
        }
        
        debug.log('Redirecting to homepage using router')
        
        // Use Next.js router for more controlled navigation
        const navigation = debugNavigation('/', 'router')
        try {
          router.push('/')
          navigation.success()
          debug.log('Router navigation initiated successfully')
        } catch (routerError) {
          navigation.failure(routerError)
          debug.log('Router navigation failed, falling back to window.location', {
            error: routerError
          })
          // Fallback to window.location if router fails
          const fallbackNavigation = debugNavigation('/', 'window.location')
          try {
            window.location.replace('/')
            fallbackNavigation.success()
            debug.log('Window location fallback initiated successfully')
          } catch (locationError) {
            fallbackNavigation.failure(locationError)
            debug.log('Both router and window.location failed', { error: locationError })
          }
        }
      }
      
      debug.log('Sign out process completed')
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      setError(message)
      debug.logSignOutError(err, user?.id)
      
      // Ensure redirect happens even if there's an error
      if (typeof window !== 'undefined') {
        debug.log('Forcing redirect after error')
        const navigation = debugNavigation('/', 'router')
        try {
          router.push('/')
          navigation.success()
        } catch (routerError) {
          navigation.failure(routerError)
          debug.log('Router fallback failed, using window.location', { routerError })
          const fallbackNavigation = debugNavigation('/', 'window.location')
          try {
            window.location.replace('/')
            fallbackNavigation.success()
          } catch (locationError) {
            fallbackNavigation.failure(locationError)
          }
        }
      }
    }
  }, [user, sessionEstablished, router, debug])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initialize auth state - FIXED: Removed problematic dependencies
  useEffect(() => {
    debug.log('=== AUTH INITIALIZATION START ===')
    debug.log('Auth initialization triggered', {
      hasSupabase: !!supabase,
      currentUser: user?.id,
      loading,
      sessionEstablished,
      isInitialized: isInitializedRef.current
    })

    if (!supabase) {
      debug.log('ERROR: Supabase client not initialized during auth init')
      setLoading(false)
      return
    }

    // Check if already initialized
    if (isInitializedRef.current) {
      debug.log('Auth already initialized, skipping')
      return
    }

    const initializeAuth = async () => {
      if (!supabase) {
        debug.log('ERROR: Supabase client not initialized in initializeAuth')
        setLoading(false)
        return
      }
      
      try {
        debug.log('Getting initial session...')
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        
        debug.log('Initial session result:', {
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
          currentTime: new Date().toISOString()
        })
        
        setUser(session?.user ?? null)
        setSessionEstablished(!!session?.user)
        
        // Load profile and settings if user exists
        if (session?.user) {
          debug.log('Loading profile and settings for existing session...')
          await Promise.all([
            loadUserProfileInternal(session.user.id),
            loadUserSettingsInternal(session.user.id)
          ])
        }
      } catch (err) {
        debug.log('Error initializing auth:', {
          errorType: err?.constructor?.name,
          errorMessage: err instanceof Error ? err.message : 'Unknown error'
        })
      } finally {
        setLoading(false)
        debug.log('Auth initialization completed')
      }
    }

    // Listen for auth changes
    debug.log('Setting up auth state change listener...')
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        debug.log('=== AUTH STATE CHANGE ===')
        debug.log('Auth state change event:', {
          event,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          hasSession: !!session,
          sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
          currentTime: new Date().toISOString(),
          previousUser: user?.id,
          previousSessionEstablished: sessionEstablished
        })
        
        setUser(session?.user ?? null)
        setSessionEstablished(!!session?.user)
        
        if (session?.user) {
          debug.log('Loading profile and settings for user:', session.user.id)
          try {
            await Promise.all([
              loadUserProfileInternal(session.user.id),
              loadUserSettingsInternal(session.user.id)
            ])
            debug.log('Profile and settings loaded successfully')
          } catch (error) {
            debug.log('Error loading profile/settings:', {
              errorType: error?.constructor?.name,
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        } else {
          debug.log('Clearing profile and settings - no session')
          setUserProfile(null)
          setUserSettings(null)
        }
        
        setLoading(false)
        debug.log('Auth state change processing completed')
      }
    )

    subscriptionRef.current = authSubscription
    isInitializedRef.current = true

    // Initialize auth after setting up the listener
    initializeAuth()

    return () => {
      debug.log('Cleaning up auth state change listener')
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
      isInitializedRef.current = false
    }
  }, [debug]) // FIXED: Only depend on debug, not the load functions

  const contextValue: AuthContextType = {
    user,
    userProfile,
    userSettings,
    userType: userProfile?.user_type || null,
    loading,
    profileLoading,
    error,
    sessionEstablished,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateSettings,
    refreshUserProfile: () => user ? loadUserProfileInternal(user.id) : Promise.resolve(),
    loadUserProfile: () => user ? loadUserProfileInternal(user.id) : Promise.resolve(),
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {error && <ResourceError error={error} onRetry={clearError} />}
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
