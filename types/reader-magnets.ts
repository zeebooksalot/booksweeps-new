export interface ReaderMagnet {
  id: string
  slug: string
  title: string
  description: string
  format: 'pdf' | 'epub' | 'mobi' | 'chapter'
  download_count: number
  created_at: string
  is_active: boolean
  books: {
    id: string
    title: string
    author: string
    cover_image_url: string
    genre: string
    page_count?: number
  }
  pen_names?: {
    bio: string
    website?: string
  }
}

export interface ReaderMagnetFilters {
  searchTerm: string
  selectedGenre: string
  selectedFormat: string
  showAdvancedFilters: boolean
}

export interface ReaderMagnetFeedItem {
  id: string
  type: "book"
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
  rank: number
  slug: string
  format: string
  download_count: number
}

export interface ReaderMagnetListProps {
  magnets: ReaderMagnet[]
  isMobileView: boolean
  onVote: (id: string) => void
  onSwipeLeft: (id: string) => void
  onSwipeRight: (id: string) => void
}

export interface ReaderMagnetFiltersProps {
  filters: ReaderMagnetFilters
  onFiltersChange: (updates: Partial<ReaderMagnetFilters>) => void
  onResetFilters: () => void
  isMobileView: boolean
  uniqueGenres: string[]
}
