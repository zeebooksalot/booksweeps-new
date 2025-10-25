"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface GiveawayAuthorSectionProps {
  author?: {
    name: string
    avatar_url: string
    bio: string
  }
}

export function GiveawaySingleAuthor({ author }: GiveawayAuthorSectionProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const { toast } = useToast()
  
  const authorData = author || {
    name: "Elena Rodriguez",
    avatar_url: "/author-elena-rodriguez.jpg",
    bio: "Fantasy romance author who transports readers to magical worlds filled with adventure and love. Elena has published over 12 bestselling novels and has won multiple awards for her captivating storytelling and rich world-building."
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    toast({
      title: isFollowing ? "Unfollowed" : "Following!",
      description: isFollowing 
        ? `You're no longer following ${authorData.name}` 
        : `You're now following ${authorData.name}`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">About the Author</h2>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={authorData.avatar_url?.startsWith('gradient:') ? undefined : authorData.avatar_url} />
            <AvatarFallback>{authorData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg">{authorData.name}</h3>
              <Button
                variant="outline"
                size="sm"
                className={`border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white bg-transparent ${
                  isFollowing ? 'bg-emerald-600 text-white' : ''
                }`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
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
