import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PublicAuthor } from '@/types/author';
import { Gift, Calendar, Users, BookOpen, Headphones, Book } from 'lucide-react';

interface AuthorGiveawaysProps {
  author: PublicAuthor;
}

export function AuthorGiveaways({ author }: AuthorGiveawaysProps) {
  // Mock data for giveaways
  const giveaways = [
    {
      id: 1,
      title: "Ebook Collection Giveaway",
      description: "Win the complete digital collection of Pride and Prejudice variations in multiple formats!",
      endDate: "Feb 14, 2024",
      entries: "1,247 entries",
      status: "active",
      type: "ebook" as const,
    },
    {
      id: 2,
      title: "Audiobook Bundle",
      description: "Enter to win professionally narrated audiobooks of the complete Austen series.",
      endDate: "Jan 29, 2024",
      entries: "892 entries",
      status: "active",
      type: "audiobook" as const,
    },
    {
      id: 3,
      title: "Signed Print Edition",
      description: "Win a signed hardcover first edition plus exclusive bookmarks and reading accessories.",
      endDate: "Feb 28, 2024",
      entries: "654 entries",
      status: "active",
      type: "print" as const,
    },
  ]

  const getGiveawayIcon = (type: string) => {
    switch (type) {
      case "ebook":
        return <BookOpen className="text-accent flex-shrink-0 h-5 w-5" />
      case "audiobook":
        return <Headphones className="text-accent flex-shrink-0 h-5 w-5" />
      case "print":
        return <Book className="text-accent flex-shrink-0 h-5 w-5" />
      default:
        return <BookOpen className="text-accent flex-shrink-0 h-5 w-5" />
    }
  }

  return (
    <div id="giveaways" className="bg-card rounded-xl p-8 border border-subtle">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground font-serif">{author.name} Book Giveaways</h2>
        <Badge variant="outline" className="text-accent border-accent">
          {giveaways.length} Active
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {giveaways.map((giveaway) => (
          <div key={giveaway.id} className="bg-secondary rounded-xl p-6 border border-faint hover:border-subtle transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-lg text-foreground">{giveaway.title}</h3>
              {getGiveawayIcon(giveaway.type)}
            </div>

            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{giveaway.description}</p>

            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Ends {giveaway.endDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{giveaway.entries}</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white bg-transparent"
            >
              Enter Giveaway
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}