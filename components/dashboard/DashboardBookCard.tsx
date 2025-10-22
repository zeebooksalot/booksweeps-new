import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradientBookCover } from "@/components/ui/gradient-book-cover"
import { getGradientCover } from "@/lib/gradient-covers"

interface EnhancedBookCardProps {
  id: number
  title: string
  author: string
  genre: string
  coverImage: string
  rating?: number
  downloads?: number
  entryDate?: string
  daysLeft?: number
  wonDate?: string
  status?: string
  addedDate?: string
  endedDate?: string
  winner?: boolean
  showDownloadButton?: boolean
}

export function DashboardBookCard({
  title,
  author,
  genre,
  coverImage,
  rating,
  downloads,
  entryDate,
  daysLeft,
  wonDate,
  status,
  addedDate,
  endedDate,
  winner,
  showDownloadButton = false,
}: EnhancedBookCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/20 py-0 gap-0">
      <div className="aspect-[2/3] relative bg-muted overflow-hidden">
        {coverImage?.startsWith('gradient:') ? (
          <GradientBookCover
            genre={coverImage.replace('gradient:', '')}
            title={title}
            author={author}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
            size="lg"
          />
        ) : (
          <Image
            src={coverImage || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs">{genre}</Badge>
        {winner && <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">Won</Badge>}
      </div>
      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground">by {author}</p>
        </div>

        {/* Rating and downloads for free books */}
        {rating !== undefined && downloads !== undefined && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="font-medium">{rating}</span>
            </div>
            <span className="text-muted-foreground text-[10px]">{(downloads / 1000).toFixed(1)}k downloads</span>
          </div>
        )}

        {/* Entry date and days left for active entries */}
        {entryDate && daysLeft !== undefined && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
            <span className="text-muted-foreground text-[10px]">Entered {entryDate}</span>
            <span className="font-medium text-primary">{daysLeft}d left</span>
          </div>
        )}

        {/* Entry date and ended date for ended entries */}
        {entryDate && endedDate && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
            <span className="text-muted-foreground text-[10px]">Entered {entryDate}</span>
            <span className="text-muted-foreground text-[10px]">Ended {endedDate}</span>
          </div>
        )}

        {/* Won date and status for books won */}
        {wonDate && status && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
            <span className="text-muted-foreground text-[10px]">Won {wonDate}</span>
            <Badge
              variant={status === "Delivered" ? "default" : "outline"}
              className="text-[10px] font-medium px-1.5 py-0"
            >
              {status}
            </Badge>
          </div>
        )}

        {/* Added date and status for your books */}
        {addedDate && status && !wonDate && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
            <span className="text-muted-foreground text-[10px]">Added {addedDate}</span>
            <Badge
              variant={status === "Reading" ? "default" : "outline"}
              className="text-[10px] font-medium px-1.5 py-0"
            >
              {status}
            </Badge>
          </div>
        )}

        {/* Download button for free books */}
        {showDownloadButton && (
          <Button className="w-full bg-primary hover:bg-primary/90 text-white" size="sm">
            Download Free
          </Button>
        )}
      </div>
    </Card>
  )
}
