import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface GiveawayAuthorSectionProps {
  author?: {
    id: string
    name: string
    avatar_url?: string
    bio?: string
  }
}

export function GiveawayAuthorSection({ author }: GiveawayAuthorSectionProps) {
  const authorData = author || {
    id: "1",
    name: "Elena Rodriguez",
    avatar_url: "/author-elena-rodriguez.jpg",
    bio: "Fantasy romance author who transports readers to magical worlds filled with adventure and love. Elena has published over 12 bestselling novels and has won multiple awards for her captivating storytelling and rich world-building."
  }

  return (
    <Card>
      <CardContent className="px-8 py-4">
        <div className="flex gap-6">
          <Avatar className="h-24 w-24 shrink-0">
            <AvatarImage src={authorData.avatar_url?.startsWith('gradient:') ? undefined : authorData.avatar_url} />
            <AvatarFallback>{authorData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="space-y-2 flex-1">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">About the Author</p>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-xl">{authorData.name}</h2>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white bg-transparent"
                    >
                      Follow
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Get notified when this author posts new giveaways</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {authorData.bio}
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>12 Published Books</span>
              <span>500K+ Readers</span>
              <span>Award Winner</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}