"use client"

import { Gift } from "lucide-react"
import { GIVEAWAY_TEXT, GIVEAWAY_STYLES } from "@/constants/giveaways"

export function GiveawayEmptyState() {
  return (
    <div className={GIVEAWAY_STYLES.emptyState}>
      <div className="text-center">
        <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          {GIVEAWAY_TEXT.noGiveaways.title}
        </h3>
        <p className="text-gray-500">
          {GIVEAWAY_TEXT.noGiveaways.description}
        </p>
      </div>
    </div>
  )
}
