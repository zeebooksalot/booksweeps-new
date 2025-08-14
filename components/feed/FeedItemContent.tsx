"use client"

import Image from "next/image"
import { MessageCircle, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FeedItem } from "@/types"
import { FEED_DISPLAY, FEED_TEXT, FEED_CONFIG } from "@/constants/feed"

interface FeedItemContentProps {
  item: FeedItem
  isMobile?: boolean
  showFullGenres?: boolean
}

export function FeedItemContent({ 
  item, 
  isMobile = false, 
  showFullGenres = false 
}: FeedItemContentProps) {
  const imageSizes = isMobile ? FEED_DISPLAY.imageSizes : {
    book: FEED_DISPLAY.imageSizes.bookDesktop,
    author: FEED_DISPLAY.imageSizes.authorDesktop,
  }
  
  const badgeSize = isMobile ? FEED_DISPLAY.badgeSizes.mobile : FEED_DISPLAY.badgeSizes.desktop
  const maxGenres = showFullGenres ? item.type === "book" ? item.genres.length : 0 : FEED_CONFIG.maxGenresDisplay

  return (
    <div className="flex items-start gap-4">
      {/* Ranking Badge */}
      <div className="flex-shrink-0">
        <div 
          className="flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 font-bold"
          style={{ width: badgeSize.width, height: badgeSize.height }}
        >
          <span className={isMobile ? "text-16" : "text-14"}>{item.rank}</span>
        </div>
      </div>

      {/* Book/Author Image */}
      <div className="flex-shrink-0">
        <Image
          src={item.type === "book" ? item.cover : item.avatar}
          alt={item.type === "book" ? item.title : item.name}
          width={imageSizes[item.type].width}
          height={imageSizes[item.type].height}
          className={`${item.type === "book" ? "rounded-xl" : "rounded-full"} shadow-sm`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-gray-900 dark:text-gray-100 mb-1 ${
          isMobile ? "text-18 line-clamp-2" : "text-18 group-hover:sm:text-orange-500 transition-all duration-300"
        }`}>
          {item.type === "book" ? item.title : item.name}
        </h3>
        
        <p className="text-16 text-gray-600 dark:text-gray-400 mb-2">
          {item.type === "book" 
            ? `by ${item.author}` 
            : isMobile 
              ? `${item.books} ${FEED_TEXT.stats.books} • ${item.followers.toLocaleString()} ${FEED_TEXT.stats.followers}`
              : item.bio
          }
        </p>
        
        {isMobile && (
          <p className="text-14 text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
            {item.type === "book" ? item.description : item.bio}
          </p>
        )}

        {/* Tags/Genres */}
        <div className="flex flex-wrap gap-2 mb-4">
          {item.type === "book" ? (
            item.genres.slice(0, maxGenres).map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                {genre}
              </Badge>
            ))
          ) : (
            <Badge
              variant="secondary"
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Author
            </Badge>
          )}
        </div>

        {/* Stats */}
        {isMobile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-14 text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {item.type === "book" ? item.comments : "0"}
              </span>
              {item.type === "book" && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {item.rating}
                </span>
              )}
            </div>
            <div className="text-18 font-bold text-orange-600 dark:text-orange-400">
              {item.votes} {FEED_TEXT.stats.votes}
            </div>
          </div>
        ) : (
          <>
            {item.type === "book" && (
              <div className="flex items-center gap-4 text-14 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{item.rating}</span>
                </div>
                <span>{FEED_TEXT.stats.published} {item.publishDate}</span>
              </div>
            )}
            {item.type === "author" && (
              <div className="flex items-center gap-4 text-14 text-gray-600 dark:text-gray-400">
                <span>{item.books} {FEED_TEXT.stats.books}</span>
                <span>{item.followers.toLocaleString()} {FEED_TEXT.stats.followers}</span>
                <span>{FEED_TEXT.stats.joined} {item.joinedDate}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
