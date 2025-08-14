// Auth-related type definitions

import { User } from '@supabase/supabase-js'

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

// Auth context interface
export interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  userSettings: UserSettings | null
  userType: string | null
  loading: boolean
  profileLoading: boolean
  error: string | null
  sessionEstablished: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>
  refreshUserProfile: () => Promise<void>
  loadUserProfile: () => Promise<void>
  clearError: () => void
}

// Profile form interface
export interface ProfileFormData {
  first_name: string
  last_name: string
  display_name: string
  user_type: 'reader' | 'author' | 'both'
  favorite_genres: string[]
}

// Settings form interface
export interface SettingsFormData {
  theme: 'light' | 'dark' | 'auto'
  font: string
  email_notifications: boolean
  marketing_emails: boolean
  weekly_reports: boolean
  language: string
  timezone: string
}

// Dashboard stats interface
export interface DashboardStats {
  totalBooks: number
  totalAuthors: number
  totalVotes: number
  totalGiveaways: number
  recentActivity: Array<{
    id: string
    type: 'vote' | 'giveaway' | 'book' | 'author'
    title: string
    timestamp: string
  }>
}
