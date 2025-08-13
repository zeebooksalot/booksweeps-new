"use client"

import Image from "next/image"
import { useSimpleDebouncedSearch } from "@/hooks/use-debounced-search"

import { Header } from "@/components/Header/index"
import { LoadingSpinner } from "@/components/ui/loading"
import { ErrorState } from "@/components/ui/error-state"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardTabs } from "@/components/dashboard/DashboardTabs"
import { DashboardContent } from "@/components/dashboard/DashboardContent"
import { useDashboard } from "@/hooks/useDashboard"
import { DASHBOARD_CONFIG } from "@/constants/dashboard"

export default function DashboardPageRefactored() {
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
    user,
    userProfile,
    loading
  } = useDashboard()

  // Debounced search
  const debouncedSearchChange = useSimpleDebouncedSearch(
    (query: string) => updateFilters({ searchQuery: query }),
    DASHBOARD_CONFIG.searchDebounceDelay
  )

  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="lg" />
          <span className="text-gray-600 dark:text-gray-400">Loading your dashboard...</span>
        </div>
      </div>
    )
  }

  // Show error state if not authenticated
  if (!user || !userProfile) {
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
        {/* Show loading state while dashboard data is loading */}
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <LoadingSpinner size="lg" />
              <span className="text-gray-600 dark:text-gray-400">Loading your dashboard data...</span>
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
              userProfile={userProfile}
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
