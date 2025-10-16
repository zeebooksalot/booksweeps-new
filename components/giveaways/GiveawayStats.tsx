"use client"

import { Giveaway } from "@/types/giveaways"
import { CountdownTimer } from "./CountdownTimer"

interface GiveawayStatsProps {
  giveaway: Giveaway
}

export function GiveawayStats({ giveaway }: GiveawayStatsProps) {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Entries</span>
        <span className="font-semibold">{giveaway.entry_count}/{giveaway.max_entries}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Winners</span>
        <span className="font-semibold">{giveaway.number_of_winners}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Time Remaining</span>
        <CountdownTimer endDate={giveaway.end_date} />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Ends</span>
        <span className="font-semibold">
          {new Date(giveaway.end_date).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
