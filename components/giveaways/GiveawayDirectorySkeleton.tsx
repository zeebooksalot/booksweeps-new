"use client"

import { GiveawayDirectoryCardSkeleton } from "./GiveawayDirectoryCardSkeleton"

interface GiveawayDirectorySkeletonProps {
  isMobileView?: boolean
  count?: number
}

export function GiveawayDirectorySkeleton({ isMobileView = false, count = 6 }: GiveawayDirectorySkeletonProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <GiveawayDirectoryCardSkeleton key={index} isMobileView={isMobileView} />
      ))}
    </div>
  )
}
