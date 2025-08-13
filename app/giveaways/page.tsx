"use client"

import { Header } from '@/components/Header/index'
import { useGiveaways } from '@/hooks/useGiveaways'
import { GiveawayFilters } from '@/components/giveaways/GiveawayFilters'
import { GiveawayList } from '@/components/giveaways/GiveawayList'
import { GiveawayEmptyState } from '@/components/giveaways/GiveawayEmptyState'
import { GiveawayLoadingState } from '@/components/giveaways/GiveawayLoadingState'
import { GIVEAWAY_STYLES } from '@/constants/giveaways'

export default function GiveawaysPage() {
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

  if (isLoading) {
    return <GiveawayLoadingState />
  }

  if (error) {
    return (
      <div className={GIVEAWAY_STYLES.container}>
        <Header 
          searchQuery={filters.searchQuery}
          onSearchChange={(searchQuery) => updateFilters({ searchQuery })}
        />
        <div className={GIVEAWAY_STYLES.mainContent}>
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={GIVEAWAY_STYLES.container}>
      {/* Header */}
      <Header 
        searchQuery={filters.searchQuery}
        onSearchChange={(searchQuery) => updateFilters({ searchQuery })}
      />

      {/* Main Content */}
      <div className={GIVEAWAY_STYLES.mainContent}>
        {/* Mobile Filters */}
        <GiveawayFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onResetFilters={resetFilters}
          isMobileView={true}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Desktop Filters */}
        <GiveawayFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onResetFilters={resetFilters}
          isMobileView={false}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Content */}
        {filteredGiveaways.length === 0 ? (
          <GiveawayEmptyState />
        ) : (
          <GiveawayList
            giveaways={filteredGiveaways}
            onEnter={handleEnterGiveaway}
            isMobileView={isMobileView}
          />
        )}
      </div>
    </div>
  )
}
