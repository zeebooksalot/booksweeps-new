'use client'

import React from 'react'
import { useReaderMagnets } from '@/hooks/useReaderMagnets'
import { ReaderMagnetFilters } from '@/components/reader-magnets/ReaderMagnetFilters'
import { ReaderMagnetList } from '@/components/reader-magnets/ReaderMagnetList'
import { ReaderMagnetEmptyState } from '@/components/reader-magnets/ReaderMagnetEmptyState'
import { ReaderMagnetSidebar } from '@/components/reader-magnets/ReaderMagnetSidebar'
import { READER_MAGNET_STYLES } from '@/constants/reader-magnets'

interface ReaderMagnetContentProps {
  searchQuery: string
}

export function ReaderMagnetContent({ searchQuery }: ReaderMagnetContentProps) {
  const {
    feedItems,
    isLoading,
    isMobileView,
    filters,
    uniqueGenres,
    updateFilters,
    resetFilters,
    handleVote,
    handleSwipeLeft,
    handleSwipeRight
  } = useReaderMagnets()

  // Update search filter when searchQuery prop changes
  React.useEffect(() => {
    if (searchQuery !== filters.searchTerm) {
      updateFilters({ searchTerm: searchQuery })
    }
  }, [searchQuery, filters.searchTerm, updateFilters])

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <>
        <main className={READER_MAGNET_STYLES.main}>
          {/* Mobile Filters */}
          <ReaderMagnetFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onResetFilters={resetFilters}
            isMobileView={true}
            uniqueGenres={uniqueGenres}
          />
          {/* Loading state */}
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading free books...</p>
            </div>
          </div>
        </main>

        {/* Desktop Sidebar */}
        <ReaderMagnetSidebar
          filters={filters}
          onFiltersChange={updateFilters}
          onResetFilters={resetFilters}
          uniqueGenres={uniqueGenres}
          feedItemsCount={0}
        />
      </>
    )
  }

  return (
    <>
      <main className={READER_MAGNET_STYLES.main}>
        {/* Mobile Filters */}
        <ReaderMagnetFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onResetFilters={resetFilters}
          isMobileView={true}
          uniqueGenres={uniqueGenres}
        />

        {/* Content */}
        {feedItems.length === 0 ? (
          <ReaderMagnetEmptyState />
        ) : (
          <ReaderMagnetList
            feedItems={feedItems}
            onVote={handleVote}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />
        )}
      </main>

      {/* Desktop Sidebar */}
      <ReaderMagnetSidebar
        filters={filters}
        onFiltersChange={updateFilters}
        onResetFilters={resetFilters}
        uniqueGenres={uniqueGenres}
        feedItemsCount={feedItems.length}
      />
    </>
  )
}
