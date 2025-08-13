import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

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
