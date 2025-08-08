"use client"

import React from 'react'
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Star, BookOpen, User, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
  items: FeedItem[]
  onVote: (id: string) => void
  onSwipeLeft: (id: string) => void
  onSwipeRight: (id: string) => void
  isMobileView: boolean
}

function MobileBookCard({
  item,
  onVote,
  onSwipeLeft,
  onSwipeRight,
}: {
  item: FeedItem
  onVote: (id: string) => void
  onSwipeLeft: (id: string) => void
  onSwipeRight: (id: string) => void
}) {
  const handleVote = () => onVote(item.id)
  const handleSwipeLeft = () => onSwipeLeft(item.id)
  const handleSwipeRight = () => onSwipeRight(item.id)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Image
            src={item.type === "book" ? item.cover : item.avatar}
            alt={item.type === "book" ? `${item.title} cover` : `${item.name} avatar`}
            width={item.type === "book" ? 80 : 64}
            height={item.type === "book" ? 120 : 64}
            className={cn(
              "shadow-sm",
              item.type === "book" ? "rounded-xl" : "rounded-full"
            )}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {item.type === "book" ? item.title : item.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.type === "book" ? `by ${item.author}` : item.bio}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVote}
                className="text-gray-500 hover:text-orange-500"
              >
                <Heart className="h-4 w-4" />
                <span className="ml-1 text-xs">{item.votes}</span>
              </Button>
            </div>
          </div>
          
          {item.type === "book" && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex items-center">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                  {item.rating}
                </span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-3 w-3 text-gray-400" />
                <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                  {item.comments}
                </span>
              </div>
            </div>
          )}
          
          {item.type === "author" && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex items-center">
                <BookOpen className="h-3 w-3 text-gray-400" />
                <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                  {item.books} books
                </span>
              </div>
              <div className="flex items-center">
                <User className="h-3 w-3 text-gray-400" />
                <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                  {item.followers.toLocaleString()} followers
                </span>
              </div>
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {item.type === "book" && item.genres.slice(0, 2).map((genre) => (
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
              {item.type === "author" && (
                <Badge variant="secondary" className="text-xs">
                  Joined {item.joinedDate}
                </Badge>
              )}
            </div>
            
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwipeLeft}
                className="text-gray-500 hover:text-red-500"
              >
                Skip
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwipeRight}
                className="text-gray-500 hover:text-green-500"
              >
                Like
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DesktopListItem({
  item,
  onVote,
  onSwipeLeft,
  onSwipeRight,
}: {
  item: FeedItem
  onVote: (id: string) => void
  onSwipeLeft: (id: string) => void
  onSwipeRight: (id: string) => void
}) {
  const handleVote = () => onVote(item.id)
  const handleSwipeLeft = () => onSwipeLeft(item.id)
  const handleSwipeRight = () => onSwipeRight(item.id)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Image
            src={item.type === "book" ? item.cover : item.avatar}
            alt={item.type === "book" ? `${item.title} cover` : `${item.name} avatar`}
            width={item.type === "book" ? 80 : 64}
            height={item.type === "book" ? 120 : 64}
            className={cn(
              "shadow-sm",
              item.type === "book" ? "rounded-xl" : "rounded-full"
            )}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {item.type === "book" ? item.title : item.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {item.type === "book" ? `by ${item.author}` : item.bio}
              </p>
            </div>
            
            <div className="flex items-center space-x-3 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVote}
                className="text-gray-500 hover:text-orange-500"
              >
                <Heart className="h-5 w-5" />
                <span className="ml-1">{item.votes}</span>
              </Button>
            </div>
          </div>
          
          {item.type === "book" && (
            <div className="mt-3 flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                  {item.rating}
                </span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 text-gray-400" />
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                  {item.comments} comments
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                  {item.publishDate}
                </span>
              </div>
            </div>
          )}
          
          {item.type === "author" && (
            <div className="mt-3 flex items-center space-x-4">
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                  {item.books} books
                </span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-400" />
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                  {item.followers.toLocaleString()} followers
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                  Joined {item.joinedDate}
                </span>
              </div>
            </div>
          )}
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {item.type === "book" && item.genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
              {item.type === "author" && item.hasGiveaway && (
                <Badge variant="default" className="bg-orange-500">
                  Has Giveaway
                </Badge>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleSwipeLeft}
                className="text-gray-500 hover:text-red-500"
              >
                Skip
              </Button>
              <Button
                variant="outline"
                onClick={handleSwipeRight}
                className="text-gray-500 hover:text-green-500"
              >
                Like
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const FeedItemDisplay = React.memo(function FeedItemDisplay({ 
  items, 
  onVote, 
  onSwipeLeft, 
  onSwipeRight,
  isMobileView 
}: FeedItemDisplayProps) {
  if (isMobileView) {
    return (
      <div className="space-y-4">
        {items.map((item) => (
          <MobileBookCard
            key={item.id}
            item={item}
            onVote={onVote}
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <DesktopListItem
          key={item.id}
          item={item}
          onVote={onVote}
          onSwipeLeft={onSwipeLeft}
          onSwipeRight={onSwipeRight}
        />
      ))}
    </div>
  )
}) 