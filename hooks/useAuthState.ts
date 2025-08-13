'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserProfile, UserSettings } from '@/types/auth'
import { DEFAULT_USER_SETTINGS } from '@/constants/auth'
import { handleAuthError, retryWithBackoff, isResourceExhaustionError } from '@/lib/auth-utils'

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionEstablished, setSessionEstablished] = useState(false)

  // Fetch user profile from database with retry logic
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!supabase) return null

    try {
      return await retryWithBackoff(async () => {
        if (!supabase) return null
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          const authError = handleAuthError(error, 'fetching user profile')
          console.error(authError.message)
          return null
        }

        return data as UserProfile
      })
    } catch (error) {
      const authError = handleAuthError(error, 'fetching user profile')
      console.error(authError.message)
      
      // Set error state for resource exhaustion
      if (isResourceExhaustionError(error)) {
        setError('Unable to load profile due to system resources. Please refresh the page.')
      }
      
      return null
    }
  }, [])

  // Fetch user settings with retry logic
  const fetchUserSettings = useCallback(async (userId: string) => {
    if (!supabase) return DEFAULT_USER_SETTINGS

    try {
      return await retryWithBackoff(async () => {
        if (!supabase) return DEFAULT_USER_SETTINGS
        
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error) {
          const authError = handleAuthError(error, 'fetching user settings')
          console.error(authError.message)
          return DEFAULT_USER_SETTINGS
        }

        return data as UserSettings
      })
    } catch (error) {
      const authError = handleAuthError(error, 'fetching user settings')
      console.error(authError.message)
      
      // Set error state for resource exhaustion
      if (isResourceExhaustionError(error)) {
        setError('Unable to load settings due to system resources. Using default settings.')
      }
      
      return DEFAULT_USER_SETTINGS
    }
  }, [])

  // Refresh user profile with error handling
  const refreshUserProfile = useCallback(async () => {
    if (!user) return

    setError(null) // Clear previous errors
    
    const profile = await fetchUserProfile(user.id)
    const settings = await fetchUserSettings(user.id)

    setUserProfile(profile)
    setUserSettings(settings)
  }, [user, fetchUserProfile, fetchUserSettings])

  // Initialize auth state
  useEffect(() => {
    const getSession = async () => {
      if (!supabase) return
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        // Handle session errors gracefully
        if (sessionError) {
          console.warn('Session error during initialization:', sessionError)
          // Don't set error state for timing-related issues
          const isTimingError = sessionError.message.includes('JWT') || 
                               sessionError.message.includes('session') ||
                               sessionError.message.includes('token')
          
          if (!isTimingError) {
            setError(sessionError.message)
          }
        } else {
          setUser(session?.user ?? null)
          setSessionEstablished(!!session?.user)
          
          if (session?.user) {
            await refreshUserProfile()
          }
        }
      } catch (error) {
        const authError = handleAuthError(error, 'initializing auth state')
        console.error(authError.message)
        
        // Only set error for non-timing issues
        const isTimingError = authError.message.includes('JWT') || 
                             authError.message.includes('session') ||
                             authError.message.includes('token')
        
        if (!isTimingError) {
          setError(authError.message)
        }
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    if (!supabase) return
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        
        // Track performance for login events
        if (event === 'SIGNED_IN' && session?.user) {
          const sessionEstablishTime = performance.now()
          console.log(`Session established for user ${session.user.id} in ${sessionEstablishTime.toFixed(2)}ms`)
        }
        
        setUser(session?.user ?? null)
        setSessionEstablished(!!session?.user)
        setError(null) // Clear errors on auth change
        
        if (session?.user) {
          await refreshUserProfile()
        } else {
          setUserProfile(null)
          setUserSettings(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [refreshUserProfile])

  return {
    user,
    userProfile,
    userSettings,
    loading,
    error,
    sessionEstablished,
    setUser,
    setUserProfile,
    setUserSettings,
    setError,
    refreshUserProfile,
    clearError: () => setError(null),
  }
}
