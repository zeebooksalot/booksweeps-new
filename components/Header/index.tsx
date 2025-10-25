"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { SearchBar } from "./SearchBar"
import { Button } from "@/components/ui/button"
import { Navigation } from "./Navigation"
import { UserActions } from "./UserActions"
import { MobileMenu } from "./MobileMenu"
import { useAuth } from "@/components/auth/AuthProvider"
import { Home } from "lucide-react"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export const Header = React.memo(({ searchQuery, onSearchChange }: HeaderProps) => {
  const { user } = useAuth()
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 z-20 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-background/95 backdrop-blur-md border-b border-border shadow-sm' 
          : 'bg-transparent border-b border-transparent'
      }`}
      role="banner"
      aria-label="Main navigation"
      suppressHydrationWarning
    >
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center gap-4">
          {/* Left cluster: Logo + Homepage icon + Nav */}
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

            {/* Homepage icon for logged-in users */}
            {isHydrated && user && (
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 hover:border-yellow-500/40 transition-colors"
                aria-label="Go to dashboard"
                title="Dashboard"
              >
                <Home className="h-5 w-5 text-yellow-600" />
              </Link>
            )}

            {/* Desktop Navigation */}
            <Navigation />
          </div>

          {/* Right: Search + User actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Search Bar */}
            <div className="hidden md:block">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                className="w-64"
                isTransparent={!isScrolled}
              />
            </div>
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
