'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Extended user profile interface
export interface UserProfile {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  display_name?: string | null
  user_type: 'reader' | 'author' | 'both'
  auth_source?: string | null
  avatar_url?: string | null
  favorite_genres: string[]
  reading_preferences: {
    email_notifications: boolean
    marketing_emails: boolean
    giveaway_reminders: boolean
    weekly_reports: boolean
    theme: 'light' | 'dark' | 'auto'
    language: string
    timezone: string
  }
  created_at: string
  updated_at: string
}

// User settings interface
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  font: string
  sidebar_collapsed: boolean
  keyboard_shortcuts_enabled: boolean
  email_notifications: boolean
  marketing_emails: boolean
  weekly_reports: boolean
  language: string
  timezone: string
  usage_analytics: boolean
  auto_save_drafts: boolean
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  userSettings: UserSettings | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default user settings
const defaultUserSettings: UserSettings = {
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
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
        console.error('Error fetching user profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Error fetching user profile:', error)
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
        console.error('Error fetching user settings:', error)
        return defaultUserSettings
      }

      return data as UserSettings
    } catch (error) {
      console.error('Error fetching user settings:', error)
      return defaultUserSettings
    }
  }, [])

  // Create user profile in database
  const createUserProfile = useCallback(async (userId: string, userData?: Partial<UserProfile>) => {
    if (!supabase) return

    try {
      const profileData = {
        id: userId,
        email: user?.email || '',
        user_type: 'reader',
        favorite_genres: [],
        reading_preferences: {
          email_notifications: true,
          marketing_emails: true,
          giveaway_reminders: true,
          weekly_reports: false,
          theme: 'auto' as const,
          language: 'en',
          timezone: 'UTC',
        },
        ...userData,
      }

      const { error: profileError } = await supabase
        .from('users')
        .insert(profileData)

      if (profileError) {
        console.error('Error creating user profile:', profileError)
      }

      // Create default user settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          ...defaultUserSettings,
        })

      if (settingsError) {
        console.error('Error creating user settings:', settingsError)
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }, [user])

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user || !supabase) return

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        console.error('Error updating user profile:', error)
        throw error
      }

      // Refresh user profile
      await refreshUserProfile()
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }, [user])

  // Update user settings
  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user || !supabase) return

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating user settings:', error)
        throw error
      }

      // Update local state
      setUserSettings(prev => prev ? { ...prev, ...updates } : null)
    } catch (error) {
      console.error('Error updating user settings:', error)
      throw error
    }
  }, [user])

  // Refresh user profile
  const refreshUserProfile = useCallback(async () => {
    if (!user) return

    const profile = await fetchUserProfile(user.id)
    const settings = await fetchUserSettings(user.id)

    setUserProfile(profile)
    setUserSettings(settings)
  }, [user, fetchUserProfile, fetchUserSettings])

  useEffect(() => {
    // Get initial session
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

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not initialized')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error

    // Enforce email verification
    if (!data.user?.email_confirmed_at) {
      await supabase.auth.signOut()
      throw new Error('Please verify your email address before signing in.')
    }
  }

  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    if (!supabase) throw new Error('Supabase client not initialized')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) throw error

    // Create user profile if signup was successful
    if (data.user) {
      await createUserProfile(data.user.id, userData)
    }
  }

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase client not initialized')
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      userSettings, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      updateProfile, 
      updateSettings, 
      refreshUserProfile 
    }}>
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
