'use client'

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { UserProfile, UserSettings, AuthContextType } from "@/types/auth"
import { ResourceError } from "@/components/ui/resource-error"
import { useRouter } from "next/navigation"
import { createAuthDebugLogger, debugStorageClearing, debugNavigation } from "@/lib/debug-utils"
import { User } from "@supabase/supabase-js"

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

  // Load user profile
  const loadUserProfile = useCallback(async (userId: string) => {
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

  // Load user settings
  const loadUserSettings = useCallback(async (userId: string) => {
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
      await loadUserProfile(user.id)
    } catch (err) {
      console.error('Error updating profile:', err)
      throw err
    }
  }, [user, loadUserProfile])

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
      await loadUserSettings(user.id)
    } catch (err) {
      console.error('Error updating settings:', err)
      throw err
    }
  }, [user, loadUserSettings])

  // Simple sign in
  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    try {
      setError(null)
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) {
        console.error('Supabase sign in error details:', {
          message: signInError.message,
          status: signInError.status,
          name: signInError.name
        })
        throw signInError
      }
      
      // Check email verification
      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut()
        throw new Error('Please verify your email before signing in')
      }
      
      // User is now signed in - the auth state change will handle the rest
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      throw err
    }
  }, [])

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
      
      // Sign out from Supabase FIRST (before clearing local state)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        debug.logSignOutError(error, user?.id)
        debug.log('Supabase sign out failed, but continuing with local cleanup')
        // Don't throw error, just log it since we've already cleared local state
      } else {
        debug.log('Successfully signed out from Supabase')
      }
      
      // Clear local state AFTER Supabase sign out
      setUser(null)
      setUserProfile(null)
      setUserSettings(null)
      setSessionEstablished(false)
      
      debug.log('Local state cleared')
      
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
        return // Exit early since we're redirecting
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

  // Initialize auth state
  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client not initialized')
      setLoading(false)
      return
    }

    const initializeAuth = async () => {
      if (!supabase) {
        console.error('Supabase client not initialized')
        setLoading(false)
        return
      }
      
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        setSessionEstablished(!!session?.user)
        
        // Load profile and settings if user exists
        if (session?.user) {
          await Promise.all([
            loadUserProfile(session.user.id),
            loadUserSettings(session.user.id)
          ])
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id, 'Session exists:', !!session)
        
        setUser(session?.user ?? null)
        setSessionEstablished(!!session?.user)
        
        if (session?.user) {
          console.log('Loading profile and settings for user:', session.user.id)
          await Promise.all([
            loadUserProfile(session.user.id),
            loadUserSettings(session.user.id)
          ])
        } else {
          console.log('Clearing profile and settings - no session')
          setUserProfile(null)
          setUserSettings(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [loadUserProfile, loadUserSettings])

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
    refreshUserProfile: () => user ? loadUserProfile(user.id) : Promise.resolve(),
    loadUserProfile: () => user ? loadUserProfile(user.id) : Promise.resolve(),
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
