"use client"

import { BookCoverImage } from "@/components/ui/optimized-image"
import { ChevronUp, MessageCircle, Star, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface BookCardProps {
  id: string
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
  onVote: (id: string) => void
}

export function BookCard({
  id,
  title,
  author,
  description,
  cover,
  votes,
  comments,
  rating,
  genres,
  hasGiveaway,
  publishDate,
  onVote,
}: BookCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center space-y-1 min-w-[60px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVote(id)}
              className="p-1 hover:bg-slate-700 hover:text-cyan-400"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
            <span className="font-bold text-lg">{votes}</span>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start space-x-4">
              {/* Book Cover */}
              <div className="flex-shrink-0">
                <BookCoverImage
                  src={cover || "/placeholder.svg"}
                  alt={title}
                  priority={false}
                />
              </div>

              {/* Book Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                <p className="text-cyan-400 mb-2">by {author}</p>
                <p className="text-slate-300 mb-3 line-clamp-2">{description}</p>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="bg-slate-700 text-slate-300">
                      {genre}
                    </Badge>
                  ))}
                  <div className="flex items-center text-yellow-400">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    <span className="text-sm">{rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {comments} comments
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {publishDate}
                    </span>
                  </div>
                  {hasGiveaway && (
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Enter Giveaway
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
