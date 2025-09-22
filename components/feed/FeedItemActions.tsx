"use client"

import { Button } from "@/components/ui/button"
import { FeedItem } from "@/types"
import { FEED_DISPLAY, FEED_TEXT, FEED_STATUS_COLORS } from "@/constants/feed"

interface FeedItemActionsProps {
  item: FeedItem
  onVote: (id: string) => void
  isMobile?: boolean
}

export function FeedItemActions({ item, onVote, isMobile = false }: FeedItemActionsProps) {
  const buttonSize = FEED_DISPLAY.actionButtonSizes

  return (
    <div className="flex items-center gap-3">
      {/* Giveaway Button */}
      {item.type !== "giveaway" && (item as any).hasGiveaway && (
        <Button 
          className={`${FEED_STATUS_COLORS.giveaway} hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 ${
            isMobile ? "px-4" : "px-6"
          }`}
        >
          {isMobile ? FEED_TEXT.giveaway.enter : FEED_TEXT.giveaway.enterDesktop}
        </Button>
      )}


      {/* Vote Button */}
      <button
        type="button"
        onClick={() => onVote(item.id)}
        className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-md"
        style={{ width: buttonSize.width, height: buttonSize.height }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className="fill-white stroke-gray-700 dark:stroke-gray-300 stroke-[1.5px] transition-all duration-300 hover:stroke-orange-500"
        >
          <path d="M6.579 3.467c.71-1.067 2.132-1.067 2.842 0L12.975 8.8c.878 1.318.043 3.2-1.422 3.2H4.447c-1.464 0-2.3-1.882-1.422-3.2z"></path>
        </svg>
        <p className="text-12 font-semibold leading-none text-gray-700 dark:text-gray-300">
          {item.votes}
        </p>
      </button>
    </div>
  )
}
