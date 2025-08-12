"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Header } from "@/components/Header/index"
import { LoadingSpinner } from "@/components/ui/loading"
import { ErrorState } from "@/components/ui/error-state"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { FilterControls } from "@/components/FilterControls"
import { useHomePage } from "@/hooks/useHomePage"
import { useSimpleDebouncedSearch } from "@/hooks/use-debounced-search"
import { FeedItem } from "@/types"
import { UI_CONFIG } from "@/constants"

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

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < UI_CONFIG.mobileBreakpoint)
    }
    
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:bg-white md:dark:bg-gray-900 transition-colors">
        <Header 
          searchQuery={filters.searchQuery}
          onSearchChange={debouncedSearchChange}
          isMobileView={isMobileView}
        />

        {/* Pull to Refresh Indicator */}
        {isRefreshing && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 bg-white dark:bg-gray-800 rounded-full shadow-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
              <span className="text-14 font-medium text-gray-700 dark:text-gray-300">Refreshing...</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="pt-20 pb-20 md:pb-8">
          <div className="mx-0 md:mx-4 my-4 md:my-8 flex flex-col justify-center gap-8 md:flex-row">
            <main className="md:max-w-[900px] w-full">
              {/* Welcome Banner - Hidden on mobile */}
              <section className="hidden md:flex mb-6 flex-row items-center gap-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 p-4 shadow-sm mx-4 border border-orange-100 dark:border-orange-800">
                <BookOpen className="h-7 w-7 rounded-xl border-2 border-orange-100 dark:border-orange-800 bg-white dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-300" />
                <div className="flex flex-col">
                  <div className="text-16 font-semibold text-gray-900 dark:text-gray-100">Welcome to BookSweeps!</div>
                  <div className="flex flex-row gap-1 text-16 text-gray-600 dark:text-gray-400">
                    The place to discover and vote on amazing books.
                    <button className="text-left text-16 font-semibold text-orange-500 hover:underline">
                      Take a tour.
                    </button>
                  </div>
                </div>
                <button className="ml-auto flex cursor-pointer items-center justify-center rounded-full border-2 border-orange-100 dark:border-orange-800 bg-white dark:bg-gray-800 p-2 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                  ×
                </button>
              </section>

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
                        {filteredData.map((item: FeedItem) => (
                          <FeedItemDisplay
                            key={item.id}
                            item={item}
                            isMobileView={true}
                            onVote={handleVote}
                            onSwipeLeft={handleSwipeLeft}
                            onSwipeRight={handleSwipeRight}
                          />
                        ))}
                      </div>

                      {/* Desktop List View */}
                      <div className="hidden md:block">
                        {filteredData.map((item: FeedItem) => (
                          <FeedItemDisplay
                            key={item.id}
                            item={item}
                            isMobileView={false}
                            onVote={handleVote}
                            onSwipeLeft={handleSwipeLeft}
                            onSwipeRight={handleSwipeRight}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <button className="relative my-4 mx-4 grow inline-block max-h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-center text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm">
                    See all of today&apos;s books & authors
                  </button>
                </div>
              </div>

              {/* Newsletter Signup - Desktop only */}
              <section className="hidden md:flex mb-6 flex-row items-center gap-4 rounded-xl bg-gray-50 dark:bg-gray-800 p-4 shadow-sm mx-4 border border-gray-200 dark:border-gray-700">
                <Mail className="hidden h-7 w-7 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 md:block text-gray-700 dark:text-gray-300" />
                <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
                  <div className="text-16 font-semibold text-gray-900 dark:text-gray-100">
                    Get the best of BookSweeps, directly in your inbox.
                  </div>
                  <a
                    href="/signup"
                    className="w-full md:w-auto inline-block max-h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-center text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
                  >
                    Sign Up
                  </a>
                </div>
              </section>
            </main>

            {/* Sidebar - Desktop only */}
            <aside className="hidden md:block w-full md:w-[280px] md:min-w-[280px]">
              <div className="mb-8 flex flex-col gap-4">
                <a className="text-18 font-semibold text-gray-900 dark:text-gray-100 transition-all duration-300 ease-in hover:text-orange-500">
                  Trending Discussions
                </a>
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col">
                    <div className="group -mx-4 flex cursor-pointer flex-col gap-2 rounded-lg p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm">
                      <a className="flex flex-row items-center gap-2 text-14 font-medium text-gray-600 dark:text-gray-400 group-hover:text-orange-500">
                        <Image
                          src="/placeholder.svg?height=20&width=20"
                          alt="Book Club"
                          width={20}
                          height={20}
                          className="rounded"
                        />
                        r/bookclub
                      </a>
                      <a className="block text-16 font-medium text-gray-900 dark:text-gray-100 leading-snug">
                        What&apos;s your favorite book discovery method?
                      </a>
                      <div className="flex flex-row items-center justify-start gap-3 mt-1">
                        <button className="flex flex-row items-center gap-1 text-14 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:text-orange-500">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            className="stroke-[1.5px] stroke-gray-600 dark:stroke-gray-400"
                          >
                            <path d="M2 5.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C3.52 2 4.08 2 5.2 2h5.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C14 3.52 14 4.08 14 5.2v5.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C12.48 14 11.92 14 10.8 14H5.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C2 12.48 2 11.92 2 10.8z"></path>
                            <path d="M7.2 5.733a1 1 0 0 1 1.6 0l2 2.667A1 1 0 0 1 10 10H6a1 1 0 0 1-.8-1.6z"></path>
                          </svg>
                          135
                        </button>
                        <span className="text-12 text-gray-400">•</span>
                        <a className="flex flex-row items-center gap-1 text-14 text-gray-600 dark:text-gray-400">
                          <MessageCircle className="h-3.5 w-3.5" />
                          80
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <a
                      href="/discussions"
                      className="inline-block max-h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-center text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
                    >
                      View all
                    </a>
                    <a
                      href="/discussions/new"
                      className="flex flex-row items-center justify-center gap-2 text-16 font-semibold text-gray-600 dark:text-gray-400 inline-block max-h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-center transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Start new thread
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Footer - Desktop only */}
          <footer className="hidden md:block bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-12 transition-colors">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <BookOpen className="h-6 w-6 text-orange-500" />
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">BookSweeps</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Connecting readers with amazing books through author giveaways.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">For Readers</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      <Link href="/giveaways" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        Browse Giveaways
                      </Link>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        How It Works
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        My Dashboard
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">For Authors</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        Create Campaign
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        Author Tools
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        Success Stories
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Support</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        Privacy Policy
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                <p>© 2025 BookSweeps. All rights reserved. Built with ❤️ for book lovers.</p>
              </div>
            </div>
          </footer>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden transition-colors">
          <div className="flex items-center justify-around py-2">
            <button className="flex flex-col items-center gap-1 p-2 text-orange-500">
              <Home className="h-5 w-5" />
              <span className="text-10 font-medium">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400">
              <Compass className="h-5 w-5" />
              <span className="text-10 font-medium">Discover</span>
            </button>
            <Link href="/giveaways" className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400">
              <Trophy className="h-5 w-5" />
              <span className="text-10 font-medium">Giveaways</span>
            </Link>
            <button className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400">
              <User className="h-5 w-5" />
              <span className="text-10 font-medium">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    </ErrorBoundary>
  )
}
