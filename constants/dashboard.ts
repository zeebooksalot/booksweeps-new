import { DownloadHistory, FavoriteAuthor, ReadingList } from '@/types/dashboard'

// Dashboard configuration
export const DASHBOARD_CONFIG = {
  mobileBreakpoint: 768,
  defaultTab: 'overview' as const,
  searchDebounceDelay: 300,
  itemsPerPage: 10,
  refreshInterval: 60000, // 1 minute (increased from 30 seconds)
  minRefreshInterval: 2000, // 2 seconds minimum between refreshes
} as const

// Tab configuration
export const DASHBOARD_TABS = {
  overview: {
    id: 'overview',
    label: 'Overview',
    icon: 'Home',
    description: 'Your reading activity and stats'
  },
  downloads: {
    id: 'downloads',
    label: 'Downloads',
    icon: 'Download',
    description: 'Books you\'ve downloaded'
  },
  favorites: {
    id: 'favorites',
    label: 'Favorites',
    icon: 'Heart',
    description: 'Your favorite authors'
  },
  'reading-list': {
    id: 'reading-list',
    label: 'Reading List',
    icon: 'BookOpen',
    description: 'Books you want to read'
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    description: 'Account and preferences'
  }
} as const

// Status colors for reading list items
export const STATUS_COLORS = {
  reading: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  to_read: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
} as const

// Mock data for development
export const MOCK_DASHBOARD_DATA = {
  downloads: [
    {
      id: "1",
      title: "The Lost Chapter",
      author: "Elena Rodriguez",
      cover_url: "/placeholder.svg?height=100&width=70",
      downloaded_at: "2024-01-20",
      format: "PDF",
      file_size: "2.3 MB"
    },
    {
      id: "2",
      title: "Prequel: The Beginning",
      author: "Michael Chen",
      cover_url: "/placeholder.svg?height=100&width=70",
      downloaded_at: "2024-01-18",
      format: "EPUB",
      file_size: "1.8 MB"
    },
    {
      id: "3",
      title: "Bonus Content: Character Profiles",
      author: "Jessica Lee",
      cover_url: "/placeholder.svg?height=100&width=70",
      downloaded_at: "2024-01-15",
      format: "PDF",
      file_size: "3.1 MB"
    }
  ] as DownloadHistory[],
  
  favorites: [
    {
      id: "1",
      name: "Elena Rodriguez",
      avatar_url: "/placeholder.svg?height=64&width=64",
      bio: "Bestselling fantasy romance author",
      books_count: 12,
      followers_count: 45000
    },
    {
      id: "2",
      name: "Michael Chen",
      avatar_url: "/placeholder.svg?height=64&width=64",
      bio: "Sci-fi and mystery writer",
      books_count: 8,
      followers_count: 32000
    },
    {
      id: "3",
      name: "Jessica Lee",
      avatar_url: "/placeholder.svg?height=64&width=64",
      bio: "Contemporary romance specialist",
      books_count: 15,
      followers_count: 28000
    }
  ] as FavoriteAuthor[],
  
  readingList: [
    {
      id: "1",
      title: "Ocean's Echo",
      author: "Elena Rodriguez",
      cover_url: "/placeholder.svg?height=100&width=70",
      added_at: "2024-01-20",
      status: 'reading' as const
    },
    {
      id: "2",
      title: "The Quantum Garden",
      author: "Michael Chen",
      cover_url: "/placeholder.svg?height=100&width=70",
      added_at: "2024-01-18",
      status: 'to_read' as const
    },
    {
      id: "3",
      title: "Love in the City",
      author: "Jessica Lee",
      cover_url: "/placeholder.svg?height=100&width=70",
      added_at: "2024-01-15",
      status: 'completed' as const
    }
  ] as ReadingList[]
} as const

// Default dashboard stats
export const DEFAULT_DASHBOARD_STATS = {
  totalBooks: 0,
  totalAuthors: 0,
  totalVotes: 0,
  totalGiveaways: 0,
  recentActivity: [] as Array<{
    id: string
    type: 'vote' | 'giveaway' | 'book' | 'author'
    title: string
    timestamp: string
  }>
}

// Default filters
export const DEFAULT_DASHBOARD_FILTERS = {
  searchQuery: "",
  activeTab: DASHBOARD_CONFIG.defaultTab,
  sortBy: 'recent' as const,
  statusFilter: 'all' as const
} as const
