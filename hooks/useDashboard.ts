import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
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

// Cache interface for dashboard data
interface DashboardCache {
  downloads: DownloadHistory[]
  favorites: FavoriteAuthor[]
  readingList: ReadingList[]
  stats: DashboardStats
  timestamp: number
  userId: string
}

// Cache storage key
const CACHE_KEY = 'dashboard_cache'

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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number>(0)
  
  // Filter state
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_DASHBOARD_FILTERS)
  
  // Cache and refresh state
  const cacheRef = useRef<DashboardCache | null>(null)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastRefreshRef = useRef<number>(0)

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsedCache = JSON.parse(cached) as DashboardCache
        cacheRef.current = parsedCache
        console.log('📦 Loaded cache from localStorage:', {
          userId: parsedCache.userId,
          age: Math.round((Date.now() - parsedCache.timestamp) / 1000) + 's'
        })
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error)
      localStorage.removeItem(CACHE_KEY)
    }
  }, [])

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < DASHBOARD_CONFIG.mobileBreakpoint)
    }
    
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

  // Check if cache is valid
  const isCacheValid = useCallback((cache: DashboardCache | null, userId: string) => {
    if (!cache || cache.userId !== userId) return false
    
    const now = Date.now()
    const cacheAge = now - cache.timestamp
    const maxCacheAge = 5 * 60 * 1000 // 5 minutes cache validity
    
    console.log('Cache validation:', {
      hasCache: !!cache,
      cacheAge: Math.round(cacheAge / 1000) + 's',
      maxCacheAge: Math.round(maxCacheAge / 1000) + 's',
      isValid: cacheAge < maxCacheAge
    })
    
    return cacheAge < maxCacheAge
  }, [])

  // Load data from cache
  const loadFromCache = useCallback((cache: DashboardCache) => {
    const startTime = Date.now()
    console.log('📦 Loading data from cache')
    
    setDownloads(cache.downloads)
    setFavorites(cache.favorites)
    setReadingList(cache.readingList)
    setStats(cache.stats)
    setLastUpdated(cache.timestamp)
    setIsLoadingData(false)
    setDataError(null)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    console.log(`⚡ Instant load from cache! (${duration}ms)`)
  }, [])

  // Fetch dashboard data with caching
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    if (!user) return
    
    const startTime = Date.now()
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshRef.current
    
    // Prevent rapid successive refreshes (minimum 100ms between refreshes)
    if (!forceRefresh && timeSinceLastRefresh < 100) {
      console.log('Skipping refresh - too soon since last refresh')
      return
    }
    
    // Check cache first (unless forcing refresh)
    if (!forceRefresh && isCacheValid(cacheRef.current, user.id)) {
      console.log('✅ Loading from cache - instant response')
      loadFromCache(cacheRef.current!)
      return
    }
    
    console.log('🔄 Fetching fresh data...')
    
    // Set loading state (minimal delay for UI feedback)
    if (forceRefresh) {
      setIsRefreshing(true)
    } else {
      // Only show loading if we don't have cached data
      if (!cacheRef.current) {
        setIsLoadingData(true)
      }
    }
    setDataError(null)
    
    try {
      // TODO: Replace with actual API calls
      // For now, using mock data (no artificial delay)
      const mockDownloads = MOCK_DASHBOARD_DATA.downloads
      const mockFavorites = MOCK_DASHBOARD_DATA.favorites
      const mockReadingList = MOCK_DASHBOARD_DATA.readingList
      
      // Calculate stats
      const calculatedStats: DashboardStats = {
        totalDownloads: mockDownloads.length,
        totalFavorites: mockFavorites.length,
        readingProgress: mockReadingList.filter(item => item.status === 'reading').length,
        booksCompleted: mockReadingList.filter(item => item.status === 'completed').length
      }
      
      // Update state
      setDownloads(mockDownloads)
      setFavorites(mockFavorites)
      setReadingList(mockReadingList)
      setStats(calculatedStats)
      setLastUpdated(now)
      
      // Update cache
      const newCache = {
        downloads: mockDownloads,
        favorites: mockFavorites,
        readingList: mockReadingList,
        stats: calculatedStats,
        timestamp: now,
        userId: user.id
      }
      
      cacheRef.current = newCache
      lastRefreshRef.current = now
      
      // Save to localStorage
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(newCache))
        console.log('💾 Saved cache to localStorage')
      } catch (error) {
        console.warn('Failed to save cache to localStorage:', error)
      }
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setDataError('Failed to load dashboard data. Please try again later.')
    } finally {
      const endTime = Date.now()
      const duration = endTime - startTime
      console.log(`⏱️ Dashboard refresh completed in ${duration}ms`)
      
      setIsLoadingData(false)
      setIsRefreshing(false)
    }
  }, [user, isCacheValid, loadFromCache])

  // Load data when user is available and auth is not loading
  useEffect(() => {
    if (user && !loading) {
      fetchDashboardData()
    }
  }, [user, loading, fetchDashboardData])

  // Set up automatic refresh
  useEffect(() => {
    if (!user) return
    
    const setupRefresh = () => {
      // Clear existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      
      // Set up next refresh
      refreshTimeoutRef.current = setTimeout(() => {
        console.log('Auto-refreshing dashboard data')
        fetchDashboardData()
        setupRefresh() // Schedule next refresh
      }, DASHBOARD_CONFIG.refreshInterval)
    }
    
    setupRefresh()
    
    // Cleanup on unmount or user change
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [user, fetchDashboardData])

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

  // Refresh data (force refresh)
  const refreshData = useCallback(() => {
    fetchDashboardData(true)
  }, [fetchDashboardData])

  // Clear cache
  const clearCache = useCallback(() => {
    console.log('🗑️ Clearing cache')
    cacheRef.current = null
    lastRefreshRef.current = 0
    try {
      localStorage.removeItem(CACHE_KEY)
      console.log('🗑️ Cleared cache from localStorage')
    } catch (error) {
      console.warn('Failed to clear cache from localStorage:', error)
    }
  }, [])

  // Debug cache status
  const getCacheStatus = useCallback(() => {
    const cache = cacheRef.current
    if (!cache) return 'No cache'
    
    const now = Date.now()
    const age = now - cache.timestamp
    const isValid = isCacheValid(cache, user?.id || '')
    
    return {
      hasCache: true,
      age: Math.round(age / 1000) + 's',
      isValid,
      userId: cache.userId
    }
  }, [user?.id, isCacheValid])

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
    isRefreshing,
    dataError,
    isMobileView,
    filters,
    lastUpdated,
    
    // Actions
    updateFilters,
    resetFilters,
    refreshData,
    clearCache,
    getCacheStatus,
    handleTabChange,
    
    // Auth state
    user,
    userProfile,
    loading
  }
}
