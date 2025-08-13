'use client'

import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types/auth'
import { DEFAULT_READING_PREFERENCES, AUTH_ERROR_MESSAGES } from '@/constants/auth'
import { handleAuthError } from '@/lib/auth-utils'

export function useAuthActions() {
  // Create user profile in database
  const createUserProfile = useCallback(async (userId: string, userData?: Partial<UserProfile>) => {
    if (!supabase) return

    try {
      const profileData = {
        id: userId,
        email: '', // Will be set from user data
        user_type: 'reader',
        favorite_genres: [],
        reading_preferences: DEFAULT_READING_PREFERENCES,
        ...userData,
      }

      const { error: profileError } = await supabase
        .from('users')
        .insert(profileData)

      if (profileError) {
        const authError = handleAuthError(profileError, 'creating user profile')
        console.error(authError.message)
      }

      // Create default user settings
      const { error: settingsError } = await supabase
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

      if (settingsError) {
        const authError = handleAuthError(settingsError, 'creating user settings')
        console.error(authError.message)
      }
    } catch (error) {
      const authError = handleAuthError(error, 'creating user profile')
      console.error(authError.message)
    }
  }, [])

  // Sign in user
  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not initialized')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error

    // Enforce email verification
    if (!data.user?.email_confirmed_at) {
      await supabase.auth.signOut()
      throw new Error(AUTH_ERROR_MESSAGES.emailNotVerified)
    }

    // Optimized session establishment - only refresh if needed
    try {
      // Check if session is already established
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        // Only refresh if session is not established
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          console.warn('Session refresh failed:', refreshError)
          // Don't throw - the session might still be valid
        }
      }
    } catch (refreshError) {
      console.warn('Session establishment error:', refreshError)
      // Continue anyway - the auth state change listener will handle session state
    }
  }, [])

  // Sign up user
  const signUp = useCallback(async (email: string, password: string, userData?: Partial<UserProfile>) => {
    if (!supabase) throw new Error('Supabase client not initialized')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) throw error

    // Create user profile if signup was successful
    if (data.user) {
      await createUserProfile(data.user.id, { ...userData, email })
    }
  }, [createUserProfile])

  // Sign out user
  const signOut = useCallback(async () => {
    if (!supabase) throw new Error('Supabase client not initialized')
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  return {
    signIn,
    signUp,
    signOut,
    createUserProfile,
  }
}
