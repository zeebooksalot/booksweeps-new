"use client"

import { AuthorAvatarImage } from "@/components/ui/optimized-image"
import { ChevronUp, BookOpen, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface AuthorCardProps {
  id: string
  name: string
  bio: string
  avatar: string
  votes: number
  books: number
  followers: number
  joinedDate: string
  onVote: (id: string) => void
}

export function AuthorCard({ id, name, bio, avatar, votes, books, followers, joinedDate, onVote }: AuthorCardProps) {
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
              {/* Author Avatar */}
              <div className="flex-shrink-0">
                <AuthorAvatarImage
                  src={avatar || "/placeholder.svg"}
                  alt={name}
                  priority={false}
                />
              </div>

              {/* Author Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                <p className="text-slate-300 mb-3 line-clamp-3">{bio}</p>

                <div className="flex items-center space-x-6 text-sm text-slate-400 mb-3">
                  <span className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {books} books
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {followers.toLocaleString()} followers
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {joinedDate}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      Website
                    </Badge>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      Twitter
                    </Badge>
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      Goodreads
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                  >
                    Follow
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
