"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"
import { FilterState } from "@/types"
import { 
  FILTER_OPTIONS, 
  TAB_OPTIONS, 
  DATE_RANGE_OPTIONS 
} from "@/constants"

interface FilterControlsProps {
  filters: FilterState
  onFiltersChange: (updates: Partial<FilterState>) => void
  onResetFilters: () => void
  isMobileView?: boolean
}

export function FilterControls({ 
  filters, 
  onFiltersChange, 
  onResetFilters, 
  isMobileView = false 
}: FilterControlsProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Update showAdvancedFilters when filters change
  useEffect(() => {
    setShowAdvancedFilters(filters.showAdvancedFilters)
  }, [filters.showAdvancedFilters])

  const handleFilterChange = (updates: Partial<FilterState>) => {
    onFiltersChange(updates)
  }

  const handleGenreToggle = (genre: string) => {
    const newGenres = filters.selectedGenres.includes(genre)
      ? filters.selectedGenres.filter(g => g !== genre)
      : [...filters.selectedGenres, genre]
    
    handleFilterChange({ selectedGenres: newGenres })
  }

  const handleRatingToggle = (rating: number) => {
    const newRating = filters.ratingFilter === rating ? 0 : rating
    handleFilterChange({ ratingFilter: newRating })
  }

  const handleGiveawayToggle = (value: boolean | null) => {
    const newValue = filters.hasGiveaway === value ? null : value
    handleFilterChange({ hasGiveaway: newValue })
  }

  const getActiveFilterCount = () => {
    return [
      filters.selectedGenres.length > 0,
      filters.ratingFilter > 0,
      filters.hasGiveaway !== null,
      filters.dateRange !== "all"
    ].filter(Boolean).length
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <>
      {/* Mobile Filter Tabs */}
      {isMobileView && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              variant={filters.activeTab === TAB_OPTIONS.all ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ activeTab: TAB_OPTIONS.all })}
              className={`${filters.activeTab === TAB_OPTIONS.all ? "bg-orange-500 hover:bg-orange-600" : "border-gray-200 dark:border-gray-700 bg-transparent"} whitespace-nowrap`}
            >
              All
            </Button>
            <Button
              variant={filters.activeTab === TAB_OPTIONS.books ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ activeTab: TAB_OPTIONS.books })}
              className={`${filters.activeTab === TAB_OPTIONS.books ? "bg-orange-500 hover:bg-orange-600" : "border-gray-200 dark:border-gray-700 bg-transparent"} whitespace-nowrap`}
            >
              Books
            </Button>
            <Button
              variant={filters.activeTab === TAB_OPTIONS.authors ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ activeTab: TAB_OPTIONS.authors })}
              className={`${filters.activeTab === TAB_OPTIONS.authors ? "bg-orange-500 hover:bg-orange-600" : "border-gray-200 dark:border-gray-700 bg-transparent"} whitespace-nowrap`}
            >
              Authors
            </Button>
            <Button
              variant={filters.activeTab === TAB_OPTIONS.giveaways ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ activeTab: TAB_OPTIONS.giveaways })}
              className={`${filters.activeTab === TAB_OPTIONS.giveaways ? "bg-orange-500 hover:bg-orange-600" : "border-gray-200 dark:border-gray-700 bg-transparent"} whitespace-nowrap`}
            >
              🎁 Giveaways
            </Button>
            
            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`gap-1 border-gray-200 dark:border-gray-700 bg-transparent ${
                showAdvancedFilters ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' : ''
              }`}
            >
              <Filter className="h-3 w-3" />
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 rounded-full p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Filter and Sort Controls */}
      {!isMobileView && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mx-4">
          <div className="flex items-center gap-2">
            <Button
              variant={filters.activeTab === TAB_OPTIONS.all ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ activeTab: TAB_OPTIONS.all })}
              className={
                filters.activeTab === TAB_OPTIONS.all
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "border-gray-200 dark:border-gray-700 bg-transparent"
              }
            >
              All
            </Button>
            <Button
              variant={filters.activeTab === TAB_OPTIONS.books ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ activeTab: TAB_OPTIONS.books })}
              className={
                filters.activeTab === TAB_OPTIONS.books
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "border-gray-200 dark:border-gray-700 bg-transparent"
              }
            >
              Books
            </Button>
            <Button
              variant={filters.activeTab === TAB_OPTIONS.authors ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ activeTab: TAB_OPTIONS.authors })}
              className={
                filters.activeTab === TAB_OPTIONS.authors
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "border-gray-200 dark:border-gray-700 bg-transparent"
              }
            >
              Authors
            </Button>
            <Button
              variant={filters.activeTab === TAB_OPTIONS.giveaways ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ activeTab: TAB_OPTIONS.giveaways })}
              className={
                filters.activeTab === TAB_OPTIONS.giveaways
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "border-gray-200 dark:border-gray-700 bg-transparent"
              }
            >
              Giveaways
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`gap-2 bg-transparent border-gray-200 dark:border-gray-700 ${
                showAdvancedFilters ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' : ''
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="mx-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Mobile Filters */}
          {isMobileView && (
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
                {/* Genre Filter */}
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
                        className={`text-xs ${
                          filters.selectedGenres.includes(genre) 
                            ? "bg-orange-500 hover:bg-orange-600" 
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {genre}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
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
                        className={`text-xs ${
                          filters.ratingFilter >= rating 
                            ? "bg-orange-500 hover:bg-orange-600" 
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {rating}+
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Giveaway Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Giveaway Status
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={filters.hasGiveaway === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGiveawayToggle(true)}
                      className={`text-xs ${
                        filters.hasGiveaway === true 
                          ? "bg-orange-500 hover:bg-orange-600" 
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      Has Giveaway
                    </Button>
                    <Button
                      variant={filters.hasGiveaway === false ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGiveawayToggle(false)}
                      className={`text-xs ${
                        filters.hasGiveaway === false 
                          ? "bg-orange-500 hover:bg-orange-600" 
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      No Giveaway
                    </Button>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange({ dateRange: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <option value={DATE_RANGE_OPTIONS.all}>All Time</option>
                    <option value={DATE_RANGE_OPTIONS.week}>This Week</option>
                    <option value={DATE_RANGE_OPTIONS.month}>This Month</option>
                    <option value={DATE_RANGE_OPTIONS.year}>This Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Filters */}
          {!isMobileView && (
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
                {/* Genre Filter */}
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
                        className={`text-xs ${
                          filters.selectedGenres.includes(genre) 
                            ? "bg-orange-500 hover:bg-orange-600" 
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {genre}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
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
                        className={`text-xs ${
                          filters.ratingFilter >= rating 
                            ? "bg-orange-500 hover:bg-orange-600" 
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {rating}+
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Giveaway Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Giveaway Status
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={filters.hasGiveaway === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGiveawayToggle(true)}
                      className={`text-xs ${
                        filters.hasGiveaway === true 
                          ? "bg-orange-500 hover:bg-orange-600" 
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      Has Giveaway
                    </Button>
                    <Button
                      variant={filters.hasGiveaway === false ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGiveawayToggle(false)}
                      className={`text-xs ${
                        filters.hasGiveaway === false 
                          ? "bg-orange-500 hover:bg-orange-600" 
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      No Giveaway
                    </Button>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange({ dateRange: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <option value={DATE_RANGE_OPTIONS.all}>All Time</option>
                    <option value={DATE_RANGE_OPTIONS.week}>This Week</option>
                    <option value={DATE_RANGE_OPTIONS.month}>This Month</option>
                    <option value={DATE_RANGE_OPTIONS.year}>This Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
