"use client"

import { Button } from "@/components/ui/button"
import { X, BookOpen, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface GiveawayBookDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  book?: {
    title: string
    author: string
    cover_image_url?: string
    description?: string
  }
}

export function GiveawayBookDetailsModal({ isOpen, onClose, book }: GiveawayBookDetailsModalProps) {
  if (!isOpen) return null

  const bookData = book || {
    title: "Ocean's Echo",
    author: "Elena Rodriguez",
    cover_image_url: "/fantasy-romance-book-cover-ocean-s-echo.jpg",
    description: "A magical tale of love and adventure beneath the waves that explores the depths of human connection and the mysteries of the ocean. When marine biologist Dr. Sarah Chen discovers an ancient artifact that allows her to communicate with sea creatures, she uncovers a hidden world of magic and romance."
  }

  const bookInfo = {
    title: bookData.title,
    author: bookData.author,
    cover: bookData.cover_image_url || "/placeholder.svg",
    progress: 0,
    totalPages: 384,
    currentPage: 0,
    rating: 4.8,
    year: 2024,
    readingTimeEstimate: 6,
    description: bookData.description || "A magical tale of love and adventure beneath the waves that explores the depths of human connection and the mysteries of the ocean.",
    genres: ["Magic", "Romance", "Adventure", "Ocean Fantasy"],
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-card rounded-lg shadow-lg max-w-[42rem] w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-10">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[90vh] p-6">
          <div className="grid md:grid-cols-[240px_1fr] gap-8">
            <div className="relative mx-auto md:mx-0 max-w-[240px] w-full">
              <div className="w-full aspect-[2/3.25] rounded-lg overflow-hidden shadow-md">
                <img
                  src={bookInfo.cover}
                  alt={`${bookInfo.title} cover`}
                  className="w-full h-full object-cover"
                />
              </div>
              {bookInfo.progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${bookInfo.progress}%` }} />
                  </div>
                  <span className="text-xs text-white font-medium">{bookInfo.progress}% complete</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{bookInfo.title}</h2>
                <p className="text-lg text-muted-foreground">by {bookInfo.author}</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{bookInfo.totalPages} pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{bookInfo.rating} rating</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{bookInfo.description}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {bookInfo.genres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full" size="lg">
                  Enter to Win
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
