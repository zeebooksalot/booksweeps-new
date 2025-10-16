"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { createAuthDebugLogger, debugNavigation } from "@/lib/debug-utils"

interface UserActionsProps {
  className?: string
}

export function UserActions({ className = "" }: UserActionsProps) {
  const { user, userProfile, signOut } = useAuth()
  const router = useRouter()

  // Use the new debug utilities
  const debug = createAuthDebugLogger('UserActions')

  // Handle sign out with proper error handling
  const handleSignOut = useCallback(async () => {
    try {
      debug.log('UserActions: Starting sign out...')
      await signOut()
      // The signOut function will handle the redirect to homepage
    } catch (error) {
      debug.logSignOutError(error, user?.id)
      
      // Force redirect to homepage even if sign out fails
      if (typeof window !== 'undefined') {
        debug.log('UserActions: Forcing redirect after sign out failure')
        const navigation = debugNavigation('/', 'router')
        try {
          router.push('/')
          navigation.success()
        } catch (routerError) {
          navigation.failure(routerError)
          debug.log('UserActions: Router fallback failed, using window.location', { routerError })
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

  return (
    <div className={`hidden md:flex items-center gap-3 ${className}`}>
      {user ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="h-8 w-8">
                  {userProfile?.avatar_url ? (
                    <AvatarImage 
                      src={userProfile.avatar_url} 
                      alt={user?.email || "User"}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {(() => {
                      const name = userProfile?.display_name || user?.email || "";
                      if (name.includes(" ")) {
                        // If display name has spaces, use first letter of first and last word
                        const words = name.split(" ");
                        return (words[0]?.charAt(0) || "") + (words[words.length - 1]?.charAt(0) || "");
                      } else if (name.includes("@")) {
                        // If email, use first letter of name part and first letter after @
                        const [namePart, domainPart] = name.split("@");
                        return (namePart?.charAt(0) || "") + (domainPart?.charAt(0) || "");
                      } else {
                        // Fallback to first two characters
                        return name.substring(0, 2).toUpperCase();
                      }
                    })()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 py-2">
                  <p className="text-base font-semibold leading-none">{userProfile?.display_name || user?.email}</p>
                  <p className="text-sm text-muted-foreground leading-none">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard')} className="profile-menu-item">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard?tab=profile')} className="settings-menu-item">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive signout-menu-item"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <>
          <ThemeToggle />
          <Link href="/signup" className="hidden md:block">
            <Button variant="outline" className="rounded-md">Subscribe</Button>
          </Link>
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            aria-label="Sign in to your account"
          >
            Sign in
          </Link>
        </>
      )}
    </div>
  )
}
