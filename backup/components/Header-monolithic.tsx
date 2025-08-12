"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { Search, ChevronDown, Mail, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/components/auth/AuthProvider"

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  isMobileView: boolean
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

export function Header({ searchQuery, onSearchChange, isMobileView }: HeaderProps) {
  const { user, signOut } = useAuth()
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  // Debounced search implementation
  const debouncedSearchChange = useDebouncedSearch(onSearchChange, 300)

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

  // Handle sign out with proper error handling
  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }, [signOut])

  // Memoized navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(() => [
    {
      label: "Books",
      href: "#",
      dropdownItems: [
        { label: "New Releases", href: "#" },
        { label: "Bestsellers", href: "#" },
        { label: "By Genre", href: "#" }
      ]
    },
    {
      label: "Authors",
      href: "#",
      dropdownItems: [
        { label: "Featured Authors", href: "#" },
        { label: "New Authors", href: "#" },
        { label: "Author Interviews", href: "#" }
      ]
    },
    {
      label: "Giveaways",
      href: "/giveaways",
      dropdownItems: []
    }
  ], [])

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

            {/* Mobile Search Toggle */}
            <div className="flex-1 md:hidden">
              <div className="flex items-center gap-2">
                {showMobileSearch ? (
                  <>
                    <div className="relative flex-1">
                      <Search 
                        className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" 
                        aria-hidden="true"
                      />
                      <Input
                        placeholder="Search books, authors..."
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
                      onClick={() => setShowMobileSearch(false)} 
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
                      onClick={() => setShowMobileSearch(true)} 
                      className="px-2"
                      aria-label="Open search"
                    >
                      <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </Button>

                    {/* Mobile Menu */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="px-2 md:hidden"
                          aria-label="Open navigation menu"
                        >
                          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent 
                        side="right" 
                        className="w-80 bg-white dark:bg-gray-800"
                        aria-label="Navigation menu"
                      >
                        <div className="flex flex-col gap-6 pt-6">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              BookSweeps
                            </span>
                          </div>

                          <nav className="flex flex-col gap-4" role="navigation" aria-label="Main navigation">
                            {navigationItems.map((item) => (
                              <Link
                                key={item.label}
                                href={item.href}
                                className="text-16 font-semibold text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </nav>

                          <div className="flex flex-col gap-3">
                            <Button
                              asChild
                              variant="outline"
                              className="justify-start gap-2 bg-transparent border-gray-200 dark:border-gray-700"
                            >
                              <Link href="/signup" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" aria-hidden="true" />
                                Subscribe to Newsletter
                              </Link>
                            </Button>
                            {user ? (
                              <>
                                <Button 
                                  asChild 
                                  variant="outline" 
                                  className="justify-start gap-2 bg-transparent border-gray-200 dark:border-gray-700"
                                >
                                  <Link href="/dashboard">Dashboard</Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="justify-start gap-2 bg-transparent border-gray-200 dark:border-gray-700"
                                  onClick={handleSignOut}
                                  aria-label="Sign out"
                                >
                                  Sign out
                                </Button>
                              </>
                            ) : (
                              <Button 
                                asChild 
                                variant="outline" 
                                className="justify-start gap-2 bg-transparent border-gray-200 dark:border-gray-700"
                              >
                                <Link href="/login">
                                  <span>Sign In</span>
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </>
                )}
              </div>
            </div>

            {/* Desktop Search */}
            <div className="relative hidden md:block">
              <Search 
                className="absolute left-4 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" 
                aria-hidden="true"
              />
              <Input
                placeholder="Search books, authors..."
                value={localSearchQuery}
                onChange={handleSearchChange}
                className="h-10 w-full min-w-[200px] max-w-[250px] cursor-pointer appearance-none rounded-full border-0 bg-gray-100 dark:bg-gray-700 px-10 pl-[40px] text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none"
                aria-label="Search books and authors"
                role="searchbox"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8" role="navigation" aria-label="Main navigation">
            {navigationItems.map((item) => (
              item.dropdownItems.length > 0 ? (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="flex items-center gap-1 text-16 font-semibold text-gray-600 dark:text-gray-400 transition-colors duration-300 hover:text-orange-500 focus:outline-none whitespace-nowrap"
                      aria-label={`${item.label} menu`}
                      aria-haspopup="true"
                    >
                      <span>{item.label}</span>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <ChevronDown className="h-4 w-4 transition-transform duration-200" style={{ transformOrigin: 'center' }} />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg"
                    align="start"
                    sideOffset={8}
                    aria-label={`${item.label} submenu`}
                  >
                    {item.dropdownItems.map((dropdownItem) => (
                      <DropdownMenuItem 
                        key={dropdownItem.label}
                        className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Link href={dropdownItem.href}>{dropdownItem.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-16 font-semibold text-gray-600 dark:text-gray-400 transition-colors duration-300 hover:text-orange-500 whitespace-nowrap"
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/signup"
              className="flex h-10 items-center gap-1 rounded-full border-2 border-gray-200 dark:border-gray-700 px-4 text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              aria-label="Subscribe to newsletter"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Subscribe
            </Link>
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center h-10 px-4 rounded-full bg-orange-500 text-16 font-semibold text-white hover:bg-orange-600 transition-colors"
                  aria-label="Go to dashboard"
                >
                  Dashboard
                </Link>
                <Button
                  variant="outline"
                  className="h-10 px-4 rounded-full border-2 border-gray-200 dark:border-gray-700 text-16 font-semibold text-gray-600 dark:text-gray-400 hover:border-orange-500"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center h-10 px-4 rounded-full bg-orange-500 text-16 font-semibold text-white hover:bg-orange-600 transition-colors"
                aria-label="Sign in to your account"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
