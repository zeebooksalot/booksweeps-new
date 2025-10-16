"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gift, Users, Clock } from "lucide-react"
import { GiveawayCardProps } from "@/types/giveaways"
import { GIVEAWAY_TEXT, GIVEAWAY_STYLES } from "@/constants/giveaways"

export function GiveawayDirectoryCard({ giveaway, onEnter, isMobileView }: GiveawayCardProps) {
  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return GIVEAWAY_TEXT.stats.ended
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h ${GIVEAWAY_TEXT.stats.timeRemaining}`
    if (hours > 0) return `${hours}h ${GIVEAWAY_TEXT.stats.timeRemaining}`
    return GIVEAWAY_TEXT.stats.endingSoon
  }

  const getEntryPercentage = (entryCount: number, maxEntries: number) => {
    return Math.min((entryCount / maxEntries) * 100, 100)
  }

  const getStatusBadge = () => {
    if (giveaway.is_featured) {
      return <Badge className={GIVEAWAY_STYLES.badge.featured}>Featured</Badge>
    }
    
    const endDate = new Date(giveaway.end_date)
    const now = new Date()
    const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (endDate < now) {
      return <Badge className={GIVEAWAY_STYLES.badge.ended}>Ended</Badge>
    } else if (daysUntilEnd <= 7) {
      return <Badge className={GIVEAWAY_STYLES.badge.endingSoon}>Ending Soon</Badge>
    } else {
      return <Badge className={GIVEAWAY_STYLES.badge.active}>Active</Badge>
    }
  }

  if (isMobileView) {
    return (
      <div className={GIVEAWAY_STYLES.card}>
        <div className="flex items-start gap-4">
          {/* Book Cover */}
          <div className="flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Image
              src={giveaway.book.cover_image_url}
              alt={giveaway.book.title}
              width={64}
              height={80}
              className="rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                {giveaway.title}
              </h3>
              {getStatusBadge()}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {giveaway.description}
            </p>

            {/* Book Info */}
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {giveaway.book.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                by {giveaway.book.author}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{giveaway.entry_count} {GIVEAWAY_TEXT.stats.entries}</span>
              </div>
              <div className="flex items-center gap-1">
                <Gift className="h-4 w-4" />
                <span>{giveaway.number_of_winners} {GIVEAWAY_TEXT.stats.winners}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{getTimeRemaining(giveaway.end_date)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Entries</span>
                <span>{giveaway.entry_count} / {giveaway.max_entries}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getEntryPercentage(giveaway.entry_count, giveaway.max_entries)}%` }}
                />
              </div>
            </div>

            {/* Enter Button */}
            <Button
              onClick={() => onEnter(giveaway.id)}
              className="w-full group-hover:bg-orange-600 group-hover:scale-105 transition-all duration-300"
              size="sm"
            >
              Enter Giveaway
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Desktop view
  return (
    <div className={GIVEAWAY_STYLES.card}>
      <div className="flex items-start gap-6">
        {/* Book Cover */}
        <div className="flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
          <Image
            src={giveaway.book.cover_image_url}
            alt={giveaway.book.title}
            width={80}
            height={100}
            className="rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                {giveaway.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {giveaway.description}
              </p>
            </div>
            {getStatusBadge()}
          </div>

          {/* Book and Author Info */}
          <div className="flex items-start gap-6 mb-4">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                {giveaway.book.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                by {giveaway.book.author}
              </p>
              <Badge variant="outline" className="text-xs">
                {giveaway.book.genre}
              </Badge>
            </div>

            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                {giveaway.author.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {giveaway.author.bio}
              </p>
            </div>
          </div>

          {/* Stats and Progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{giveaway.entry_count} {GIVEAWAY_TEXT.stats.entries}</span>
              </div>
              <div className="flex items-center gap-1">
                <Gift className="h-4 w-4" />
                <span>{giveaway.number_of_winners} {GIVEAWAY_TEXT.stats.winners}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{getTimeRemaining(giveaway.end_date)}</span>
              </div>
            </div>

            <Button
              onClick={() => onEnter(giveaway.id)}
              size="sm"
              className="group-hover:bg-orange-600 group-hover:scale-105 transition-all duration-300"
            >
              Enter Giveaway
            </Button>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Entry Progress</span>
              <span>{giveaway.entry_count} / {giveaway.max_entries}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getEntryPercentage(giveaway.entry_count, giveaway.max_entries)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
