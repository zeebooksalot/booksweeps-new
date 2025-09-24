import { AuthorHeader } from './AuthorHeader';
// import { AuthorBooks } from './AuthorBooks';
import { AuthorFreeBooks } from './AuthorFreeBooks';
import { AuthorCampaigns } from './AuthorCampaigns';
import { AuthorSocialLinks } from './AuthorSocialLinks';
import { AuthorGiveaways } from './AuthorGiveaways';
import { PublicAuthor } from '@/types/author';

interface AuthorProfileProps {
  author: PublicAuthor;
}

export function AuthorProfile({ author }: AuthorProfileProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-0 py-8 pb-16">
      <AuthorHeader author={author} />
      
      <div className="space-y-8 mt-8">
        <AuthorGiveaways author={author} />

        <AuthorFreeBooks books={author.books} authorName={author.name} />

        {/* Removed regular books section; showing only Free Books section */}
        
        {author.campaigns.length > 0 && (
          <AuthorCampaigns campaigns={author.campaigns} />
        )}
        
        <AuthorSocialLinks socialLinks={author.social_links} />
      </div>
    </div>
  );
}
