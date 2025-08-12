// Dashboard-specific types
export interface DownloadHistory {
  id: string
  title: string
  author: string
  cover_url: string
  downloaded_at: string
  format: string
  file_size?: string
}

export interface FavoriteAuthor {
  id: string
  name: string
  avatar_url: string
  bio: string
  books_count: number
  followers_count: number
}

export interface ReadingList {
  id: string
  title: string
  author: string
  cover_url: string
  added_at: string
  status: 'to_read' | 'reading' | 'completed'
}

export interface DashboardStats {
  totalDownloads: number
  totalFavorites: number
  readingProgress: number
  booksCompleted: number
}

export interface DashboardFilters {
  searchQuery: string
  activeTab: string
  sortBy: 'recent' | 'title' | 'author'
  statusFilter: 'all' | 'to_read' | 'reading' | 'completed'
}

export type DashboardTab = 'overview' | 'downloads' | 'favorites' | 'reading-list' | 'settings'
