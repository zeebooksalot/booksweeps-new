"use client"

import { GiveawayCardSkeleton } from "./GiveawayCardSkeleton"

interface GiveawayListSkeletonProps {
  isMobileView?: boolean
  count?: number
}

export function GiveawayListSkeleton({ isMobileView = false, count = 6 }: GiveawayListSkeletonProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <GiveawayCardSkeleton key={index} isMobileView={isMobileView} />
      ))}
    </div>
  )
}
