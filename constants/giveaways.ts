export const GIVEAWAY_CONFIG = {
  mobileBreakpoint: 768,
  searchDebounceDelay: 300,
  defaultFilters: {
    searchQuery: '',
    genre: '',
    featured: false,
    endingSoon: false,
    status: 'all' as const,
    prizeType: 'all' as const,
    showAdvancedFilters: false
  },
  defaultSortBy: 'featured'
}

export const GIVEAWAY_GENRES = [
  { value: '', label: 'All Genres' },
  { value: 'Fantasy', label: 'Fantasy' },
  { value: 'Romance', label: 'Romance' },
  { value: 'Mystery', label: 'Mystery' },
  { value: 'Sci-Fi', label: 'Sci-Fi' },
  { value: 'Thriller', label: 'Thriller' },
  { value: 'Historical', label: 'Historical' },
  { value: 'Contemporary', label: 'Contemporary' }
] as const

export const GIVEAWAY_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'ending_soon', label: 'Ending Soon' }
] as const

export const GIVEAWAY_PRIZE_TYPES = [
  { value: 'all', label: 'All Prizes' },
  { value: 'signed', label: 'Signed Copies' },
  { value: 'digital', label: 'Digital Copies' },
  { value: 'physical', label: 'Physical Copies' }
] as const

export const GIVEAWAY_SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'ending_soon', label: 'Ending Soon' },
  { value: 'most_entries', label: 'Most Entries' },
  { value: 'newest', label: 'Newest' }
] as const

export const GIVEAWAY_TEXT = {
  loading: 'Loading giveaways...',
  error: 'Failed to load giveaways',
  noGiveaways: {
    title: 'No giveaways found',
    description: 'Try adjusting your search or filters'
  },
  filters: {
    title: 'Advanced Filters',
    clearAll: 'Clear All',
    genre: 'Genre',
    status: 'Status',
    prizeType: 'Prize Type',
    featured: 'Featured Only',
    endingSoon: 'Ending Soon'
  },
  stats: {
    entries: 'entries',
    winners: 'winners',
    timeRemaining: 'left',
    ended: 'Ended',
    endingSoon: 'Ending soon'
  },
  entry: {
    title: 'Enter Giveaway',
    email: 'Email Address',
    submit: 'Enter Giveaway',
    submitting: 'Entering...',
    success: 'Successfully entered!',
    error: 'Failed to enter giveaway'
  }
}

export const GIVEAWAY_STYLES = {
  container: 'min-h-screen bg-gray-50 dark:bg-gray-900',
  mainContent: 'max-w-7xl mx-auto px-4 py-8',
  card: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow',
  filterPanel: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6',
  emptyState: 'flex items-center justify-center min-h-[60vh]',
  loadingState: 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50',
  badge: {
    featured: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    endingSoon: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    ended: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
}

export const MOCK_GIVEAWAYS = [
  {
    id: "1",
    title: "Win 'Ocean's Echo' - Fantasy Romance",
    description: "Enter to win a signed copy of this magical tale of love and adventure beneath the waves.",
    book: {
      id: "1",
      title: "Ocean's Echo",
      author: "Elena Rodriguez",
      cover_image_url: "/placeholder.svg?height=80&width=64",
      genre: "Fantasy",
      description: "A magical tale of love and adventure beneath the waves."
    },
    author: {
      id: "1",
      name: "Elena Rodriguez",
      avatar_url: "/placeholder.svg?height=64&width=64",
      bio: "Fantasy romance author who transports readers to magical worlds."
    },
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    max_entries: 1000,
    entry_count: 156,
    number_of_winners: 5,
    prize_description: "Signed copy of Ocean's Echo",
    rules: "Open to US residents 18+. One entry per person.",
    status: 'active' as const,
    is_featured: true,
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  },
  {
    id: "2",
    title: "The Last Garden - Post-Apocalyptic Giveaway",
    description: "Win a copy of this hope-filled post-apocalyptic tale.",
    book: {
      id: "2",
      title: "The Last Garden",
      author: "Maria Santos",
      cover_image_url: "/placeholder.svg?height=80&width=64",
      genre: "Post-Apocalyptic",
      description: "Hope blooms in the most unexpected places."
    },
    author: {
      id: "2",
      name: "Maria Santos",
      avatar_url: "/placeholder.svg?height=64&width=64",
      bio: "Post-apocalyptic fiction writer who explores themes of hope."
    },
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    max_entries: 500,
    entry_count: 89,
    number_of_winners: 3,
    prize_description: "Digital copy of The Last Garden",
    rules: "Open worldwide 18+. One entry per person.",
    status: 'active' as const,
    is_featured: false,
    created_at: "2024-01-01",
    updated_at: "2024-01-01"
  }
] as const
