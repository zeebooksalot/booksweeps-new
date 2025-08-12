"use client"

import { FeedItemDisplay } from "@/components/feed-item-display"
import { ReaderMagnetFeedItem } from "@/types/reader-magnets"

interface ReaderMagnetListProps {
  feedItems: ReaderMagnetFeedItem[]
  onVote: (id: string) => void
  onSwipeLeft: (id: string) => void
  onSwipeRight: (id: string) => void
}

export function ReaderMagnetList({ 
  feedItems, 
  onVote, 
  onSwipeLeft, 
  onSwipeRight 
}: ReaderMagnetListProps) {
  if (feedItems.length === 0) {
    return null
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden">
        {feedItems.map((item) => (
          <FeedItemDisplay
            key={item.id}
            item={item}
            isMobileView={true}
            onVote={onVote}
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
            downloadSlug={item.slug}
          />
        ))}
      </div>

      {/* Desktop List View */}
      <div className="hidden md:block">
        {feedItems.map((item) => (
          <FeedItemDisplay
            key={item.id}
            item={item}
            isMobileView={false}
            onVote={onVote}
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
            downloadSlug={item.slug}
          />
        ))}
      </div>
    </>
  )
}
