import { Badge } from "@/components/ui/badge"

interface SimpleGiveawayCardProps {
  title: string
  author: string
  genre: string
  daysLeft: string
  cover: string
  description: string
}

export function SimpleGiveawayCard({ title, author, genre, daysLeft, cover, description }: SimpleGiveawayCardProps) {
  return (
    <div className="p-4 border border-border rounded-lg hover:shadow-md hover:border-accent transition-all duration-200 cursor-pointer shadow-sm bg-card relative">
      <Badge className="absolute -top-3.5 -right-2.5 bg-accent text-accent-foreground text-xs px-2 py-1 shadow-sm z-10 font-medium">
        {daysLeft}
      </Badge>
      <div className="flex gap-4 mb-3">
        <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden">
          <img src={cover || "/placeholder.svg"} alt={`${title} book cover`} className="w-full h-full object-cover" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-sm text-muted-foreground">by {author}</p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{description}</p>
        </div>
      </div>
      <button className="w-full bg-muted/50 hover:bg-muted px-3 py-1.5 text-sm text-muted-foreground border border-[goldenrod] rounded font-medium transition-colors">
        Enter to Win
      </button>
    </div>
  )
}
