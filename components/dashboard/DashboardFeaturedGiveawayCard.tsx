import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradientBookCover } from "@/components/ui/gradient-book-cover"
import Image from "next/image"
import { useDynamicBadgeColor } from "@/hooks/useDynamicBadgeColor"

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
  const badgeColors = useDynamicBadgeColor(coverImage)
  
  return (
    <Card className="flex-none w-[calc(33.333%-11px)] min-w-[280px] snap-start group/card overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/20 py-0">
      <div className="relative">
        <div className="aspect-[3/2] relative bg-muted overflow-hidden">
          {coverImage?.startsWith('gradient:') ? (
            <GradientBookCover
              genre={coverImage.replace('gradient:', '')}
              title={title}
              className="w-full h-full group-hover/card:scale-105 transition-transform duration-300"
              size="lg"
            />
          ) : (
            <Image
              src={coverImage || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover group-hover/card:scale-105 transition-transform duration-300"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          {featured && !badgeColors.isLoading && (
            <Badge
              className="absolute top-2 right-2 text-xs"
              style={{
                backgroundColor: badgeColors.background,
                borderColor: badgeColors.border,
                color: badgeColors.text
              }}
            >
              Featured
            </Badge>
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
          <Button className="w-full bg-primary hover:bg-primary/90 text-white" size="sm">
            Enter Giveaway
          </Button>
        </div>
      </div>
    </Card>
  )
}
