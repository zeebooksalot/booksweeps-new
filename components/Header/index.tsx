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
      <div className="mx-auto max-w-6xl px-4 py-3 md:py-4 lg:px-0">
        <div className="flex items-center">
          {/* Left cluster: Logo + Nav */}
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
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 flex justify-center px-4">
            <div className="w-full max-w-md">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                className="hidden md:block w-full"
              />
            </div>
          </div>

          {/* Right: User actions */}
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
