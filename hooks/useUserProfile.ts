'use client'

import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types/auth'
import { handleAuthError } from '@/lib/auth-utils'

export function useUserProfile() {
  // Update user profile
  const updateProfile = useCallback(async (userId: string, updates: Partial<UserProfile>) => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)

      if (error) {
        const authError = handleAuthError(error, 'updating user profile')
        throw new Error(authError.message)
      }
    } catch (error) {
      const authError = handleAuthError(error, 'updating user profile')
      throw new Error(authError.message)
    }
  }, [])

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
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

  // Update user avatar
  const updateAvatar = useCallback(async (userId: string, avatarUrl: string) => {
    return updateProfile(userId, { avatar_url: avatarUrl })
  }, [updateProfile])

  // Update user display name
  const updateDisplayName = useCallback(async (userId: string, displayName: string) => {
    return updateProfile(userId, { display_name: displayName })
  }, [updateProfile])

  // Update user type
  const updateUserType = useCallback(async (userId: string, userType: UserProfile['user_type']) => {
    return updateProfile(userId, { user_type: userType })
  }, [updateProfile])

  // Update favorite genres
  const updateFavoriteGenres = useCallback(async (userId: string, genres: string[]) => {
    return updateProfile(userId, { favorite_genres: genres })
  }, [updateProfile])

  return {
    updateProfile,
    fetchProfile,
    updateAvatar,
    updateDisplayName,
    updateUserType,
    updateFavoriteGenres,
  }
}
