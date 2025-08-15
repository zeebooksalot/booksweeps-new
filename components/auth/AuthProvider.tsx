'use client'

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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

  // Use refs to maintain state across re-renders
  const isInitializedRef = useRef(false)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const mountedRef = useRef(true)

  // Use the new debug utilities
  const debug = useRef(createAuthDebugLogger('AuthProvider')).current

  // Create Supabase client using the SSR-compatible client
  const supabase = createClientComponentClient()

  // Create user profile
  const createUserProfile = useCallback(async (userId: string, email: string) => {
    if (!supabase) return null
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
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
          }
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return null
      }

      return data as UserProfile
    } catch (err) {
      console.error('Error creating user profile:', err)
      return null
    }
  }, [supabase])

  // Create user settings
  const createUserSettings = useCallback(async (userId: string) => {
    if (!supabase) return null
    
    try {
      const { data, error } = await supabase
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
        .select()
        .single()

      if (error) {
        console.error('Error creating user settings:', error)
        return null
      }

      return data as UserSettings
    } catch (err) {
      console.error('Error creating user settings:', err)
      return null
    }
  }, [supabase])

  // Load user profile - accepts email as parameter to avoid dependency issues
  const loadUserProfileInternal = useCallback(async (userId: string, userEmail?: string) => {
    if (!supabase) return
    
    setProfileLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116' && userEmail) {
          // Profile doesn't exist, create it
          const profile = await createUserProfile(userId, userEmail)
          if (profile) {
            setUserProfile(profile)
          }
        } else {
          console.error('Error loading user profile:', error)
        }
        return
      }

      setUserProfile(data as UserProfile)
    } catch (err) {
      console.error('Error loading user profile:', err)
    } finally {
      setProfileLoading(false)
    }
  }, [createUserProfile, supabase])

  // Load user settings
  const loadUserSettingsInternal = useCallback(async (userId: string) => {
    if (!supabase) return
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Settings don't exist, create them
          const settings = await createUserSettings(userId)
          if (settings) {
            setUserSettings(settings)
          }
        } else {
          console.error('Error loading user settings:', error)
        }
        return
      }

      setUserSettings(data as UserSettings)
    } catch (err) {
      console.error('Error loading user settings:', err)
    }
  }, [createUserSettings, supabase])

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

      if (error) throw error

      // Reload profile with email
      await loadUserProfileInternal(user.id, user.email || '')
    } catch (err) {
      console.error('Error updating profile:', err)
      throw err
    }
  }, [user, loadUserProfileInternal, supabase])

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user || !supabase) return
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)

      if (error) throw error

      // Reload settings
      await loadUserSettingsInternal(user.id)
    } catch (err) {
      console.error('Error updating settings:', err)
      throw err
    }
  }, [user, loadUserSettingsInternal, supabase])

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    debug.log('=== SIGN IN PROCESS START ===')
    
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    try {
      setError(null)
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) throw signInError
      
      // Check email verification
      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut()
        throw new Error('Please verify your email before signing in')
      }
      
      debug.log('Sign in successful')
      // Auth state change listener will handle the rest
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      throw err
    }
  }, [debug, supabase])

  // Sign up
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
  }, [createUserProfile, supabase])

  // Sign out
  const signOut = useCallback(async () => {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    try {
      setError(null)
      
      debug.logSignOut(user?.id, undefined, {
        hasUser: !!user,
        hasProfile: !!userProfile
      })
      
      // Clear state first
      setUser(null)
      setUserProfile(null)
      setUserSettings(null)
      setSessionEstablished(false)
      
      // Clear storage
      debugStorageClearing()
      
      // Sign out from Supabase
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      
      // Navigate to home
      router.push('/')
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      setError(message)
      
      // Ensure redirect happens even if there's an error
      router.push('/')
    }
  }, [user, userProfile, router, debug, supabase])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initialize auth state - Only runs once on mount
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current) {
      return
    }
    isInitializedRef.current = true
    mountedRef.current = true

    debug.log('=== AUTH INITIALIZATION START ===')

    if (!supabase) {
      debug.log('ERROR: Supabase client not initialized')
      setLoading(false)
      return
    }

    const initializeAuth = async () => {
      try {
        debug.log('Getting initial session...')
        
        // Wrap getSession in a timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 5000)
        )
        
        const result = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]).catch(err => {
          debug.log('Session fetch failed or timed out:', err)
          return { data: { session: null }, error: err }
        })
        
        const { data: { session } } = result as { data: { session: { user?: User } | null } }
        
        if (!mountedRef.current) return
        
        debug.log('Initial session result:', {
          hasSession: !!session,
          userId: session?.user?.id
        })
        
        setUser(session?.user ?? null)
        setSessionEstablished(!!session?.user)
        
        // Load profile and settings if user exists
        if (session?.user) {
          debug.log('Loading profile and settings for existing session...')
          
          // Wrap profile loading in timeout too
          const profilePromise = Promise.all([
            loadUserProfileInternal(session.user.id, session.user.email),
            loadUserSettingsInternal(session.user.id)
          ])
          
          const profileTimeout = new Promise<void>((resolve) => 
            setTimeout(() => {
              debug.log('Profile loading timed out, continuing anyway')
              resolve()
            }, 5000)
          )
          
          await Promise.race([profilePromise, profileTimeout])
        }
        
        debug.log('Initial auth setup complete')
      } catch (err) {
        debug.log('Error in auth initialization:', err)
      } finally {
        if (mountedRef.current) {
          setLoading(false)
          debug.log('Auth initialization completed, loading set to false')
        }
      }
    }

    // Set up auth state change listener BEFORE initializing
    debug.log('Setting up auth state change listener...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return
        
        debug.log('Auth state change event:', {
          event,
          userId: session?.user?.id,
          hasSession: !!session
        })
        
        setUser(session?.user ?? null)
        setSessionEstablished(!!session?.user)
        
        // Handle different auth events with timeout protection
        if (event === 'SIGNED_IN' && session?.user) {
          const profilePromise = Promise.all([
            loadUserProfileInternal(session.user.id, session.user.email),
            loadUserSettingsInternal(session.user.id)
          ])
          
          const timeout = new Promise<void>((resolve) => 
            setTimeout(() => {
              debug.log('Profile loading in auth state change timed out')
              resolve()
            }, 5000)
          )
          
          await Promise.race([profilePromise, timeout]).catch(error => {
            debug.log('Error loading profile/settings on sign in:', error)
          })
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null)
          setUserSettings(null)
        }
        
        // Always ensure loading is false after state change
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    )

    subscriptionRef.current = subscription

    // Initialize auth AFTER setting up listener
    initializeAuth()

    // Cleanup function
    return () => {
      mountedRef.current = false
      debug.log('Cleaning up auth state change listener')
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
      isInitializedRef.current = false
    }
  }, []) // Empty dependency array - only run once on mount

  // Stable reference for profile refresh
  const refreshUserProfile = useCallback(() => {
    return user ? loadUserProfileInternal(user.id, user.email || '') : Promise.resolve()
  }, [user, loadUserProfileInternal])

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
    refreshUserProfile,
    loadUserProfile: refreshUserProfile,
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