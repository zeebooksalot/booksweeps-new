"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  MessageCircle,
  BookOpen,
  Mail,
  Home,
  Compass,
  Trophy,
  User,
} from "lucide-react"
import { FeedItemDisplay } from "@/components/feed-item-display"
import { Header } from "@/components/header/index"
import { LoadingSpinner, FeedItemSkeleton, MobileCardSkeleton } from "@/components/ui/loading"
import { ErrorState } from "@/components/ui/error-state"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { FilterControls } from "@/components/FilterControls"
import { useHomePage } from "@/hooks/useHomePage"
import { useSimpleDebouncedSearch } from "@/hooks/use-debounced-search"
import { FeedItem, BookItem } from "@/types"
import { UI_CONFIG } from "@/constants"

// Throttle utility function
function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  let lastExecTime = 0
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now()
    
    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

export default function BookSweepsHomepage() {
  const [isMobileView, setIsMobileView] = useState(false)
  
  // Use the custom hook for all HomePage logic
  const {
    filters,
    isLoading,
    error,
    isRefreshing,
    filteredData,
    updateFilters,
    resetFilters,
    handleVote,
    handleRefresh,
    handleSwipeLeft,
    handleSwipeRight
  } = useHomePage()

  // Debounced search
  const debouncedSearchChange = useSimpleDebouncedSearch(
    (query: string) => updateFilters({ searchQuery: query }),
    UI_CONFIG.debounceDelay
  )

  // Throttled mobile view check
  const checkMobileView = useCallback(() => {
    setIsMobileView(window.innerWidth < UI_CONFIG.mobileBreakpoint)
  }, [])

  const throttledCheckMobileView = useMemo(
    () => throttle(checkMobileView, 100),
    [checkMobileView]
  )

  // Check for mobile view with throttling
  useEffect(() => {
    checkMobileView() // Initial check
    
    window.addEventListener('resize', throttledCheckMobileView)
    return () => window.removeEventListener('resize', throttledCheckMobileView)
  }, [throttledCheckMobileView, checkMobileView])

  // Memoized skeleton arrays for better performance
  const mobileSkeletons = useMemo(() => Array.from({ length: 3 }, (_, i) => (
    <MobileCardSkeleton key={`mobile-skeleton-${i}`} />
  )), [])

  const desktopSkeletons = useMemo(() => Array.from({ length: 5 }, (_, i) => (
    <FeedItemSkeleton key={`desktop-skeleton-${i}`} />
  )), [])

  // Live region for screen readers
  const resultsCount = filteredData.length
  const resultsText = `${resultsCount} ${resultsCount === 1 ? 'item' : 'items'} found`

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:bg-white md:dark:bg-gray-900 transition-colors">
        <Header 
          searchQuery={filters.searchQuery}
          onSearchChange={debouncedSearchChange}
        />

        {/* Live region for screen readers */}
        <div 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        >
          {isLoading ? "Loading books and authors..." : resultsText}
        </div>

        {/* Pull to Refresh Indicator */}
        {isRefreshing && (
          <div 
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 bg-white dark:bg-gray-800 rounded-full shadow-lg px-4 py-2 border border-gray-200 dark:border-gray-700"
            role="status"
            aria-label="Refreshing content"
          >
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
              <span className="text-14 font-medium text-gray-700 dark:text-gray-300">Refreshing...</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="pt-20 pb-20 md:pb-8">
          <div className="mx-0 md:mx-4 my-4 md:my-8 flex flex-col justify-center">
            <main className="max-w-4xl mx-auto w-full">

              {/* Filter Controls */}
              <FilterControls
                filters={filters}
                onFiltersChange={updateFilters}
                onResetFilters={resetFilters}
                isMobileView={isMobileView}
              />

              {/* Content */}
              <div className="mb-12 flex flex-col gap-4 md:gap-10">
                <div className="flex flex-col">
                  <h1 className="hidden md:block mb-6 text-24 font-semibold text-gray-900 dark:text-gray-100 mx-4">
                    Top Books & Authors Today
                  </h1>

                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center gap-3">
                        <LoadingSpinner size="md" />
                        <span className="text-gray-600 dark:text-gray-400">Loading books and authors...</span>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {error && !isLoading && (
                    <ErrorState
                      title="Failed to load content"
                      message="We couldn't load the books and authors. Please try again."
                      error={error}
                      onRetry={handleRefresh}
                      showDetails={false}
                      variant="compact"
                    />
                  )}

                  {/* Content */}
                  {!isLoading && !error && (
                    <>
                      {/* Mobile Card View */}
                      <div className="md:hidden">
                        {filteredData.length > 0 ? (
                          filteredData.map((item: FeedItem) => (
                            <FeedItemDisplay
                              key={item.id}
                              item={item}
                              isMobileView={true}
                              onVote={handleVote}
                              onSwipeLeft={handleSwipeLeft}
                              onSwipeRight={handleSwipeRight}
                              downloadSlug={item.type === 'book' ? (item as BookItem).downloadSlug || undefined : undefined}
                            />
                          ))
                        ) : (
                          <div className="text-center py-12 px-4">
                            <p className="text-gray-600 dark:text-gray-400">
                              No books or authors found matching your criteria.
                            </p>
                            <button
                              onClick={resetFilters}
                              className="mt-4 text-orange-500 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded"
                            >
                              Clear filters
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Desktop List View */}
                      <div className="hidden md:block">
                        {filteredData.length > 0 ? (
                          filteredData.map((item: FeedItem) => (
                            <FeedItemDisplay
                              key={item.id}
                              item={item}
                              isMobileView={false}
                              onVote={handleVote}
                              onSwipeLeft={handleSwipeLeft}
                              onSwipeRight={handleSwipeRight}
                              downloadSlug={item.type === 'book' ? (item as BookItem).downloadSlug || undefined : undefined}
                            />
                          ))
                        ) : (
                          <div className="text-center py-12 px-4">
                            <p className="text-gray-600 dark:text-gray-400">
                              No books or authors found matching your criteria.
                            </p>
                            <button
                              onClick={resetFilters}
                              className="mt-4 text-orange-500 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded"
                            >
                              Clear filters
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Loading Skeletons */}
                  {isLoading && (
                    <>
                      <div className="md:hidden">
                        {mobileSkeletons}
                      </div>
                      <div className="hidden md:block">
                        {desktopSkeletons}
                      </div>
                    </>
                  )}

                  <button 
                    className="relative my-4 mx-4 grow inline-block max-h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-center text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    aria-label="View all of today's books and authors"
                  >
                    See all of today&apos;s books & authors
                  </button>
                </div>
              </div>

              {/* Newsletter Signup - Desktop only */}
              <section 
                className="hidden md:flex mb-6 flex-row items-center gap-4 rounded-xl bg-gray-50 dark:bg-gray-800 p-4 shadow-sm mx-4 border border-gray-200 dark:border-gray-700"
                role="complementary"
                aria-label="Newsletter signup"
              >
                <Mail 
                  className="hidden h-7 w-7 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 md:block text-gray-700 dark:text-gray-300" 
                  aria-hidden="true"
                />
                <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
                  <div className="text-16 font-semibold text-gray-900 dark:text-gray-100">
                    Get the best of BookSweeps, directly in your inbox.
                  </div>
                  <Link
                    href="/signup"
                    className="w-full md:w-auto inline-block max-h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-center text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    aria-label="Sign up for BookSweeps newsletter"
                  >
                    Sign Up
                  </Link>
                </div>
              </section>
            </main>

          </div>

        </div>

        {/* Mobile Bottom Navigation */}
        <nav 
          className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden transition-colors"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex items-center justify-around py-2">
            <button 
              className="flex flex-col items-center gap-1 p-2 text-orange-500"
              aria-label="Navigate to home page"
              aria-current="page"
            >
              <Home className="h-5 w-5" aria-hidden="true" />
              <span className="text-10 font-medium">Home</span>
            </button>
            <button 
              className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400"
              aria-label="Navigate to discover page"
            >
              <Compass className="h-5 w-5" aria-hidden="true" />
              <span className="text-10 font-medium">Discover</span>
            </button>
            <Link 
              href="/giveaways" 
              className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400"
              aria-label="Navigate to giveaways page"
            >
              <Trophy className="h-5 w-5" aria-hidden="true" />
              <span className="text-10 font-medium">Giveaways</span>
            </Link>
            <button 
              className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400"
              aria-label="Navigate to profile page"
            >
              <User className="h-5 w-5" aria-hidden="true" />
              <span className="text-10 font-medium">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    </ErrorBoundary>
  )
}
