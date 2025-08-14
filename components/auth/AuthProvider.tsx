'use client'

import { createContext, useContext } from 'react'
import { useAuthState } from '@/hooks/useAuthState'
import { useAuthActions } from '@/hooks/useAuthActions'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useUserSettings } from '@/hooks/useUserSettings'
import { AuthContextType, UserProfile, UserSettings } from '@/types/auth'
import { ResourceError } from '@/components/ui/resource-error'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use modular hooks for different concerns
  const {
    user,
    userProfile,
    userSettings,
    loading,
    profileLoading,
    error,
    sessionEstablished,
    loadUserProfile,
    clearError,
  } = useAuthState()

  const {
    signIn,
    signUp,
    signOut,
  } = useAuthActions()

  const { updateProfile: updateProfileBase } = useUserProfile()
  const { updateSettings: updateSettingsBase } = useUserSettings()

  // Wrapper functions that integrate with the auth state
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return
    await updateProfileBase(user.id, updates)
    await loadUserProfile()
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return
    await updateSettingsBase(user.id, updates)
    await loadUserProfile()
  }

  const contextValue: AuthContextType = {
    user,
    userProfile,
    userSettings,
    userType: userProfile?.user_type || null,
    loading,
    profileLoading,
    error,
    sessionEstablished,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateSettings,
    refreshUserProfile: loadUserProfile,
    loadUserProfile,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {error && <ResourceError error={error} onRetry={clearError} />}
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
