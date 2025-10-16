"use client"

import { Badge } from "@/components/ui/badge"

interface RelatedGiveawayCardProps {
  title: string
  author: string
  genre: string
  daysLeft: string
  cover: string
  description: string
}

export function RelatedGiveawayCard({ title, author, genre, daysLeft, cover, description }: RelatedGiveawayCardProps) {
  return (
    <div className="flex gap-3 p-3 pb-8 border border-border rounded-lg hover:shadow-md hover:border-accent/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm bg-card relative">
      <Badge className="absolute -top-3.5 -right-2.5 bg-accent text-accent-foreground text-xs px-2 py-1 shadow-sm z-10">
        {daysLeft}
      </Badge>
      <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden">
        <img src={cover || "/placeholder.svg"} alt={`${title} book cover`} className="w-full h-full object-cover" />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{description}</p>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mb-2.5">by {author}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-muted/50 px-3 py-2 text-xs text-muted-foreground border-t border-border/50">
        For fans of {genre}
      </div>
    </div>
  )
}
