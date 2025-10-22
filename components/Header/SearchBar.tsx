"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  isTransparent?: boolean
}

// Custom hook for debounced search
const useDebouncedSearch = (callback: (query: string) => void, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => {
      callback(debouncedValue)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [debouncedValue, callback, delay])

  return setDebouncedValue
}

export function SearchBar({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Search...",
  className = "",
  showMobileToggle = false,
  onMobileToggle,
  isMobileSearchOpen = false,
  isTransparent = false
}: SearchBarProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search implementation
  const debouncedSearchChange = useDebouncedSearch(onSearchChange, 300)

  // Update local search query when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  // Handle CMD + K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

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
                className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" 
                aria-hidden="true"
              />
              <Input
                ref={inputRef}
                placeholder={placeholder}
                value={localSearchQuery}
                onChange={handleSearchChange}
                className="h-10 w-full rounded-full border-0 bg-muted pl-10 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none"
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
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Search 
        className={`absolute left-4 top-3 h-4 w-4 z-10 ${isTransparent ? 'text-gray-600' : 'text-muted-foreground'}`}
        aria-hidden="true"
      />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={localSearchQuery}
        onChange={handleSearchChange}
        className={`h-10 w-full md:min-w-[240px] md:max-w-[420px] lg:max-w-[520px] cursor-pointer appearance-none rounded-full px-10 pl-[40px] pr-20 text-foreground placeholder:text-muted-foreground focus:outline-none ${
          isTransparent 
            ? 'bg-white/50 backdrop-blur-sm border border-gray-200' 
            : 'bg-muted border border-border'
        }`}
        aria-label="Search books and authors"
        role="searchbox"
      />
      {/* Keyboard shortcut hint */}
      <div className="absolute right-3 top-2 hidden md:flex items-center gap-1 text-xs text-muted-foreground">
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </div>
  )
}
