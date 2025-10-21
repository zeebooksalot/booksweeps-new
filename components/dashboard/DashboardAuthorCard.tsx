import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart } from "lucide-react"

interface NewAuthorCardProps {
  id: number
  name: string
  genre: string
  avatar: string
  booksPublished: number
  followers: number
  bio: string
}

export function DashboardAuthorCard({ name, genre, avatar, booksPublished, followers, bio }: NewAuthorCardProps) {
  return (
    <Card className="flex-none w-[calc(25%-12px)] min-w-[240px] snap-start group/card overflow-hidden hover:shadow transition-all duration-300 border-border/50 hover:border-primary/20 py-0">
      <div className="flex flex-col">
        {/* Avatar Header Section - Flush with top */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 flex justify-center">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarFallback className="bg-background text-primary text-xl font-semibold">{avatar}</AvatarFallback>
          </Avatar>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3 flex flex-col items-center text-center">
          <div className="space-y-1">
            <h3 className="font-semibold text-base leading-tight">{name}</h3>
            <Badge variant="secondary" className="text-xs">
              {genre}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{bio}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 w-full justify-center border-t border-border/50">
            <div className="flex flex-col items-center">
              <span className="font-semibold text-foreground">{booksPublished}</span>
              <span>Books</span>
            </div>
            <div className="h-8 w-px bg-border/50" />
            <div className="flex flex-col items-center">
              <span className="font-semibold text-foreground">{(followers / 1000).toFixed(1)}k</span>
              <span>Followers</span>
            </div>
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 text-white" size="sm">
            <Heart className="mr-2 h-3.5 w-3.5" />
            Follow
          </Button>
        </div>
      </div>
    </Card>
  )
}
