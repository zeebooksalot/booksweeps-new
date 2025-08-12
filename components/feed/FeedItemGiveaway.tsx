"use client"

import { Button } from "@/components/ui/button"
import { FEED_TEXT } from "@/constants/feed"

interface FeedItemGiveawayProps {
  isMobile?: boolean
}

export function FeedItemGiveaway({ isMobile = false }: FeedItemGiveawayProps) {
  return (
    <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-3 border border-purple-200 dark:border-purple-700">
      <div className="flex items-center justify-between">
        <span className="text-14 font-semibold text-purple-800 dark:text-purple-300">
          {FEED_TEXT.giveaway.active}
        </span>
        <Button
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          {FEED_TEXT.giveaway.enter}
        </Button>
      </div>
    </div>
  )
}
