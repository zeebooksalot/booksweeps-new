"use client"

import { Loader2, BookOpen, User, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <Loader2 
      className={cn(
        "animate-spin text-orange-500",
        sizeClasses[size],
        className
      )} 
    />
  )
}

interface LoadingCardProps {
  type?: "book" | "author" | "generic"
  className?: string
}

export function LoadingCard({ type = "generic", className }: LoadingCardProps) {
  const icons = {
    book: BookOpen,
    author: User,
    generic: Search
  }

  const Icon = icons[type]

  return (
    <div className={cn(
      "animate-pulse bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4",
      className
    )}>
      <div className="flex items-center space-x-4">
        <div className="rounded-lg bg-gray-200 dark:bg-gray-700 h-12 w-12 flex items-center justify-center">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
}

interface LoadingGridProps {
  count?: number
  type?: "book" | "author" | "generic"
  className?: string
}

export function LoadingGrid({ count = 6, type = "generic", className }: LoadingGridProps) {
  return (
    <div className={cn("grid gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} type={type} />
      ))}
    </div>
  )
}

interface LoadingPageProps {
  message?: string
  className?: string
}

export function LoadingPage({ message = "Loading...", className }: LoadingPageProps) {
  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900",
      className
    )}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ isVisible, message = "Loading...", className }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
      className
    )}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center space-x-3">
          <LoadingSpinner size="md" />
          <span className="text-gray-700 dark:text-gray-300">{message}</span>
        </div>
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  )
}
