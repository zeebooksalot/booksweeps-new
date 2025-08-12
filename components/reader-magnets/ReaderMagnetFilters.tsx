"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import { ReaderMagnetFiltersProps } from "@/types/reader-magnets"
import { READER_MAGNET_FORMATS, READER_MAGNET_TEXT, READER_MAGNET_STYLES } from "@/constants/reader-magnets"

export function ReaderMagnetFilters({ 
  filters, 
  onFiltersChange, 
  onResetFilters, 
  isMobileView, 
  uniqueGenres 
}: ReaderMagnetFiltersProps) {
  const getActiveFilterCount = () => {
    return [
      filters.selectedGenre !== 'all',
      filters.selectedFormat !== 'all'
    ].filter(Boolean).length
  }

  const activeFilterCount = getActiveFilterCount()

  const renderGenreFilter = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {READER_MAGNET_TEXT.filters.genre}
      </label>
      <Select value={filters.selectedGenre} onValueChange={(value) => onFiltersChange({ selectedGenre: value })}>
        <SelectTrigger>
          <SelectValue placeholder={READER_MAGNET_TEXT.filters.allGenres} />
        </SelectTrigger>
        <SelectContent>
          {uniqueGenres.map((genre) => (
            <SelectItem key={genre} value={genre}>
              {genre === 'all' ? READER_MAGNET_TEXT.filters.allGenres : genre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const renderFormatFilter = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {READER_MAGNET_TEXT.filters.format}
      </label>
      <Select value={filters.selectedFormat} onValueChange={(value) => onFiltersChange({ selectedFormat: value })}>
        <SelectTrigger>
          <SelectValue placeholder={READER_MAGNET_TEXT.filters.allFormats} />
        </SelectTrigger>
        <SelectContent>
          {READER_MAGNET_FORMATS.map((format) => (
            <SelectItem key={format.value} value={format.value}>
              {format.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
              {READER_MAGNET_TEXT.filters.title}
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 rounded-full p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Advanced Filters Panel */}
        {filters.showAdvancedFilters && (
          <div className="mx-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {READER_MAGNET_TEXT.filters.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {READER_MAGNET_TEXT.filters.clearAll}
              </Button>
            </div>
            
            <div className="space-y-4">
              {renderGenreFilter()}
              {renderFormatFilter()}
            </div>
          </div>
        )}
      </>
    )
  }

  // Desktop sidebar filters
  return (
    <div className="mb-8 flex flex-col gap-4">
      <h2 className="text-18 font-semibold text-gray-900 dark:text-gray-100">
        {READER_MAGNET_TEXT.filters.title}
      </h2>
      
      <div className={READER_MAGNET_STYLES.filterPanel}>
        <div className="space-y-4">
          {renderGenreFilter()}
          {renderFormatFilter()}
        </div>
      </div>
    </div>
  )
}
