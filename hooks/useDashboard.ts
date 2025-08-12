import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/components/auth/AuthProvider-refactored"
import { 
  DownloadHistory, 
  FavoriteAuthor, 
  ReadingList, 
  DashboardStats,
  DashboardFilters,
  DashboardTab 
} from "@/types/dashboard"
import { 
  MOCK_DASHBOARD_DATA, 
  DEFAULT_DASHBOARD_STATS, 
  DEFAULT_DASHBOARD_FILTERS,
  DASHBOARD_CONFIG 
} from "@/constants/dashboard"

export function useDashboard() {
  // Auth state
  const { user, userProfile, loading } = useAuth()
  
  // Data state
  const [downloads, setDownloads] = useState<DownloadHistory[]>([])
  const [favorites, setFavorites] = useState<FavoriteAuthor[]>([])
  const [readingList, setReadingList] = useState<ReadingList[]>([])
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_DASHBOARD_STATS)
  
  // UI state
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  
  // Filter state
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_DASHBOARD_FILTERS)

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < DASHBOARD_CONFIG.mobileBreakpoint)
    }
    
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user) return
    
    setIsLoadingData(true)
    setDataError(null)
    
    try {
      // TODO: Replace with actual API calls
      // For now, using mock data
      const mockDownloads = MOCK_DASHBOARD_DATA.downloads
      const mockFavorites = MOCK_DASHBOARD_DATA.favorites
      const mockReadingList = MOCK_DASHBOARD_DATA.readingList
      
      setDownloads(mockDownloads)
      setFavorites(mockFavorites)
      setReadingList(mockReadingList)
      
      // Calculate stats
      const calculatedStats: DashboardStats = {
        totalDownloads: mockDownloads.length,
        totalFavorites: mockFavorites.length,
        readingProgress: mockReadingList.filter(item => item.status === 'reading').length,
        booksCompleted: mockReadingList.filter(item => item.status === 'completed').length
      }
      setStats(calculatedStats)
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setDataError('Failed to load dashboard data. Please try again later.')
    } finally {
      setIsLoadingData(false)
    }
  }, [user])

  // Load data when user is available
  useEffect(() => {
    if (!loading) {
      fetchDashboardData()
    }
  }, [loading, fetchDashboardData])

  // Update filters
  const updateFilters = useCallback((updates: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_DASHBOARD_FILTERS)
  }, [])

  // Filter data based on current filters
  const filteredDownloads = useMemo(() => {
    return downloads.filter(item => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const searchText = `${item.title} ${item.author}`.toLowerCase()
        if (!searchText.includes(query)) return false
      }
      return true
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'author':
          return a.author.localeCompare(b.author)
        case 'recent':
        default:
          return new Date(b.downloaded_at).getTime() - new Date(a.downloaded_at).getTime()
      }
    })
  }, [downloads, filters.searchQuery, filters.sortBy])

  const filteredFavorites = useMemo(() => {
    return favorites.filter(item => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const searchText = `${item.name} ${item.bio}`.toLowerCase()
        if (!searchText.includes(query)) return false
      }
      return true
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'title':
          return a.name.localeCompare(b.name)
        case 'author':
          return a.name.localeCompare(b.name)
        case 'recent':
        default:
          return b.followers_count - a.followers_count
      }
    })
  }, [favorites, filters.searchQuery, filters.sortBy])

  const filteredReadingList = useMemo(() => {
    return readingList.filter(item => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const searchText = `${item.title} ${item.author}`.toLowerCase()
        if (!searchText.includes(query)) return false
      }
      
      if (filters.statusFilter !== 'all') {
        if (item.status !== filters.statusFilter) return false
      }
      
      return true
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'author':
          return a.author.localeCompare(b.author)
        case 'recent':
        default:
          return new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
      }
    })
  }, [readingList, filters.searchQuery, filters.sortBy, filters.statusFilter])

  // Refresh data
  const refreshData = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Handle tab change
  const handleTabChange = useCallback((tab: DashboardTab) => {
    updateFilters({ activeTab: tab })
  }, [updateFilters])

  return {
    // Data
    downloads: filteredDownloads,
    favorites: filteredFavorites,
    readingList: filteredReadingList,
    stats,
    
    // State
    isLoadingData,
    dataError,
    isMobileView,
    filters,
    
    // Actions
    updateFilters,
    resetFilters,
    refreshData,
    handleTabChange,
    
    // Auth state
    user,
    userProfile,
    loading
  }
}
