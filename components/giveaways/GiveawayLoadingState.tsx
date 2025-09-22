"use client"

import { GIVEAWAY_TEXT, GIVEAWAY_STYLES } from "@/constants/giveaways"
import { GiveawayListSkeleton } from "./GiveawayListSkeleton"
import { useIsMobile } from "@/hooks/use-mobile"

export function GiveawayLoadingState() {
  const isMobileView = useIsMobile()

  return (
    <div className={GIVEAWAY_STYLES.container}>
      <div className={GIVEAWAY_STYLES.mainContent}>
        {/* Show skeleton cards instead of just spinner */}
        <GiveawayListSkeleton isMobileView={isMobileView} count={6} />
      </div>
    </div>
  )
}
