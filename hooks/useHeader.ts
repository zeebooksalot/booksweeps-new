import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

// Custom hook for debounced search
export const useDebouncedSearch = (callback: (query: string) => void, delay: number = 300) => {
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

export const useHeader = () => {
  const { user, signOut } = useAuth()
  const [showMobileSearch, setShowMobileSearch] = useState(false)

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

  return {
    user,
    showMobileSearch,
    setShowMobileSearch,
    handleSignOut,
    navigationItems
  }
}
