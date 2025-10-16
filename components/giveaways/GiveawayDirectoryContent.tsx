'use client'

import React from 'react'
import { useGiveaways } from '@/hooks/useGiveaways'
import { GiveawayDirectoryFilters } from '@/components/giveaways/GiveawayDirectoryFilters'
import { GiveawayDirectoryList } from '@/components/giveaways/GiveawayDirectoryList'
import { GiveawayEmptyState } from '@/components/giveaways/GiveawayEmptyState'
import { GiveawayDirectorySkeleton } from '@/components/giveaways/GiveawayDirectorySkeleton'
import { GIVEAWAY_STYLES } from '@/constants/giveaways'

interface GiveawayContentProps {
  searchQuery: string
}

export function GiveawayDirectoryContent({ searchQuery }: GiveawayContentProps) {
  const {
    filteredGiveaways,
    isLoading,
    error,
    isMobileView,
    filters,
    sortBy,
    updateFilters,
    resetFilters,
    setSortBy,
    handleEnterGiveaway
  } = useGiveaways()

  // Update search filter when searchQuery prop changes
  React.useEffect(() => {
    if (searchQuery !== filters.searchQuery) {
      updateFilters({ searchQuery })
    }
  }, [searchQuery, filters.searchQuery, updateFilters])

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className={GIVEAWAY_STYLES.mainContent}>
        {/* Mobile Filters */}
        <GiveawayDirectoryFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onResetFilters={resetFilters}
          isMobileView={true}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Desktop Filters */}
        <GiveawayDirectoryFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onResetFilters={resetFilters}
          isMobileView={false}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Loading state */}
        <GiveawayDirectorySkeleton isMobileView={isMobileView} count={6} />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={GIVEAWAY_STYLES.mainContent}>
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={GIVEAWAY_STYLES.mainContent}>
      {/* Mobile Filters */}
      <GiveawayDirectoryFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onResetFilters={resetFilters}
        isMobileView={true}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Desktop Filters */}
      <GiveawayDirectoryFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onResetFilters={resetFilters}
        isMobileView={false}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Content */}
      {filteredGiveaways.length === 0 ? (
        <GiveawayEmptyState 
          onResetFilters={resetFilters}
          onClearSearch={() => updateFilters({ searchQuery: '' })}
          hasActiveFilters={filters.genre !== '' || filters.featured || filters.status !== 'all' || filters.prizeType !== 'all'}
          searchQuery={filters.searchQuery}
        />
      ) : (
        <GiveawayDirectoryList
          giveaways={filteredGiveaways}
          onEnter={handleEnterGiveaway}
          isMobileView={isMobileView}
        />
      )}
    </div>
  )
}
