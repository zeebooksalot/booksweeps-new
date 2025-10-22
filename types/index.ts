// Base types
export interface BaseItem {
  id: string
  type: 'book' | 'author' | 'giveaway'
  rank: number
}

// Book types
export interface BookItem extends BaseItem {
  type: 'book'
  title: string
  author: string
  description: string
  cover: string
  votes: number
  comments: number
  rating: number
  genres: string[]
  hasGiveaway: boolean
  publishDate: string
  downloadSlug?: string | null
}

export interface BookDeliveryMethod {
  id: string
  slug: string
  format: string
  delivery_method: string
  is_active: boolean
}

export interface ApiBook {
  id: string
  title: string
  author: string
  description?: string
  cover_image_url?: string
  upvotes_count?: number
  comments_count?: number
  rating?: number
  genre?: string
  has_giveaway?: boolean
  published_date?: string
  book_delivery_methods?: BookDeliveryMethod[]
}

// Author types
export interface AuthorItem extends BaseItem {
  type: 'author'
  name: string
  bio: string
  avatar: string
  votes: number
  books: number
  followers: number
  joinedDate: string
  hasGiveaway?: boolean
}

// Giveaway types for homepage
export interface GiveawayItem extends BaseItem {
  type: 'giveaway'
  title: string
  description: string
  bookTitle: string
  bookAuthor: string
  bookCover: string
  authorName: string
  authorAvatar: string
  endDate: string
  entryCount: number
  maxEntries: number
  prizeDescription: string
  isFeatured: boolean
  votes: number
}

export interface ApiAuthor {
  id: string
  name: string
  bio?: string
  avatar_url?: string
  votes_count?: number
  books_count?: number
  followers_count?: number
  joined_date?: string
  has_giveaway?: boolean
}

// Giveaway types
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
  status: 'active' | 'ended' | 'draft' | string
  is_featured?: boolean
  created_at: string
  updated_at: string
  book_cover_url?: string
  campaign_genre?: string
  book_description?: string
  author_name?: string
}

// Reader magnet types
export interface ReaderMagnet {
  id: string
  title: string
  description: string
  format: string
  author: string
  book: {
    title: string
    cover_image_url: string
    genre: string
    page_count: number
  }
  download_count: number
  created_at: string
  is_active: boolean
}

// Filter types
export interface FilterState {
  activeTab: string
  searchQuery: string
  sortBy: string
  selectedGenres: string[]
  dateRange: string
  ratingFilter: number
  hasGiveaway: boolean | null
  showAdvancedFilters: boolean
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

// Data state types
export interface DataState<T = any> {
  data: T[]
  isLoading: boolean
  error: string | null
}

export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationState
}

// Feed item union type
export type FeedItem = BookItem | AuthorItem | GiveawayItem

// Feed item display specific types
export interface FeedItemDisplayProps {
  item: FeedItem
  isMobileView: boolean
  onVote: (id: string) => void
  onSwipeLeft: (id: string) => void
  onSwipeRight: (id: string) => void
  downloadSlug?: string
}

export interface MobileSwipeState {
  startX: number
  currentX: number
  isDragging: boolean
  isVoting: boolean
}
