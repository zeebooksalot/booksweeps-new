'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserProfile } from '@/types/auth'

export function useUserProfile(userId: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create Supabase client using the SSR-compatible client
  const supabase = createClientComponentClient()

  const fetchProfile = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        setError(error.message)
        return
      }

      setProfile(data as UserProfile)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError('Failed to fetch user profile')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        setError(error.message)
        return
      }

      setProfile(data as UserProfile)
    } catch (err) {
      console.error('Error updating user profile:', err)
      setError('Failed to update user profile')
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  }
}
