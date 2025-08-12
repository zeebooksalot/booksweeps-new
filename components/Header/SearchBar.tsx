"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  placeholder?: string
  className?: string
  showMobileToggle?: boolean
  onMobileToggle?: (show: boolean) => void
  isMobileSearchOpen?: boolean
}

import { useSimpleDebouncedSearch } from "@/hooks/use-debounced-search"

export function SearchBar({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Search books, authors...",
  className = "",
  showMobileToggle = false,
  onMobileToggle,
  isMobileSearchOpen = false
}: SearchBarProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Debounced search implementation
  const debouncedSearchChange = useSimpleDebouncedSearch(onSearchChange, 300)

  // Update local search query when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  // Handle search input change with debouncing
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchQuery(value)
    debouncedSearchChange(value)
  }, [debouncedSearchChange])

  // Mobile search toggle
  const handleMobileToggle = useCallback(() => {
    if (onMobileToggle) {
      onMobileToggle(!isMobileSearchOpen)
    }
  }, [onMobileToggle, isMobileSearchOpen])

  if (showMobileToggle) {
    return (
      <div className="flex items-center gap-2">
        {isMobileSearchOpen ? (
          <>
            <div className="relative flex-1">
              <Search 
                className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" 
                aria-hidden="true"
              />
              <Input
                placeholder={placeholder}
                value={localSearchQuery}
                onChange={handleSearchChange}
                className="h-10 w-full rounded-full border-0 bg-gray-100 dark:bg-gray-700 pl-10 pr-12 text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none"
                autoFocus
                aria-label="Search books and authors"
                role="searchbox"
              />
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMobileToggle}
              className="px-2"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMobileToggle}
              className="px-2"
              aria-label="Open search"
            >
              <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Search 
        className="absolute left-4 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" 
        aria-hidden="true"
      />
      <Input
        placeholder={placeholder}
        value={localSearchQuery}
        onChange={handleSearchChange}
        className="h-10 w-full min-w-[200px] max-w-[250px] cursor-pointer appearance-none rounded-full border-0 bg-gray-100 dark:bg-gray-700 px-10 pl-[40px] text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none"
        aria-label="Search books and authors"
        role="searchbox"
      />
    </div>
  )
}
