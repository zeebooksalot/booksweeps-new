'use client'

import { Header } from '@/components/Header/index'
import { useReaderMagnets } from '@/hooks/useReaderMagnets'
import { ReaderMagnetFilters } from '@/components/reader-magnets/ReaderMagnetFilters'
import { ReaderMagnetList } from '@/components/reader-magnets/ReaderMagnetList'
import { ReaderMagnetEmptyState } from '@/components/reader-magnets/ReaderMagnetEmptyState'
import { ReaderMagnetLoadingState } from '@/components/reader-magnets/ReaderMagnetLoadingState'
import { ReaderMagnetSidebar } from '@/components/reader-magnets/ReaderMagnetSidebar'
import { READER_MAGNET_STYLES } from '@/constants/reader-magnets'

export default function FreeBooksPage() {
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

  if (isLoading) {
    return <ReaderMagnetLoadingState />
  }

  return (
    <div className={READER_MAGNET_STYLES.container}>
      {/* Header */}
      <Header 
        searchQuery={filters.searchTerm}
        onSearchChange={(searchTerm) => updateFilters({ searchTerm })}
        isMobileView={isMobileView}
      />

      {/* Main Content */}
      <div className={READER_MAGNET_STYLES.mainContent}>
        <div className={READER_MAGNET_STYLES.contentWrapper}>
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
        </div>
      </div>
    </div>
  )
}
