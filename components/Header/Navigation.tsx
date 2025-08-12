"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NavigationItem {
  label: string
  href: string
  dropdownItems?: DropdownItem[]
}

interface DropdownItem {
  label: string
  href: string
}

interface NavigationProps {
  className?: string
}

export function Navigation({ className = "" }: NavigationProps) {
  // Memoized navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(() => [
    {
      label: "Books",
      href: "#",
      dropdownItems: [
        { label: "Free Books", href: "/free-books" },
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
    <nav className={`hidden md:flex items-center gap-6 lg:gap-8 ${className}`} role="navigation" aria-label="Main navigation">
      {navigationItems.map((item) => (
        item.dropdownItems && item.dropdownItems.length > 0 ? (
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
  )
}
