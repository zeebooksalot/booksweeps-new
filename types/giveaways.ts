export interface GiveawayBook {
  id: string
  title: string
  author: string
  cover_image_url: string
  genre: string
  description: string
}

export interface GiveawayAuthor {
  id: string
  name: string
  avatar_url: string
  bio: string
}

export interface Giveaway {
  id: string
  title: string
  description: string
  book: GiveawayBook
  author: GiveawayAuthor
  start_date: string
  end_date: string
  max_entries: number
  entry_count: number
  number_of_winners: number
  prize_description: string
  rules: string
  status: 'active' | 'ended' | 'draft'
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface ApiCampaign {
  id: string
  title: string
  description?: string
  book_id: string
  book?: {
    id: string
    title: string
    author: string
    cover_image_url: string
    genre: string
  }
  pen_names?: {
    id: string
    name: string
    bio: string
    avatar_url: string
  }
  users?: {
    id: string
    display_name: string
    first_name: string
    last_name: string
  }
  start_date: string
  end_date: string
  max_entries?: number
  entry_count?: number
  number_of_winners?: number
  prize_description?: string
  rules?: string
  status: string
  is_featured?: boolean
  created_at: string
  updated_at: string
  book_cover_url?: string
  campaign_genre?: string
  book_description?: string
  author_name?: string
}

export interface GiveawayFilters {
  searchQuery: string
  genre: string
  featured: boolean
  endingSoon: boolean
  status: 'all' | 'active' | 'ending_soon'
  prizeType: 'all' | 'signed' | 'digital' | 'physical'
  showAdvancedFilters: boolean
}

export interface GiveawaySortOptions {
  featured: string
  ending_soon: string
  most_entries: string
  newest: string
}

export interface GiveawayCardProps {
  giveaway: Giveaway
  onEnter: (id: string) => void
  isMobileView: boolean
}

export interface GiveawayListProps {
  giveaways: Giveaway[]
  onEnter: (id: string) => void
  isMobileView: boolean
}

export interface GiveawayFiltersProps {
  filters: GiveawayFilters
  onFiltersChange: (updates: Partial<GiveawayFilters>) => void
  onResetFilters: () => void
  isMobileView: boolean
  sortBy: string
  onSortChange: (sortBy: string) => void
}

export interface GiveawayEntryFormProps {
  giveaway: Giveaway
  onSubmit: (email: string) => Promise<void>
  isSubmitting: boolean
  isSubmitted: boolean
}

export interface GiveawayStatsProps {
  giveaway: Giveaway
  isMobileView: boolean
}
