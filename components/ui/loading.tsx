"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-200 border-t-orange-500",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Skeleton components for better loading states
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-700", className)}
      {...props}
    />
  )
}

export function FeedItemSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-start space-x-4 p-6">
        {/* Cover/Avatar skeleton */}
        <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
        
        {/* Content skeleton */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Title skeleton */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          
          {/* Author/Name skeleton */}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
          
          {/* Stats skeleton */}
          <div className="flex items-center space-x-4">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-14"></div>
          </div>
        </div>
        
        {/* Action button skeleton */}
        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
  )
}

export function MobileCardSkeleton() {
  return (
    <div className="animate-pulse mx-4 mb-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Cover skeleton */}
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
        
        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex justify-between items-center mt-4">
          <div className="w-16 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="w-16 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

export function FilterSkeleton() {
  return (
    <div className="animate-pulse mx-4 mb-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
      </div>
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Loading overlay for full-page loading states
export function LoadingOverlay({ 
  message = "Loading...", 
  showSpinner = true 
}: { 
  message?: string
  showSpinner?: boolean 
}) {
  return (
    <div 
      className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 flex items-center justify-center z-50"
      role="status"
      aria-label="Loading content"
    >
      <div className="text-center">
        {showSpinner && <LoadingSpinner size="lg" className="mb-4" />}
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}

// Progressive loading indicator
export function ProgressiveLoader({ 
  progress, 
  message 
}: { 
  progress: number
  message?: string 
}) {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>{message || "Loading..."}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  )
}
