"use client"

import { useState } from "react"
import Link from "next/link"
import { SearchBar } from "./SearchBar"
import { Navigation } from "./Navigation"
import { UserActions } from "./UserActions"
import { MobileMenu } from "./MobileMenu"
import { LoadingSpinner } from "@/components/ui/loading"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  isMobileView: boolean
}

export function Header({ searchQuery, onSearchChange, isMobileView }: HeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  return (
    <header 
      className="fixed top-0 z-20 w-full border-b-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-6xl px-4 py-3 md:py-4 lg:px-0">
        <div className="flex items-center justify-between">
          {/* Mobile Layout */}
          <div className="flex items-center gap-3 md:gap-8 w-full md:w-auto">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2"
              aria-label="BookSweeps home page"
            >
              <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                BookSweeps
              </span>
            </Link>

            {/* Mobile Search */}
            <div className="flex-1 md:hidden">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                showMobileToggle={true}
                onMobileToggle={setShowMobileSearch}
                isMobileSearchOpen={showMobileSearch}
              />
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>

          {/* Desktop Search */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            className="hidden md:block"
          />

          {/* Desktop Navigation */}
          <Navigation />

          {/* Desktop Actions */}
          <UserActions />
        </div>
      </div>
    </header>
  )
}
