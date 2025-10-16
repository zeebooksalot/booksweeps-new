"use client"

import { GiveawayListProps } from "@/types/giveaways"
import { GiveawayDirectoryCard } from "./GiveawayDirectoryCard"

export function GiveawayDirectoryList({ giveaways, onEnter, isMobileView }: GiveawayListProps) {
  if (giveaways.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {giveaways.map((giveaway) => (
        <GiveawayDirectoryCard
          key={giveaway.id}
          giveaway={giveaway}
          onEnter={onEnter}
          isMobileView={isMobileView}
        />
      ))}
    </div>
  )
}
