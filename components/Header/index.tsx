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
      className="fixed top-0 z-20 w-full border-b border-border bg-white dark:bg-background transition-colors"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center gap-4">
          {/* Left cluster: Logo + Nav + Search */}
          <div className="flex items-center gap-4 md:gap-6">
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

            {/* Search Bar */}
            <div className="hidden md:block">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                className="w-64"
              />
            </div>
          </div>

          {/* Right: User actions */}
          <div className="flex items-center gap-3 ml-auto">
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
