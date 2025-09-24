"use client"

import { useMemo, useCallback } from "react"
import Link from "next/link"
import { Mail, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRouter } from "next/navigation"
import { createAuthDebugLogger, debugNavigation } from "@/lib/debug-utils"


export function MobileMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  // Use the new debug utilities
  const debug = createAuthDebugLogger('MobileMenu')

  // Handle sign out with proper error handling
  const handleSignOut = useCallback(async () => {
    try {
      debug.log('MobileMenu: Starting sign out...')
      await signOut()
      // The signOut function will handle the redirect to homepage
    } catch (error) {
      debug.logSignOutError(error, user?.id)
      
      // Force redirect to homepage even if sign out fails
      if (typeof window !== 'undefined') {
        debug.log('MobileMenu: Forcing redirect after sign out failure')
        const navigation = debugNavigation('/', 'router')
        try {
          router.push('/')
          navigation.success()
        } catch (routerError) {
          navigation.failure(routerError)
          debug.log('MobileMenu: Router fallback failed, using window.location', { routerError })
          const fallbackNavigation = debugNavigation('/', 'window.location')
          try {
            window.location.replace('/')
            fallbackNavigation.success()
          } catch (locationError) {
            fallbackNavigation.failure(locationError)
          }
        }
      }
    }
  }, [signOut, router, debug, user])

  // Memoized navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(() => [
    {
      label: "Books",
      href: "#",
      dropdownItems: [
        { label: "Free Ebooks", href: "/free-ebooks" },
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
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="px-2"
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
  )
}
