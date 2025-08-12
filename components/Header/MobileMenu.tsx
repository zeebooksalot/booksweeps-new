"use client"

import { useCallback, useMemo } from "react"
import Link from "next/link"
import { Mail, Menu, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/components/auth/AuthProvider"

interface MobileMenuProps {
  className?: string
}

export function MobileMenu({ className = "" }: MobileMenuProps) {
  const { user, signOut } = useAuth()

  // Memoized navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(() => [
    {
      label: "Books",
      href: "#",
      subItems: [
        { label: "Free Books", href: "/free-books" },
        { label: "New Releases", href: "#" },
        { label: "Bestsellers", href: "#" },
        { label: "By Genre", href: "#" }
      ]
    },
    {
      label: "Authors",
      href: "#",
      subItems: [
        { label: "Featured Authors", href: "#" },
        { label: "New Authors", href: "#" },
        { label: "Author Interviews", href: "#" }
      ]
    },
    {
      label: "Giveaways",
      href: "/giveaways",
      subItems: []
    }
  ], [])

  // Handle sign out with proper error handling
  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }, [signOut])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`px-2 md:hidden ${className}`}
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
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="flex flex-col gap-6 pt-6">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              BookSweeps
            </span>
          </div>

          <nav className="flex flex-col gap-4" role="navigation" aria-label="Main navigation">
            {navigationItems.map((item) => (
              item.subItems && item.subItems.length > 0 ? (
                <Collapsible key={item.label}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="justify-between w-full text-16 font-semibold text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {item.label}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-2">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.label}
                        href={subItem.href}
                        className="block text-14 text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-16 font-semibold text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {item.label}
                </Link>
              )
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
                  onClick={handleSignOut}
                  className="justify-start gap-2 bg-transparent border-gray-200 dark:border-gray-700"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  asChild 
                  variant="outline" 
                  className="justify-start gap-2 bg-transparent border-gray-200 dark:border-gray-700"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button 
                  asChild 
                  className="justify-start gap-2"
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
