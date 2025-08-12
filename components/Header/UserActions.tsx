"use client"

import { useCallback } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/AuthProvider-refactored"

interface UserActionsProps {
  className?: string
}

export function UserActions({ className = "" }: UserActionsProps) {
  const { user, signOut } = useAuth()

  // Handle sign out with proper error handling
  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }, [signOut])

  return (
    <div className={`hidden md:flex items-center gap-3 ${className}`}>
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
  )
}
