export interface PublicAuthor {
  id: string;
  slug: string;
  name: string;
  bio?: string;
  genre?: string;
  website?: string;
  avatar_url?: string;
  followers?: number;
  social_links?: {
    amazon?: string;
    bookbub?: string;
    goodreads?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    threads?: string;
    bluesky?: string;
    kickstarter?: string;
    substack?: string;
  };
  created_at: string;
  books: PublicBook[];
  campaigns: PublicCampaign[];
}

export interface PublicBook {
  id: string;
  title: string;
  author: string;
  description?: string;
  cover_image_url?: string;
  page_count?: number;
  language?: string;
  created_at: string;
}

export interface PublicCampaign {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}
