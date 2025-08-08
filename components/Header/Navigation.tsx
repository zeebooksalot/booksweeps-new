"use client"

import React from "react"
import { useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface NavigationProps {
  className?: string
}

export const Navigation = React.memo(function Navigation({ className = "" }: NavigationProps) {
  // Memoized navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(() => [
    {
      label: "Books",
      href: "#",
      hasDropdown: true,
      dropdownItems: [
        { label: "All Books", href: "#" },
        { label: "New Releases", href: "#" },
        { label: "Bestsellers", href: "#" },
        { label: "Coming Soon", href: "#" }
      ]
    },
    {
      label: "Authors",
      href: "#",
      hasDropdown: true,
      dropdownItems: [
        { label: "All Authors", href: "#" },
        { label: "Featured Authors", href: "#" },
        { label: "New Authors", href: "#" }
      ]
    },
    {
      label: "Giveaways",
      href: "/giveaways"
    }
  ], [])

  return (
    <nav className={`hidden md:flex items-center space-x-6 ${className}`} role="navigation" aria-label="Main navigation">
      {navigationItems.map((item) => (
        <div key={item.label}>
          {item.hasDropdown ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  {item.label}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {item.dropdownItems?.map((dropdownItem) => (
                  <DropdownMenuItem key={dropdownItem.label} asChild>
                    <Link href={dropdownItem.href}>{dropdownItem.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          )}
        </div>
      ))}
    </nav>
  )
})
