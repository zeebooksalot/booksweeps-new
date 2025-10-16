"use client"

import { GIVEAWAY_TEXT, GIVEAWAY_STYLES } from "@/constants/giveaways"
import { GiveawayDirectorySkeleton } from "./GiveawayDirectorySkeleton"
import { useIsMobile } from "@/hooks/use-mobile"

export function GiveawayDirectoryLoading() {
  const isMobileView = useIsMobile()

  return (
    <div className={GIVEAWAY_STYLES.container}>
      <div className={GIVEAWAY_STYLES.mainContent}>
        {/* Show skeleton cards instead of just spinner */}
        <GiveawayDirectorySkeleton isMobileView={isMobileView} count={6} />
      </div>
    </div>
  )
}
