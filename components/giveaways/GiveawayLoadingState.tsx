"use client"

import { GIVEAWAY_TEXT, GIVEAWAY_STYLES } from "@/constants/giveaways"

export function GiveawayLoadingState() {
  return (
    <div className={GIVEAWAY_STYLES.loadingState}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{GIVEAWAY_TEXT.loading}</p>
        </div>
      </div>
    </div>
  )
}
