"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle, Star, Tag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading"

interface BookItem {
  id: string
  type: "book"
  title: string
  author: string
  description: string
  cover: string
  votes: number
  comments: number
  rating: number
  genres: string[]
  hasGiveaway: boolean
  publishDate: string
  rank: number
}

interface AuthorItem {
  id: string
  type: "author"
  name: string
  bio: string
  avatar: string
  votes: number
  books: number
  followers: number
  joinedDate: string
  hasGiveaway?: boolean
  rank: number
}

type FeedItem = BookItem | AuthorItem

interface FeedItemDisplayProps {
  item: FeedItem
  isMobileView: boolean
  onVote: (id: string) => void
  onSwipeLeft: (id: string) => void
  onSwipeRight: (id: string) => void
  downloadSlug?: string // Optional prop for download links
}

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
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX - startX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    if (currentX > 100) {
      setIsVoting(true)
      onSwipeRight(item.id) // Like/Vote
      setTimeout(() => setIsVoting(false), 1000) // Reset after animation
    } else if (currentX < -100) {
      onSwipeLeft(item.id) // Skip
    }

    setCurrentX(0)
    setIsDragging(false)
  }

  return (
    <Link href={downloadSlug ? `/dl/${downloadSlug}` : `/${item.type}s/${item.id}`} className="block">
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mx-4 mb-4 touch-pan-y transition-colors cursor-pointer"
        style={{ transform: `translateX(${currentX}px)`, transition: isDragging ? "none" : "transform 0.3s ease" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      {/* Swipe indicators */}
      {currentX > 50 && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-2xl flex items-center justify-start pl-8">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold">👍 Vote</div>
        </div>
      )}
      {currentX < -50 && (
        <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-2xl flex items-center justify-end pr-8">
          <div className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">👎 Skip</div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Ranking Badge */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900 text-16 font-bold text-orange-600 dark:text-orange-400">
            {item.rank}
          </div>
        </div>

        {/* Book/Author Image */}
        <div className="flex-shrink-0">
          <Image
            src={item.type === "book" ? item.cover : item.avatar}
            alt={item.type === "book" ? item.title : item.name}
            width={item.type === "book" ? 80 : 80}
            height={item.type === "book" ? 100 : 80}
            className={`${item.type === "book" ? "rounded-xl" : "rounded-full"} shadow-sm`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-18 font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
            {item.type === "book" ? item.title : item.name}
          </h3>
          <p className="text-16 text-gray-600 dark:text-gray-400 mb-2">
            {item.type === "book"
              ? `by ${item.author}`
              : `${item.books} books • ${item.followers.toLocaleString()} followers`}
          </p>
          <p className="text-14 text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
            {item.type === "book" ? item.description : item.bio}
          </p>

          {/* Tags/Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {item.type === "book" ? (
              item.genres.slice(0, 2).map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-12"
                >
                  {genre}
                </Badge>
              ))
            ) : (
              <Badge
                variant="secondary"
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-12"
              >
                Author
              </Badge>
            )}
          </div>

          {/* Stats */}
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
            <div className="text-18 font-bold text-orange-600 dark:text-orange-400">{item.votes} votes</div>
          </div>
        </div>
      </div>

      {/* Giveaway Banner */}
      {item.hasGiveaway && (
        <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-3 border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <span className="text-14 font-semibold text-purple-800 dark:text-purple-300">🎁 Giveaway Active</span>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Enter Now
            </Button>
          </div>
        </div>
      )}
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

        {/* Ranking Badge */}
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900 text-14 font-bold text-orange-600 dark:text-orange-400">
            {item.rank}
          </div>
        </div>

        {/* Product Image */}
        <div className="flex-shrink-0">
          <Image
            src={item.type === "book" ? item.cover : item.avatar}
            alt={item.type === "book" ? item.title : item.name}
            width={item.type === "book" ? 64 : 64}
            height={item.type === "book" ? 80 : 64}
            className={`${item.type === "book" ? "rounded-xl" : "rounded-full"} shadow-sm`}
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col min-w-0">
          <div className="text-18 font-semibold text-gray-900 dark:text-gray-100 transition-all duration-300 group-hover:sm:text-orange-500 mb-1">
            {item.type === "book" ? item.title : item.name}
          </div>

          <div className="text-16 text-gray-600 dark:text-gray-400 mb-2">
            {item.type === "book" ? `by ${item.author}` : item.bio}
          </div>

        <div className="mb-3 flex flex-row flex-wrap items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
          {item.type === "book" ? (
            item.genres.map((genre) => (
              <Badge
                key={genre}
                variant="secondary"
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              >
                {genre}
              </Badge>
            ))
          ) : (
            <div className="flex items-center gap-4 text-14 text-gray-600 dark:text-gray-400">
              <span>{item.books} books</span>
              <span>{item.followers.toLocaleString()} followers</span>
              <span>Joined {item.joinedDate}</span>
            </div>
          )}
        </div>

        {item.type === "book" && (
          <div className="flex items-center gap-4 text-14 text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{item.rating}</span>
            </div>
            <span>Published {item.publishDate}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {item.hasGiveaway && (
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 shadow-md hover:shadow-lg transition-all duration-300">
            🎁 Enter Giveaway
          </Button>
        )}

        <button
          type="button"
          className="flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 hover:border-orange-500 hover:shadow-md"
        >
          <MessageCircle className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
          <p className="text-12 font-semibold leading-none text-gray-700 dark:text-gray-300">
            {item.type === "book" ? item.comments : "0"}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onVote(item.id)}
          className="flex h-12 w-12 flex-col items-center justify-center gap-1 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-md"
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