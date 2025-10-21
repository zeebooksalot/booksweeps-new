import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PublicAuthor } from '@/types/author';
import { Plus, Users, Gift, Download } from 'lucide-react';
import Image from 'next/image';

interface AuthorHeaderProps {
  author: PublicAuthor;
}

export function AuthorHeader({ author }: AuthorHeaderProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="bg-card rounded-xl p-8 border border-subtle">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <Avatar className="w-24 h-24 bg-gradient-to-br from-primary to-accent text-foreground dark:text-primary-foreground text-2xl font-bold ring-2 ring-border/20">
            {author.avatar_url ? (
              <Image 
                src={author.avatar_url} 
                alt={author.name}
                fill
                className="object-cover"
                sizes="96px"
                priority
              />
            ) : (
              <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
            )}
          </Avatar>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold text-foreground font-serif">{author.name}</h1>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                onClick={() => {
                  // Mock follow functionality
                  console.log(`Following ${author.name}`);
                }}
              >
                <Plus className="w-4 h-4" />
                Follow
              </Button>
            </div>
          </div>


          {author.bio && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {author.bio}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{author.followers?.toLocaleString() || '0'} followers</span>
            </div>
            <a href="#giveaways" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Gift className="h-4 w-4" />
              {(() => {
                const count = author.campaigns?.length || 0
                const label = count === 1 ? 'active giveaway' : 'active giveaways'
                return <span>{count} {label}</span>
              })()}
            </a>
            <a href="#free-books" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Download className="h-4 w-4" />
              {(() => {
                const count = author.books?.length || 0
                const label = count === 1 ? 'free book available' : 'free books available'
                return <span>{count} {label}</span>
              })()}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
