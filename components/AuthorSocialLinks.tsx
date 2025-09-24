import { 
  FaFacebook, 
  FaInstagram, 
  FaTiktok, 
  FaTwitter, 
  FaYoutube, 
  FaLinkedin,
  FaKickstarterK,
  FaAmazon,
  FaBook
} from 'react-icons/fa';
import { SiSubstack, SiBookbub, SiGoodreads } from 'react-icons/si';
import { PublicAuthor } from '@/types/author';

interface AuthorSocialLinksProps {
  socialLinks?: PublicAuthor['social_links'];
}

const socialIcons = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  twitter: FaTwitter,
  youtube: FaYoutube,
  linkedin: FaLinkedin,
  kickstarter: FaKickstarterK,
  substack: SiSubstack,
  amazon: FaAmazon,
  bookbub: SiBookbub,
  goodreads: SiGoodreads,
};

const socialLabels = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitter: 'Twitter',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  kickstarter: 'Kickstarter',
  substack: 'Substack',
  amazon: 'Amazon',
  bookbub: 'BookBub',
  goodreads: 'Goodreads',
};

export function AuthorSocialLinks({ socialLinks }: AuthorSocialLinksProps) {
  if (!socialLinks || Object.keys(socialLinks).length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl p-8 border border-border">
      <h3 className="font-semibold text-foreground mb-4">Connect</h3>
      
      <div className="flex flex-wrap gap-3">
        {Object.entries(socialLinks).map(([platform, url]) => {
          if (!url) return null;
          
          const Icon = socialIcons[platform as keyof typeof socialIcons];
          const label = socialLabels[platform as keyof typeof socialLabels] || platform;
          
          return (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
