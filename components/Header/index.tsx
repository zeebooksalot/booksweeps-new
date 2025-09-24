"use client"

import React from "react"
import { useState } from "react"
import Link from "next/link"
import { SearchBar } from "./SearchBar"
import { Button } from "@/components/ui/button"
import { Navigation } from "./Navigation"
import { UserActions } from "./UserActions"
import { MobileMenu } from "./MobileMenu"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export const Header = React.memo(({ searchQuery, onSearchChange }: HeaderProps) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  return (
    <header 
      className="fixed top-0 z-20 w-full border-b border-border bg-background transition-colors"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-6xl px-4 py-3 md:py-4 lg:px-0">
        <div className="flex items-center justify-between">
          {/* Left cluster: Logo + Nav + Search */}
          <div className="flex items-center gap-4 md:gap-6 flex-1">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2"
              aria-label="BookSweeps home page"
            >
              <span className="text-lg md:text-xl font-bold text-foreground">
                BookSweeps
              </span>
            </Link>

            {/* Desktop Navigation */}
            <Navigation />

            {/* Desktop Search (stretches) */}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              className="hidden md:block"
            />

          </div>

          {/* Right: Sign in / user actions (keep at far right) */}
          <div className="flex items-center gap-3">
            <UserActions />
            {/* Mobile Menu */}
            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
})

Header.displayName = 'Header'
