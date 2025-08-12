"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, SortAsc } from "lucide-react"
import { GiveawayFiltersProps } from "@/types/giveaways"
import { GIVEAWAY_GENRES, GIVEAWAY_STATUS_OPTIONS, GIVEAWAY_PRIZE_TYPES, GIVEAWAY_SORT_OPTIONS, GIVEAWAY_TEXT, GIVEAWAY_STYLES } from "@/constants/giveaways"

export function GiveawayFilters({ 
  filters, 
  onFiltersChange, 
  onResetFilters, 
  isMobileView, 
  sortBy, 
  onSortChange 
}: GiveawayFiltersProps) {
  const getActiveFilterCount = () => {
    return [
      filters.genre !== '',
      filters.featured,
      filters.status !== 'all',
      filters.prizeType !== 'all'
    ].filter(Boolean).length
  }

  const activeFilterCount = getActiveFilterCount()

  const renderGenreFilter = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {GIVEAWAY_TEXT.filters.genre}
      </label>
      <select
        value={filters.genre}
        onChange={(e) => onFiltersChange({ genre: e.target.value })}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
      >
        {GIVEAWAY_GENRES.map((genre) => (
          <option key={genre.value} value={genre.value}>
            {genre.label}
          </option>
        ))}
      </select>
    </div>
  )

  const renderStatusFilter = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {GIVEAWAY_TEXT.filters.status}
      </label>
      <select
        value={filters.status}
        onChange={(e) => onFiltersChange({ status: e.target.value as 'all' | 'active' | 'ending_soon' })}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
      >
        {GIVEAWAY_STATUS_OPTIONS.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  )

  const renderPrizeTypeFilter = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {GIVEAWAY_TEXT.filters.prizeType}
      </label>
      <select
        value={filters.prizeType}
        onChange={(e) => onFiltersChange({ prizeType: e.target.value as 'all' | 'signed' | 'digital' | 'physical' })}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
      >
        {GIVEAWAY_PRIZE_TYPES.map((prizeType) => (
          <option key={prizeType.value} value={prizeType.value}>
            {prizeType.label}
          </option>
        ))}
      </select>
    </div>
  )

  const renderSortOptions = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Sort By
      </label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
      >
        {GIVEAWAY_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  if (isMobileView) {
    return (
      <>
        {/* Mobile Filter Button */}
        <div className="md:hidden px-4 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({ showAdvancedFilters: !filters.showAdvancedFilters })}
              className={`gap-1 border-gray-200 dark:border-gray-700 bg-transparent ${
                filters.showAdvancedFilters ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' : ''
              }`}
            >
              <Filter className="h-3 w-3" />
              {GIVEAWAY_TEXT.filters.title}
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 rounded-full p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-1 border-gray-200 dark:border-gray-700 bg-transparent"
            >
              <SortAsc className="h-3 w-3" />
              Sort
            </Button>
          </div>
        </div>

        {/* Mobile Advanced Filters Panel */}
        {filters.showAdvancedFilters && (
          <div className="mx-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {GIVEAWAY_TEXT.filters.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {GIVEAWAY_TEXT.filters.clearAll}
              </Button>
            </div>
            
            <div className="space-y-4">
              {renderGenreFilter()}
              {renderStatusFilter()}
              {renderPrizeTypeFilter()}
              {renderSortOptions()}
              
              {/* Featured Filter */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={filters.featured}
                  onChange={(e) => onFiltersChange({ featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {GIVEAWAY_TEXT.filters.featured}
                </label>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Desktop filters
  return (
    <div className="mb-8">
      <div className={GIVEAWAY_STYLES.filterPanel}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {GIVEAWAY_TEXT.filters.title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {GIVEAWAY_TEXT.filters.clearAll}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderGenreFilter()}
          {renderStatusFilter()}
          {renderPrizeTypeFilter()}
          {renderSortOptions()}
        </div>

        {/* Featured Filter */}
        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="featured-desktop"
            checked={filters.featured}
            onChange={(e) => onFiltersChange({ featured: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="featured-desktop" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            {GIVEAWAY_TEXT.filters.featured}
          </label>
        </div>
      </div>
    </div>
  )
}
