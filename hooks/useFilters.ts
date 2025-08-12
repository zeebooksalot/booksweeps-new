"use client"

import { useState, useEffect, useCallback } from "react"
import { FilterState } from "@/types"

interface UseFiltersProps {
  initialFilters: FilterState
  onFiltersChange?: (filters: FilterState) => void
}

export function useFilters({ 
  initialFilters, 
  onFiltersChange 
}: UseFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Update showAdvancedFilters when filters change
  useEffect(() => {
    setShowAdvancedFilters(filters.showAdvancedFilters)
  }, [filters.showAdvancedFilters])

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }, [filters, onFiltersChange])

  const resetFilters = useCallback(() => {
    const resetFilters = {
      ...initialFilters,
      selectedGenres: [],
      ratingFilter: 0,
      hasGiveaway: null,
      dateRange: "all"
    }
    setFilters(resetFilters)
    
    if (onFiltersChange) {
      onFiltersChange(resetFilters)
    }
  }, [initialFilters, onFiltersChange])

  const toggleAdvancedFilters = useCallback(() => {
    setShowAdvancedFilters(prev => !prev)
  }, [])

  const getActiveFilterCount = useCallback(() => {
    return [
      filters.selectedGenres.length > 0,
      filters.ratingFilter > 0,
      filters.hasGiveaway !== null,
      filters.dateRange !== "all"
    ].filter(Boolean).length
  }, [filters])

  return {
    filters,
    showAdvancedFilters,
    updateFilters,
    resetFilters,
    toggleAdvancedFilters,
    getActiveFilterCount
  }
}
