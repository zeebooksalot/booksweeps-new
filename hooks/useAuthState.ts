'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserProfile, UserSettings } from '@/types/auth'
import { DEFAULT_USER_SETTINGS } from '@/constants/auth'
import { handleAuthError } from '@/lib/auth-utils'

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!supabase) return null

    try {
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
    } catch (error) {
      const authError = handleAuthError(error, 'fetching user profile')
      console.error(authError.message)
      return null
    }
  }, [])

  // Fetch user settings
  const fetchUserSettings = useCallback(async (userId: string) => {
    if (!supabase) return null

    try {
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
    } catch (error) {
      const authError = handleAuthError(error, 'fetching user settings')
      console.error(authError.message)
      return DEFAULT_USER_SETTINGS
    }
  }, [])

  // Refresh user profile
  const refreshUserProfile = useCallback(async () => {
    if (!user) return

    const profile = await fetchUserProfile(user.id)
    const settings = await fetchUserSettings(user.id)

    setUserProfile(profile)
    setUserSettings(settings)
  }, [user, fetchUserProfile, fetchUserSettings])

  // Initialize auth state
  useEffect(() => {
    const getSession = async () => {
      if (!supabase) return
      
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await refreshUserProfile()
      }
      
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    if (!supabase) return
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
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
    setUser,
    setUserProfile,
    setUserSettings,
    refreshUserProfile,
  }
}
