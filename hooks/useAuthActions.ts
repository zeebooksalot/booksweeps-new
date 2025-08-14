'use client'

import { useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { handleAuthError } from '@/lib/auth-utils'

export function useAuthActions() {
  // Create Supabase client using the SSR-compatible client
  const supabase = createClientComponentClient()

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        const authError = handleAuthError(error, 'signing in')
        throw new Error(authError.message)
      }

      return data
    } catch (error) {
      const authError = handleAuthError(error, 'signing in')
      throw new Error(authError.message)
    }
  }, [supabase])

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        const authError = handleAuthError(error, 'signing up')
        throw new Error(authError.message)
      }

      return data
    } catch (error) {
      const authError = handleAuthError(error, 'signing up')
      throw new Error(authError.message)
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        const authError = handleAuthError(error, 'signing out')
        throw new Error(authError.message)
      }
    } catch (error) {
      const authError = handleAuthError(error, 'signing out')
      throw new Error(authError.message)
    }
  }, [supabase])

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)

      if (error) {
        const authError = handleAuthError(error, 'resetting password')
        throw new Error(authError.message)
      }
    } catch (error) {
      const authError = handleAuthError(error, 'resetting password')
      throw new Error(authError.message)
    }
  }, [supabase])

  const updatePassword = useCallback(async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) {
        const authError = handleAuthError(error, 'updating password')
        throw new Error(authError.message)
      }
    } catch (error) {
      const authError = handleAuthError(error, 'updating password')
      throw new Error(authError.message)
    }
  }, [supabase])

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }
}
