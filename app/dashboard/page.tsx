"use client"

import Image from "next/image"
import { useEffect, useState, useMemo } from "react"
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
import { DASHBOARD_CONFIG } from "@/constants/dashboard"
import { UserProfile } from "@/types/auth"

export default function DashboardPageRefactored() {
  
  const { user, userProfile, profileLoading, loading: authLoading } = useAuth()
  const { 
    isAuthLoading, 
    isProfileLoading, 
    isDataLoading, 
    shouldShowLoading, 
    shouldBlockUI,
    getLoadingMessage,
    setDataLoading 
  } = useDashboardLoading()
  
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

  // Use the custom hook for all dashboard logic
  const {
    downloads,
    favorites,
    readingList,
    stats,
    isLoadingData,
    isRefreshing,
    dataError,
    isMobileView,
    filters,
    updateFilters,
    refreshData,
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

  // Memoize fallback profile
  const fallbackProfile = useMemo(() => getFallbackProfile(), [user?.id, user?.email])
  const effectiveProfile = userProfile || fallbackProfile

  // Show loading state while auth is loading (blocking)
  if (shouldBlockUI() || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="lg" />
          <span className="text-gray-600 dark:text-gray-400">{getLoadingMessage()}</span>
        </div>
      </div>
    )
  }

  // Show error state if not authenticated (only after auth has finished loading)
  if (!user && !authLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header 
        searchQuery={filters.searchQuery}
        onSearchChange={debouncedSearchChange}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 pt-20">
        {/* Dashboard Header */}
        <DashboardHeader 
          user={user!}
          userProfile={effectiveProfile}
          stats={stats}
        />

        {/* Dashboard Tabs */}
        <DashboardTabs 
          activeTab={filters.activeTab}
          onTabChange={handleTabChange}
          searchQuery={filters.searchQuery}
          onSearchChange={(query) => updateFilters({ searchQuery: query })}
          itemCounts={{
            downloads: downloads.length,
            favorites: favorites.length,
            readingList: readingList.length
          }}
        />

        {/* Dashboard Content */}
        <DashboardContent 
          activeTab={filters.activeTab}
          downloads={downloads}
          favorites={favorites}
          readingList={readingList}
        />
      </div>
    </div>
  )
}