import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface FeaturedGiveawayCardProps {
  id: number
  title: string
  description: string
  coverImage: string
  entries: number
  daysLeft: number
  featured?: boolean
}

export function DashboardFeaturedGiveawayCard({
  title,
  description,
  coverImage,
  entries,
  daysLeft,
  featured = true,
}: FeaturedGiveawayCardProps) {
  return (
    <Card className="flex-none w-[calc(33.333%-11px)] min-w-[280px] snap-start group/card overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/20 py-0">
      <div className="relative">
        <div className="aspect-[3/2] relative bg-muted overflow-hidden">
          <Image
            src={coverImage || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover/card:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {featured && (
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs">Featured</Badge>
          )}
        </div>
        <div className="p-3 space-y-2">
          <div>
            <h3 className="font-bold text-base leading-tight mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
            <span>{entries.toLocaleString()} entries</span>
            <span className="font-medium text-primary">{daysLeft}d left</span>
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90" size="sm">
            Enter Giveaway
          </Button>
        </div>
      </div>
    </Card>
  )
}
