'use client'

import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { UserSettings } from '@/types/auth'
import { handleAuthError } from '@/lib/auth-utils'

export function useUserSettings() {
  // Update user settings
  const updateSettings = useCallback(async (userId: string, updates: Partial<UserSettings>) => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId)

      if (error) {
        const authError = handleAuthError(error, 'updating user settings')
        throw new Error(authError.message)
      }
    } catch (error) {
      const authError = handleAuthError(error, 'updating user settings')
      throw new Error(authError.message)
    }
  }, [])

  // Fetch user settings
  const fetchSettings = useCallback(async (userId: string) => {
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
        return null
      }

      return data as UserSettings
    } catch (error) {
      const authError = handleAuthError(error, 'fetching user settings')
      console.error(authError.message)
      return null
    }
  }, [])

  // Update theme
  const updateTheme = useCallback(async (userId: string, theme: UserSettings['theme']) => {
    return updateSettings(userId, { theme })
  }, [updateSettings])

  // Update font
  const updateFont = useCallback(async (userId: string, font: string) => {
    return updateSettings(userId, { font })
  }, [updateSettings])

  // Update email notifications
  const updateEmailNotifications = useCallback(async (userId: string, enabled: boolean) => {
    return updateSettings(userId, { email_notifications: enabled })
  }, [updateSettings])

  // Update marketing emails
  const updateMarketingEmails = useCallback(async (userId: string, enabled: boolean) => {
    return updateSettings(userId, { marketing_emails: enabled })
  }, [updateSettings])

  // Update weekly reports
  const updateWeeklyReports = useCallback(async (userId: string, enabled: boolean) => {
    return updateSettings(userId, { weekly_reports: enabled })
  }, [updateSettings])

  // Update language
  const updateLanguage = useCallback(async (userId: string, language: string) => {
    return updateSettings(userId, { language })
  }, [updateSettings])

  // Update timezone
  const updateTimezone = useCallback(async (userId: string, timezone: string) => {
    return updateSettings(userId, { timezone })
  }, [updateSettings])

  // Update sidebar collapsed state
  const updateSidebarCollapsed = useCallback(async (userId: string, collapsed: boolean) => {
    return updateSettings(userId, { sidebar_collapsed: collapsed })
  }, [updateSettings])

  // Update keyboard shortcuts
  const updateKeyboardShortcuts = useCallback(async (userId: string, enabled: boolean) => {
    return updateSettings(userId, { keyboard_shortcuts_enabled: enabled })
  }, [updateSettings])

  return {
    updateSettings,
    fetchSettings,
    updateTheme,
    updateFont,
    updateEmailNotifications,
    updateMarketingEmails,
    updateWeeklyReports,
    updateLanguage,
    updateTimezone,
    updateSidebarCollapsed,
    updateKeyboardShortcuts,
  }
}
