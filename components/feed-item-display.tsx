"use client"

import Link from "next/link"
import { FeedItem, FeedItemDisplayProps } from "@/types"
import { useFeedItem } from "@/hooks/useFeedItem"
import { FeedItemContent } from "./feed/FeedItemContent"
import { FeedItemActions } from "./feed/FeedItemActions"
import { FeedItemGiveaway } from "./feed/FeedItemGiveaway"
import { FEED_CONFIG, FEED_STATUS_COLORS, FEED_TEXT } from "@/constants/feed"

// Mobile Card Component for swipeable interface
function MobileBookCard({
  item,
  onVote,
  onSwipeLeft,
  onSwipeRight,
  downloadSlug,
}: {
  item: FeedItem
  onVote: (id: string) => void
  onSwipeLeft: (id: string) => void
  onSwipeRight: (id: string) => void
  downloadSlug?: string
}) {
  const { swipeState, handleTouchStart, handleTouchMove, handleTouchEnd } = useFeedItem()

  const handleTouchEndCallback = () => {
    handleTouchEnd(item.id, onSwipeRight, onSwipeLeft)
  }

  return (
    <Link href={downloadSlug ? `/dl/${downloadSlug}` : `/${item.type}s/${item.id}`} className="block">
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mx-4 mb-4 touch-pan-y transition-colors cursor-pointer"
        style={{ 
          transform: `translateX(${swipeState.currentX}px)`, 
          transition: swipeState.isDragging ? "none" : `transform ${FEED_CONFIG.animationDuration}ms ease` 
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEndCallback}
      >
        {/* Swipe indicators */}
        {swipeState.currentX > 50 && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-2xl flex items-center justify-start pl-8">
            <div className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold">
              {FEED_TEXT.swipeIndicators.vote}
            </div>
          </div>
        )}
        {swipeState.currentX < -50 && (
          <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-2xl flex items-center justify-end pr-8">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
              {FEED_TEXT.swipeIndicators.skip}
            </div>
          </div>
        )}

        {/* Content */}
        <FeedItemContent item={item} isMobile={true} />

        {/* Giveaway Banner */}
        {item.hasGiveaway && <FeedItemGiveaway isMobile={true} />}
      </div>
    </Link>
  )
}

// Desktop List Item Component
function DesktopListItem({
  item,
  onVote,
  downloadSlug,
}: {
  item: FeedItem
  onVote: (id: string) => void
  downloadSlug?: string
}) {
  return (
    <Link href={downloadSlug ? `/dl/${downloadSlug}` : `/${item.type}s/${item.id}`} className="block">
      <section className="group relative flex flex-row items-start gap-6 rounded-xl px-0 py-6 transition-all duration-300 sm:-mx-4 sm:p-6 cursor-pointer hover:sm:bg-gray-50 dark:hover:sm:bg-gray-800 hover:shadow-sm">
        <span className="absolute inset-0"></span>

        {/* Content */}
        <div className="flex flex-1 flex-col min-w-0">
          <FeedItemContent item={item} isMobile={false} showFullGenres={true} />
        </div>

        {/* Actions */}
        <FeedItemActions item={item} onVote={onVote} isMobile={false} />
      </section>
    </Link>
  )
}

export function FeedItemDisplay({
  item,
  isMobileView,
  onVote,
  onSwipeLeft,
  onSwipeRight,
  downloadSlug,
}: FeedItemDisplayProps) {
  if (isMobileView) {
    return (
      <MobileBookCard
        item={item}
        onVote={onVote}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        downloadSlug={downloadSlug}
      />
    )
  }

  return <DesktopListItem item={item} onVote={onVote} downloadSlug={downloadSlug} />
} 