'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserSettings } from '@/types/auth'

export function useUserSettings(userId: string | null) {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create Supabase client using the SSR-compatible client
  const supabase = createClientComponentClient()

  const fetchSettings = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching user settings:', error)
        setError(error.message)
        return
      }

      setSettings(data as UserSettings)
    } catch (err) {
      console.error('Error fetching user settings:', err)
      setError('Failed to fetch user settings')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user settings:', error)
        setError(error.message)
        return
      }

      setSettings(data as UserSettings)
    } catch (err) {
      console.error('Error updating user settings:', err)
      setError('Failed to update user settings')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSettings,
  }
}
