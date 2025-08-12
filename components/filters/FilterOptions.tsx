"use client"

import { Button } from "@/components/ui/button"
import { FilterState } from "@/types"
import { 
  FILTER_OPTIONS, 
  DATE_RANGE_OPTIONS 
} from "@/constants"

interface FilterOptionsProps {
  filters: FilterState
  onFiltersChange: (updates: Partial<FilterState>) => void
  onResetFilters: () => void
  isMobileView?: boolean
}

export function FilterOptions({ 
  filters, 
  onFiltersChange, 
  onResetFilters, 
  isMobileView = false 
}: FilterOptionsProps) {
  const handleGenreToggle = (genre: string) => {
    const newGenres = filters.selectedGenres.includes(genre)
      ? filters.selectedGenres.filter(g => g !== genre)
      : [...filters.selectedGenres, genre]
    
    onFiltersChange({ selectedGenres: newGenres })
  }

  const handleRatingToggle = (rating: number) => {
    const newRating = filters.ratingFilter === rating ? 0 : rating
    onFiltersChange({ ratingFilter: newRating })
  }

  const handleGiveawayToggle = (value: boolean | null) => {
    const newValue = filters.hasGiveaway === value ? null : value
    onFiltersChange({ hasGiveaway: newValue })
  }

  const getButtonClass = (isActive: boolean) => {
    return `text-xs ${
      isActive 
        ? "bg-orange-500 hover:bg-orange-600" 
        : "border-gray-200 dark:border-gray-700"
    }`
  }

  const renderGenreFilter = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Genres
      </label>
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.genres.map((genre) => (
          <Button
            key={genre}
            variant={filters.selectedGenres.includes(genre) ? "default" : "outline"}
            size="sm"
            onClick={() => handleGenreToggle(genre)}
            className={getButtonClass(filters.selectedGenres.includes(genre))}
          >
            {genre}
          </Button>
        ))}
      </div>
    </div>
  )

  const renderRatingFilter = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Minimum Rating
      </label>
      <div className="flex items-center gap-2">
        {FILTER_OPTIONS.ratingOptions.map((rating) => (
          <Button
            key={rating}
            variant={filters.ratingFilter >= rating ? "default" : "outline"}
            size="sm"
            onClick={() => handleRatingToggle(rating)}
            className={getButtonClass(filters.ratingFilter >= rating)}
          >
            {rating}+
          </Button>
        ))}
      </div>
    </div>
  )

  const renderGiveawayFilter = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Giveaway Status
      </label>
      <div className="flex gap-2">
        <Button
          variant={filters.hasGiveaway === true ? "default" : "outline"}
          size="sm"
          onClick={() => handleGiveawayToggle(true)}
          className={getButtonClass(filters.hasGiveaway === true)}
        >
          Has Giveaway
        </Button>
        <Button
          variant={filters.hasGiveaway === false ? "default" : "outline"}
          size="sm"
          onClick={() => handleGiveawayToggle(false)}
          className={getButtonClass(filters.hasGiveaway === false)}
        >
          No Giveaway
        </Button>
      </div>
    </div>
  )

  const renderDateRangeFilter = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Date Range
      </label>
      <select
        value={filters.dateRange}
        onChange={(e) => onFiltersChange({ dateRange: e.target.value })}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
      >
        <option value={DATE_RANGE_OPTIONS.all}>All Time</option>
        <option value={DATE_RANGE_OPTIONS.week}>This Week</option>
        <option value={DATE_RANGE_OPTIONS.month}>This Month</option>
        <option value={DATE_RANGE_OPTIONS.year}>This Year</option>
      </select>
    </div>
  )

  if (isMobileView) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear All
          </Button>
        </div>
        
        <div className="space-y-4">
          {renderGenreFilter()}
          {renderRatingFilter()}
          {renderGiveawayFilter()}
          {renderDateRangeFilter()}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advanced Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear All
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderGenreFilter()}
        {renderRatingFilter()}
        {renderGiveawayFilter()}
        {renderDateRangeFilter()}
      </div>
    </div>
  )
}
