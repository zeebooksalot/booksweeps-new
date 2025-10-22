"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { EnhancedAvatar } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Sun, Moon, Monitor } from "lucide-react"
import Link from "next/link"
import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { createAuthDebugLogger, debugNavigation } from "@/lib/debug-utils"

interface UserActionsProps {
  className?: string
}

export function UserActions({ className = "" }: UserActionsProps) {
  const { user, userProfile, signOut } = useAuth()
  const { setTheme, theme } = useTheme()
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
                <EnhancedAvatar
                  src={userProfile?.avatar_url}
                  email={user?.email}
                  name={userProfile?.display_name || undefined}
                  size={32}
                  alt={user?.email || "User"}
                />
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
              <DropdownMenuItem onClick={() => {
                if (theme === "light") setTheme("dark")
                else if (theme === "dark") setTheme("system")
                else setTheme("light")
              }} className="theme-toggle-menu-item">
                Toggle Theme
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
          <Button variant="ghost" size="sm" onClick={() => {
            if (theme === "light") setTheme("dark")
            else if (theme === "dark") setTheme("system")
            else setTheme("light")
          }} className="h-9 w-9 px-0">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
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
