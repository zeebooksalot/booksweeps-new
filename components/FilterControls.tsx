"use client"

import { FilterState } from "@/types"
import { FilterTabs } from "./filters/FilterTabs"
import { FilterActions } from "./filters/FilterActions"
import { FilterOptions } from "./filters/FilterOptions"
import { useFilters } from "@/hooks/useFilters"

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
  const {
    showAdvancedFilters,
    toggleAdvancedFilters,
    getActiveFilterCount
  } = useFilters({
    initialFilters: filters,
    onFiltersChange: (newFilters) => {
      // This will be called by the hook, but we also need to call the parent's onFiltersChange
      onFiltersChange(newFilters)
    }
  })

  const filterButton = (
    <FilterActions
      filters={filters}
      showAdvancedFilters={showAdvancedFilters}
      onToggleAdvancedFilters={toggleAdvancedFilters}
      isMobileView={isMobileView}
    />
  )

  return (
    <>
      {/* Filter Tabs with Filter Button */}
      <FilterTabs
        filters={filters}
        onFiltersChange={onFiltersChange}
        isMobileView={isMobileView}
        filterButton={!isMobileView ? filterButton : undefined}
      />

      {/* Mobile Filter Actions */}
      {isMobileView && (
        <div className="px-4 mb-4">
          <div className="flex items-center justify-end">
            {filterButton}
          </div>
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="mx-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FilterOptions
            filters={filters}
            onFiltersChange={onFiltersChange}
            onResetFilters={onResetFilters}
            isMobileView={isMobileView}
          />
        </div>
      )}
    </>
  )
}
