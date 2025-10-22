"use client"

import { useMemo } from "react"
import Link from "next/link"

interface NavigationProps {
  className?: string
}

export function Navigation({ className = "" }: NavigationProps) {
  // Memoized navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(() => [
    {
      label: "Books",
      href: "/free-ebooks"
    },
    {
      label: "Authors",
      href: "/authors"
    },
    {
      label: "Giveaways",
      href: "/book-giveaways"
    }
  ], [])

  return (
    <nav className={`hidden md:flex items-center gap-6 lg:gap-8 ${className}`} role="navigation" aria-label="Main navigation">
      {navigationItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="text-16 font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground whitespace-nowrap"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
