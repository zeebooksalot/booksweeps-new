"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"
import { FilterState } from "@/types"

interface FilterActionsProps {
  filters: FilterState
  showAdvancedFilters: boolean
  onToggleAdvancedFilters: () => void
  isMobileView?: boolean
}

export function FilterActions({ 
  filters, 
  showAdvancedFilters, 
  onToggleAdvancedFilters, 
  isMobileView = false 
}: FilterActionsProps) {
  const getActiveFilterCount = () => {
    return [
      filters.selectedGenres.length > 0,
      filters.ratingFilter > 0,
      filters.hasGiveaway !== null,
      filters.dateRange !== "all"
    ].filter(Boolean).length
  }

  const activeFilterCount = getActiveFilterCount()

  const getButtonClass = () => {
    return `gap-${isMobileView ? '1' : '2'} bg-transparent border-gray-200 dark:border-gray-700 text-black dark:text-black hover:bg-black hover:text-white ${
      showAdvancedFilters ? 'bg-black text-white border-black' : ''
    }`
  }

  if (isMobileView) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleAdvancedFilters}
        className={getButtonClass()}
      >
        <Filter className="h-3 w-3" />
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1 h-4 w-4 rounded-full p-0 text-xs">
            {activeFilterCount}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleAdvancedFilters}
        className={getButtonClass()}
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
  )
}
