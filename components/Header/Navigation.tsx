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
      label: "Giveaways",
      href: "/book-giveaways"
    },
    {
      label: "Books",
      href: "/free-ebooks"
    },
    {
      label: "Authors",
      href: "/authors"
    }
  ], [])

  return (
    <nav className={`hidden md:flex items-center gap-6 lg:gap-8 ${className}`} role="navigation" aria-label="Main navigation">
      {navigationItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="text-16 font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-110 underline-offset-4 hover:underline whitespace-nowrap"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
