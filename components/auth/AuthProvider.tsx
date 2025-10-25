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
  const [user, setUser] = useState<User | null>(() => {
    // Try to restore user from localStorage on initial render
    if (typeof window !== 'undefined') {
      try {
        const cachedUser = localStorage.getItem('auth_user')
        return cachedUser ? JSON.parse(cachedUser) : null
      } catch {
        return null
      }
    }
    return null
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionEstablished, setSessionEstablished] = useState(() => {
    // Try to restore session state from localStorage
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('auth_session') === 'true'
      } catch {
        return false
      }
    }
    return false
  })
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()

  // Use refs to maintain state across re-renders
  const isInitializedRef = useRef(false)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const mountedRef = useRef(true)

  // Use the new debug utilities
  const debug = useRef(createAuthDebugLogger('AuthProvider')).current

  // Create Supabase client using the SSR-compatible client
  const supabase = createClientComponentClient()

  // Cache auth state to localStorage
  const cacheAuthState = useCallback((user: User | null, sessionEstablished: boolean) => {
    if (typeof window !== 'undefined') {
      try {
        if (user) {
          localStorage.setItem('auth_user', JSON.stringify(user))
          localStorage.setItem('auth_session', 'true')
        } else {
          localStorage.removeItem('auth_user')
          localStorage.setItem('auth_session', 'false')
        }
      } catch (error) {
        debug.log('Error caching auth state:', error)
      }
    }
  }, [debug])

  // Clear cached auth state
  const clearAuthCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_session')
      } catch (error) {
        debug.log('Error clearing auth cache:', error)
      }
    }
  }, [debug])

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
      
      // Clear auth cache
      clearAuthCache()
      
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

  // Hydration guard
  useEffect(() => {
    setIsHydrated(true)
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
        debug.log('Checking for existing session...')
        
        // Check for existing session first
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          debug.log('Error getting session:', error)
        } else if (session?.user) {
          debug.log('Found existing session for user:', session.user.id)
          setUser(session.user)
          setSessionEstablished(true)
          
          // Cache the restored session
          cacheAuthState(session.user, true)
          
          // Load profile and settings in background
          Promise.all([
            loadUserProfileInternal(session.user.id, session.user.email),
            loadUserSettingsInternal(session.user.id)
          ]).catch(error => {
            debug.log('Error loading profile/settings on session restore:', error)
          })
        } else {
          debug.log('No existing session found')
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
        
        const newUser = session?.user ?? null
        const newSessionEstablished = !!session?.user
        
        setUser(newUser)
        setSessionEstablished(newSessionEstablished)
        
        // Cache the auth state
        cacheAuthState(newUser, newSessionEstablished)
        
        // Handle different auth events - make profile loading non-blocking
        if (event === 'SIGNED_IN' && session?.user) {
          // Load profile and settings in background - don't wait for completion
          Promise.all([
            loadUserProfileInternal(session.user.id, session.user.email),
            loadUserSettingsInternal(session.user.id)
          ]).catch(error => {
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
    loading: isHydrated ? loading : true,
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