"use client"

import { ReaderMagnetFilters } from "./ReaderMagnetFilters"
import { ReaderMagnetFiltersProps } from "@/types/reader-magnets"
import { READER_MAGNET_TEXT, READER_MAGNET_STYLES } from "@/constants/reader-magnets"

interface ReaderMagnetSidebarProps extends Omit<ReaderMagnetFiltersProps, 'isMobileView'> {
  feedItemsCount: number
}

export function ReaderMagnetSidebar({ 
  filters, 
  onFiltersChange, 
  onResetFilters, 
  uniqueGenres, 
  feedItemsCount 
}: ReaderMagnetSidebarProps) {
  return (
    <aside className={READER_MAGNET_STYLES.sidebar}>
      <ReaderMagnetFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        onResetFilters={onResetFilters}
        isMobileView={false}
        uniqueGenres={uniqueGenres}
      />
      
      {/* Results Count */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {READER_MAGNET_TEXT.filters.resultsCount(feedItemsCount)}
        </div>
      </div>
    </aside>
  )
}
