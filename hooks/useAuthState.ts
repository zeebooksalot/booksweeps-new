'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserProfile, UserSettings } from '@/types/auth'
import { DEFAULT_USER_SETTINGS } from '@/constants/auth'
import { handleAuthError, retryWithBackoff, isResourceExhaustionError } from '@/lib/auth-utils'

export function useAuthState() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionEstablished, setSessionEstablished] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  // Create Supabase client using the SSR-compatible client
  const supabase = createClientComponentClient()

  // Fetch user profile from database with retry logic
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      return await retryWithBackoff(async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
            console.log('User profile not found, will create one')
            return null
          }
          
          const authError = handleAuthError(error, 'fetching user profile')
          console.error(authError.message)
          throw new Error(authError.message)
        }

        return data as UserProfile
      })
    } catch (error) {
      const authError = handleAuthError(error, 'fetching user profile')
      console.error(authError.message)
      
      if (isResourceExhaustionError(error)) {
        throw new Error('Unable to load profile due to system resources. Please refresh the page.')
      }
      
      throw error
    }
  }, [supabase])

  // Create user profile if it doesn't exist
  const createUserProfile = useCallback(async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
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
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        throw new Error('Failed to create user profile')
      }

      console.log('User profile created successfully')
      return data as UserProfile
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }, [supabase])

  // Fetch user settings with retry logic
  const fetchUserSettings = useCallback(async (userId: string) => {
    try {
      return await retryWithBackoff(async () => {
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
      return DEFAULT_USER_SETTINGS
    }
  }, [supabase])

  // Load user profile and settings (called separately from login)
  const loadUserProfile = useCallback(async () => {
    if (!user) return
    
    setProfileLoading(true)
    setError(null)
    
    try {
      let profile = await fetchUserProfile(user.id)
      
      if (!profile && user.email) {
        console.log('Creating user profile for:', user.email)
        profile = await createUserProfile(user.id, user.email)
      }
      
      if (!profile) {
        console.warn('Could not fetch or create user profile, using defaults')
        profile = {
          id: user.id,
          email: user.email || '',
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
        } as UserProfile
      }
      
      const settings = await fetchUserSettings(user.id)

      setUserProfile(profile)
      setUserSettings(settings)
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Set error state so components can handle it
      const errorMessage = error instanceof Error ? error.message : 'Failed to load user profile'
      setError(errorMessage)
      // Re-throw the error so calling components can catch it
      throw error
    } finally {
      setProfileLoading(false)
    }
  }, [user, fetchUserProfile, fetchUserSettings, createUserProfile])

  // Initialize auth state (SIMPLIFIED - no profile fetching)
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.warn('Session error during initialization:', sessionError)
          const isTimingError = sessionError.message.includes('JWT') || 
                               sessionError.message.includes('session') ||
                               sessionError.message.includes('token')
          
          if (!isTimingError) {
            setError(sessionError.message)
          }
        } else {
          setUser(session?.user ?? null)
          setSessionEstablished(!!session?.user)
          // NO PROFILE FETCHING HERE - simplified login
        }
      } catch (error) {
        const authError = handleAuthError(error, 'initializing auth state')
        console.error(authError.message)
        
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

    // Listen for auth changes (SIMPLIFIED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          const sessionEstablishTime = performance.now()
          console.log(`Session established for user ${session.user.id} in ${sessionEstablishTime.toFixed(2)}ms`)
        }
        
        setUser(session?.user ?? null)
        setSessionEstablished(!!session?.user)
        setError(null)
        
        // Clear profile data on sign out
        if (!session?.user) {
          setUserProfile(null)
          setUserSettings(null)
        }
        // NO PROFILE FETCHING ON SIGN IN - simplified
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return {
    user,
    userProfile,
    userSettings,
    loading,
    profileLoading,
    error,
    sessionEstablished,
    setUser,
    setUserProfile,
    setUserSettings,
    setError,
    loadUserProfile, // New function to load profile separately
    clearError: () => setError(null),
  }
}
