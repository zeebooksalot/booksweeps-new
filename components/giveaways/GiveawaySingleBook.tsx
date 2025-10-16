"use client"

import { Book, Calendar, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface GiveawayBookDetailsProps {
  giveaway?: {
    book: {
      title: string
      author: string
      cover_image_url: string
      genre: string
      description: string
    }
    author: {
      name: string
    }
  }
}

export function GiveawaySingleBook({ giveaway }: GiveawayBookDetailsProps) {
  const book = giveaway?.book || {
    title: "Ocean's Echo",
    author: "Elena Rodriguez",
    cover_image_url: "/fantasy-romance-book-cover-ocean-s-echo.jpg",
    genre: "Fantasy Romance",
    description: "A magical tale of love and adventure beneath the waves that explores the depths of human connection and the mysteries of the ocean. When marine biologist Dr. Sarah Chen discovers an ancient artifact that allows her to communicate with sea creatures, she uncovers a hidden world of magic and romance that will change her life forever."
  }

  const authorName = giveaway?.author?.name || book.author

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 p-6 bg-muted/30">
            <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center relative overflow-hidden">
              <img
                src={book.cover_image_url}
                alt={`${book.title} book cover`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
          <div className="md:w-2/3 p-6 space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">{book.title}</h1>
              <p className="text-lg text-muted-foreground">by {authorName}</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current text-warning" />
                <span>4.8</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Published 2024</span>
              </div>
              <div className="flex items-center gap-1">
                <Book className="h-4 w-4" />
                <span>384 pages</span>
              </div>
            </div>

            <p className="text-foreground leading-relaxed">
              {book.description}
            </p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Magic</Badge>
              <Badge variant="outline">Romance</Badge>
              <Badge variant="outline">Adventure</Badge>
              <Badge variant="outline">Ocean Fantasy</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
