import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PublicAuthor } from '@/types/author';
import { Plus } from 'lucide-react';

interface AuthorHeaderProps {
  author: PublicAuthor;
}

export function AuthorHeader({ author }: AuthorHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <div className="relative w-32 h-32">
            {author.avatar_url ? (
              <Image
                src={author.avatar_url}
                alt={author.name}
                fill
                className="rounded-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {author.name}
            </h1>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
              onClick={() => {
                // Mock follow functionality
                console.log(`Following ${author.name}`);
              }}
            >
              <Plus className="w-4 h-4" />
              Follow
            </Button>
          </div>
          
          {author.genre && (
            <Badge variant="secondary" className="mb-4 border border-gray-300 dark:border-gray-600">
              {author.genre}
            </Badge>
          )}
          
          {author.bio && (
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              {author.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
