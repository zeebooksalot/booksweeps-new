"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useSimpleDebouncedSearch } from "@/hooks/use-debounced-search"

import { Header } from "@/components/Header/index"
import { LoadingSpinner } from "@/components/ui/loading"
import { ErrorState } from "@/components/ui/error-state"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardTabs } from "@/components/dashboard/DashboardTabs"
import { DashboardContent } from "@/components/dashboard/DashboardContent"
import { useDashboard } from "@/hooks/useDashboard"
import { useAuth } from "@/components/auth/AuthProvider"
import { useDashboardLoading } from "@/hooks/useDashboardLoading"
import { useSystemHealth } from "@/hooks/useSystemHealth"
import { DASHBOARD_CONFIG } from "@/constants/dashboard"
import { AUTH_TIMING } from "@/constants/auth"
import { UserProfile } from "@/types/auth"

// Constants for retry and caching - now using shared constants
const MAX_RETRY_ATTEMPTS = 3

export default function DashboardPageRefactored() {
  console.log('Dashboard page rendering...') // Add this debug log
  
  const { user, userProfile, profileLoading, loadUserProfile } = useAuth()
  const { 
    isAuthLoading, 
    isProfileLoading, 
    isDataLoading, 
    shouldShowLoading, 
    shouldBlockUI,
    getLoadingMessage,
    setDataLoading 
  } = useDashboardLoading()
  
  // Use shared system health hook
  const { healthStatus, isHealthy, isUnhealthy, refreshHealth } = useSystemHealth()
  
  // Add error recovery state
  const [profileError, setProfileError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [hasTimedOut, setHasTimedOut] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  // Create fallback profile for when userProfile is not available
  const getFallbackProfile = (): UserProfile => ({
    id: user?.id || '',
    email: user?.email || '',
    user_type: 'reader',
    display_name: user?.email?.split('@')[0] || 'User',
    first_name: '',
    last_name: '',
    auth_source: null,
    avatar_url: null,
    favorite_genres: [],
    reading_preferences: {
      email_notifications: true,
      marketing_emails: true,
      giveaway_reminders: true,
      weekly_reports: false,
      theme: 'auto',
      language: 'en',
      timezone: 'UTC',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  // Handle profile retry with retry limit
  const handleProfileRetry = async () => {
    // Check retry limit
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      setProfileError('Maximum retry attempts reached. Please refresh the page or contact support.')
      return
    }
    
    // Prevent concurrent profile loading
    if (isLoadingProfile) {
      return
    }
    
    setIsLoadingProfile(true)
    setRetryCount(prev => prev + 1)
    setProfileError(null)
    setHasTimedOut(false)
    
    try {
      // Check system health first using shared hook
      const isSystemHealthy = await refreshHealth()
      
      if (!isSystemHealthy) {
        setProfileError('System is currently unavailable. Please try again later.')
        return
      }
      
      await loadUserProfile()
    } catch (error) {
      console.error('Profile retry failed:', error)
      
      // Provide generic error messages to avoid information leakage
      const errorMessage = 'An error occurred while loading your profile. Please try again.'
      
      if (error instanceof Error) {
        // Only log specific errors, but show generic messages to users
        console.error('Specific error details:', error.message)
      }
      
      setProfileError(errorMessage)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // Auto-clear errors after timeout - using shared timing constant
  useEffect(() => {
    if (profileError) {
      const timeout = setTimeout(() => {
        setProfileError(null)
      }, AUTH_TIMING.ERROR_AUTO_CLEAR)
      
      return () => clearTimeout(timeout)
    }
  }, [profileError])

  // Load profile data after dashboard renders
  useEffect(() => {
    console.log('Dashboard useEffect - user:', !!user, 'userProfile:', !!userProfile, 'profileLoading:', profileLoading)
    
    if (user && !userProfile && !profileLoading && !isLoadingProfile) {
      console.log('Loading user profile for dashboard...')
      setIsLoadingProfile(true)
      loadUserProfile().finally(() => {
        setIsLoadingProfile(false)
      })
    }
  }, [user, userProfile, profileLoading, loadUserProfile, isLoadingProfile])

  // Add timeout protection for profile loading - using shared timing constant
  useEffect(() => {
    if (isProfileLoading) {
      const timeout = setTimeout(() => {
        console.warn('Profile loading timed out')
        setHasTimedOut(true)
        setProfileError('Profile loading timed out. You can still use the dashboard.')
      }, AUTH_TIMING.LOGIN_TIMEOUT) // Using same timeout as login
      
      return () => clearTimeout(timeout)
    }
  }, [isProfileLoading])

  // Use the custom hook for all dashboard logic
  const {
    downloads,
    favorites,
    readingList,
    stats,
    isLoadingData,
    dataError,
    isMobileView,
    filters,
    updateFilters,
    handleTabChange,
    loading
  } = useDashboard()

  // Sync dashboard loading state with consolidated loading hook
  useEffect(() => {
    setDataLoading(isLoadingData)
  }, [isLoadingData, setDataLoading])

  // Debounced search
  const debouncedSearchChange = useSimpleDebouncedSearch(
    (query: string) => updateFilters({ searchQuery: query }),
    DASHBOARD_CONFIG.searchDebounceDelay
  )

  console.log('Dashboard render state:', {
    user: !!user,
    userProfile: !!userProfile,
    isAuthLoading,
    isProfileLoading,
    isDataLoading,
    profileError,
    hasTimedOut,
    retryCount,
    shouldShowLoading,
    shouldBlockUI,
    healthStatus
  })

  // Show loading state while auth is loading (blocking)
  if (shouldBlockUI()) {
    console.log('Dashboard: Showing blocking auth loading state')
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="lg" />
          <span className="text-gray-600 dark:text-gray-400">{getLoadingMessage()}</span>
        </div>
      </div>
    )
  }

  // Show error state if not authenticated
  if (!user) {
    console.log('Dashboard: No user, showing auth required')
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <ErrorState
          title="Authentication Required"
          message="Please sign in to access your dashboard."
          variant="compact"
        />
      </div>
    )
  }

  // Use fallback profile if userProfile is not available
  const effectiveProfile = userProfile || getFallbackProfile()
  const isUsingFallback = !userProfile

  console.log('Dashboard: Rendering dashboard with profile:', {
    hasUserProfile: !!userProfile,
    isUsingFallback,
    profileError,
    hasTimedOut,
    retryCount,
    healthStatus
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header 
        searchQuery={filters.searchQuery}
        onSearchChange={debouncedSearchChange}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 pt-20">
        {/* Show profile error with retry option */}
        {profileError && (
          <div className="mb-6">
            <ErrorState
              title="Profile Loading Issue"
              message={profileError}
              onRetry={retryCount < MAX_RETRY_ATTEMPTS ? handleProfileRetry : undefined}
              variant="compact"
            />
            {isUnhealthy && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  ⚠️ System is currently experiencing issues. Some features may be limited.
                </p>
              </div>
            )}
            {retryCount >= MAX_RETRY_ATTEMPTS && (
              <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  🔄 Maximum retry attempts reached. This error will clear automatically in {Math.ceil(AUTH_TIMING.ERROR_AUTO_CLEAR / 1000)} seconds.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Show profile loading indicator */}
        {isProfileLoading && !hasTimedOut && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <span className="text-blue-700 dark:text-blue-300">
                Loading your profile...
              </span>
            </div>
          </div>
        )}

        {/* Show fallback notice */}
        {isUsingFallback && !isProfileLoading && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-yellow-700 dark:text-yellow-300">
                ⚠️ Using basic profile. Some features may be limited.
              </span>
              {!profileError && retryCount < MAX_RETRY_ATTEMPTS && (
                <button
                  onClick={handleProfileRetry}
                  className="text-sm text-yellow-800 dark:text-yellow-200 underline hover:no-underline"
                >
                  Retry loading full profile ({MAX_RETRY_ATTEMPTS - retryCount} attempts left)
                </button>
              )}
            </div>
            {isUnhealthy && (
              <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                System is currently experiencing connectivity issues.
              </p>
            )}
          </div>
        )}

        {/* Show loading state while dashboard data is loading */}
        {isDataLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <LoadingSpinner size="lg" />
              <span className="text-gray-600 dark:text-gray-400">{getLoadingMessage()}</span>
            </div>
          </div>
        ) : dataError ? (
          /* Show error state if dashboard data failed to load */
          <div className="flex items-center justify-center py-12">
            <ErrorState
              title="Failed to Load Dashboard"
              message={dataError}
              variant="compact"
            />
          </div>
        ) : (
          /* Main dashboard content */
          <>
            {/* User Profile Section */}
            <DashboardHeader 
              user={user}
              userProfile={effectiveProfile}
              stats={stats}
            />

            {/* Dashboard Tabs */}
            <DashboardTabs
              activeTab={filters.activeTab}
              onTabChange={handleTabChange}
              searchQuery={filters.searchQuery}
              onSearchChange={debouncedSearchChange}
              itemCounts={{
                downloads: downloads.length,
                favorites: favorites.length,
                readingList: readingList.length
              }}
            />

            {/* Tab Content */}
            <DashboardContent
              activeTab={filters.activeTab}
              downloads={downloads}
              favorites={favorites}
              readingList={readingList}
            />
          </>
        )}
      </div>
    </div>
  )
}
