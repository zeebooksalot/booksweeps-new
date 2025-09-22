import { AuthorHeader } from './AuthorHeader';
import { AuthorBooks } from './AuthorBooks';
import { AuthorCampaigns } from './AuthorCampaigns';
import { AuthorSocialLinks } from './AuthorSocialLinks';
import { AuthorGiveaways } from './AuthorGiveaways';
import { PublicAuthor } from '@/types/author';

interface AuthorProfileProps {
  author: PublicAuthor;
}

export function AuthorProfile({ author }: AuthorProfileProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <AuthorHeader author={author} />
      
      <div className="grid gap-8 lg:grid-cols-4 mt-8">
        <div className="lg:col-span-3 space-y-8">
          <AuthorGiveaways author={author} />
          
          {author.books.length > 0 && (
            <AuthorBooks books={author.books} />
          )}
          
          {author.campaigns.length > 0 && (
            <AuthorCampaigns campaigns={author.campaigns} />
          )}
        </div>
        
        <div className="space-y-6">
          <AuthorSocialLinks socialLinks={author.social_links} />
          
          {author.website && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Official Website</h3>
              <a 
                href={author.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {author.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
