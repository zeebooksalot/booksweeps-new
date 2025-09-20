import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { PublicAuthor } from '@/types/author';

interface AuthorHeaderProps {
  author: PublicAuthor;
}

export function AuthorHeader({ author }: AuthorHeaderProps) {
  return (
    <div className="bg-white rounded-lg p-8 shadow-sm border">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0">
          <div className="relative w-32 h-32">
            <Image
              src={author.avatar_url || '/placeholder-author.jpg'}
              alt={author.name}
              fill
              className="rounded-full object-cover"
              priority
            />
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {author.name}
          </h1>
          
          {author.genre && (
            <Badge variant="secondary" className="mb-4">
              {author.genre}
            </Badge>
          )}
          
          {author.bio && (
            <p className="text-gray-600 leading-relaxed text-lg">
              {author.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
