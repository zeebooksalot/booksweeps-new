'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

interface DashboardLoadingState {
  isAuthLoading: boolean
  isProfileLoading: boolean
  isDataLoading: boolean
  isOverallLoading: boolean
  hasAnyLoading: boolean
}

export function useDashboardLoading() {
  const { loading: authLoading, profileLoading } = useAuth()
  const [dataLoading, setDataLoading] = useState(false)
  
  // Use useMemo to prevent unnecessary recalculations
  const loadingState = useMemo(() => {
    const isAuthLoading = authLoading
    const isProfileLoading = profileLoading
    const isDataLoading = dataLoading
    const hasAnyLoading = isAuthLoading || isProfileLoading || isDataLoading
    
    // Overall loading is true if auth is loading OR if we have any loading and no auth errors
    const isOverallLoading = isAuthLoading || (hasAnyLoading && !authLoading)

    return {
      isAuthLoading,
      isProfileLoading,
      isDataLoading,
      isOverallLoading,
      hasAnyLoading
    }
  }, [authLoading, profileLoading, dataLoading])

  // Set data loading state
  const setDataLoadingState = useCallback((loading: boolean) => {
    setDataLoading(loading)
  }, [])

  // Get loading priority for UI decisions
  const getLoadingPriority = useCallback(() => {
    if (loadingState.isAuthLoading) return 'auth'
    if (loadingState.isProfileLoading) return 'profile'
    if (loadingState.isDataLoading) return 'data'
    return 'none'
  }, [loadingState])

  // Get appropriate loading message
  const getLoadingMessage = useCallback(() => {
    const priority = getLoadingPriority()
    
    switch (priority) {
      case 'auth':
        return 'Loading your dashboard...'
      case 'profile':
        return 'Loading your profile...'
      case 'data':
        return 'Loading your dashboard data...'
      default:
        return 'Loading...'
    }
  }, [getLoadingPriority])

  // Check if we should show loading UI
  const shouldShowLoading = useCallback(() => {
    return loadingState.isOverallLoading
  }, [loadingState.isOverallLoading])

  // Check if we should block the UI
  const shouldBlockUI = useCallback(() => {
    // Only block UI if auth is actively loading
    // Don't block if auth loading is false (even if other loading states are true)
    return loadingState.isAuthLoading
  }, [loadingState.isAuthLoading])

  return {
    // Individual loading states
    isAuthLoading: loadingState.isAuthLoading,
    isProfileLoading: loadingState.isProfileLoading,
    isDataLoading: loadingState.isDataLoading,
    isOverallLoading: loadingState.isOverallLoading,
    hasAnyLoading: loadingState.hasAnyLoading,
    
    // Utility functions
    setDataLoading: setDataLoadingState,
    getLoadingPriority,
    getLoadingMessage,
    shouldShowLoading,
    shouldBlockUI,
    
    // Consolidated state
    loadingState
  }
}
