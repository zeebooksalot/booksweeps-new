"use client"

import { GiveawayListProps } from "@/types/giveaways"
import { GiveawayCard } from "./GiveawayCard"

export function GiveawayList({ giveaways, onEnter, isMobileView }: GiveawayListProps) {
  if (giveaways.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {giveaways.map((giveaway) => (
        <GiveawayCard
          key={giveaway.id}
          giveaway={giveaway}
          onEnter={onEnter}
          isMobileView={isMobileView}
        />
      ))}
    </div>
  )
}
