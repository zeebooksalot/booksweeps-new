import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useApi } from "./use-api"
import { useAuth } from "@/components/auth/AuthProvider-refactored"
import { useCsrf } from "./useCsrf"
import { 
  BookItem, 
  AuthorItem, 
  ApiBook, 
  ApiAuthor, 
  FilterState,
  FeedItem 
} from "@/types"
import { 
  DEFAULT_FILTER_STATE, 
  FALLBACK_DATA, 
  API_CONFIG,
  UI_CONFIG 
} from "@/constants"

export function useHomePage() {
  // Filter state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE)
  
  // Data state
  const [booksData, setBooksData] = useState<BookItem[]>([])
  const [authorsData, setAuthorsData] = useState<AuthorItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Auth
  const { user } = useAuth()
  const { fetchWithCsrf } = useCsrf()
  
  // API hooks
  const booksApi = useApi<{ data: ApiBook[]; pagination: unknown }>()
  const authorsApi = useApi<{ data: ApiAuthor[]; pagination: unknown }>()
  
  // Store fetch functions in refs to avoid dependency issues
  const fetchBooksRef = useRef(booksApi.fetchData)
  const fetchAuthorsRef = useRef(authorsApi.fetchData)
  
  // Update refs when fetch functions change
  fetchBooksRef.current = booksApi.fetchData
  fetchAuthorsRef.current = authorsApi.fetchData

  // Data mapping functions
  const mapBookFromApi = useCallback((book: ApiBook, rank: number): BookItem => ({
    id: book.id,
    type: "book" as const,
    title: book.title,
    author: book.author,
    description: book.description || "",
    cover: book.cover_image_url || "/placeholder.svg?height=80&width=64",
    votes: book.upvotes_count || 0,
    comments: book.comments_count || 0,
    rating: book.rating || 0,
    genres: book.genre ? [book.genre] : [],
    hasGiveaway: book.has_giveaway || false,
    publishDate: book.published_date 
      ? new Date(book.published_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
      : "Unknown",
    rank
  }), [])

  const mapAuthorFromApi = useCallback((author: ApiAuthor, rank: number): AuthorItem => ({
    id: author.id,
    type: "author" as const,
    name: author.name,
    bio: author.bio || "",
    avatar: author.avatar_url || "/placeholder.svg?height=64&width=64",
    votes: author.votes_count || 0,
    books: author.books_count || 0,
    followers: author.followers_count || 0,
    joinedDate: author.joined_date 
      ? new Date(author.joined_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
      : "Unknown",
    hasGiveaway: author.has_giveaway || false,
    rank
  }), [])

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch books and authors in parallel
      const [booksResponse, authorsResponse] = await Promise.all([
        fetchBooksRef.current(`/api/books?sortBy=${filters.sortBy}&limit=${API_CONFIG.defaultLimit}`),
        fetchAuthorsRef.current(`/api/authors?sortBy=${filters.sortBy}&limit=${API_CONFIG.defaultLimit}`)
      ])
      
      // Map the data with proper null checks and error handling
      const mappedBooks = Array.isArray(booksResponse.data) 
        ? booksResponse.data.map((book: ApiBook, index: number) => 
            mapBookFromApi(book, index + 1)
          )
        : []
      const mappedAuthors = Array.isArray(authorsResponse.data)
        ? authorsResponse.data.map((author: ApiAuthor, index: number) => 
            mapAuthorFromApi(author, index + 1)
          )
        : []
      
      // If no data from API, use fallback mock data
      if (mappedBooks.length === 0 && mappedAuthors.length === 0) {
        setBooksData(FALLBACK_DATA.books)
        setAuthorsData(FALLBACK_DATA.authors)
      } else {
        setBooksData(mappedBooks)
        setAuthorsData(mappedAuthors)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters.sortBy, mapBookFromApi, mapAuthorFromApi])

  // Fetch data on component mount and when sortBy changes
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Combine all data
  const allData = useMemo(() => [...booksData, ...authorsData], [booksData, authorsData])

  // Pre-compute search indices for better performance
  const searchIndex = useMemo(() => {
    return allData.map(item => ({
      id: item.id,
      type: item.type,
      searchText: item.type === 'book' 
        ? `${(item as BookItem).title} ${(item as BookItem).author} ${(item as BookItem).description} ${(item as BookItem).genres.join(" ")}`.toLowerCase()
        : `${(item as AuthorItem).name} ${(item as AuthorItem).bio}`.toLowerCase(),
      parsedDate: item.type === 'book' 
        ? new Date((item as BookItem).publishDate).getTime()
        : new Date((item as AuthorItem).joinedDate).getTime(),
      item
    }))
  }, [allData])

  // Filter data based on current filters with optimized logic
  const filteredData = useMemo(() => {
    const now = Date.now()
    
    return searchIndex
      .filter(({ type, searchText, parsedDate, item }) => {
        // Basic tab filtering
        if (filters.activeTab === "books" && type !== "book") return false
        if (filters.activeTab === "authors" && type !== "author") return false
        if (filters.activeTab === "giveaways" && !item.hasGiveaway) return false
        
        // Search query filtering (optimized)
        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase()
          if (!searchText.includes(query)) return false
        }
        
        // Genre filtering (only for books)
        if (filters.selectedGenres.length > 0 && type === "book") {
          const book = item as BookItem
          const hasMatchingGenre = book.genres.some(genre => filters.selectedGenres.includes(genre))
          if (!hasMatchingGenre) return false
        }
        
        // Rating filtering (only for books)
        if (filters.ratingFilter > 0 && type === "book") {
          const book = item as BookItem
          if (book.rating < filters.ratingFilter) return false
        }
        
        // Giveaway filtering
        if (filters.hasGiveaway !== null) {
          if (item.hasGiveaway !== filters.hasGiveaway) return false
        }
        
        // Date range filtering (optimized with pre-computed dates)
        if (filters.dateRange !== "all") {
          switch (filters.dateRange) {
            case "week":
              const weekAgo = now - 7 * 24 * 60 * 60 * 1000
              if (parsedDate < weekAgo) return false
              break
            case "month":
              const monthAgo = now - 30 * 24 * 60 * 60 * 1000
              if (parsedDate < monthAgo) return false
              break
            case "year":
              const yearAgo = now - 365 * 24 * 60 * 60 * 1000
              if (parsedDate < yearAgo) return false
              break
          }
        }
        
        return true
      })
      .map(({ item }) => item)
  }, [searchIndex, filters])

  // Handle voting
  const handleVote = useCallback(async (id: string) => {
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    try {
      // Find the item to determine its type
      const item = allData.find(item => item.id === id)
      if (!item) return
      
      // Mock user ID for now - this should come from authentication
      const userId = user?.id || "mock-user-id"
      
      // Prepare vote data
      const voteData: {
        user_id: string;
        vote_type: string;
        book_id?: string;
        pen_name_id?: string;
      } = {
        user_id: userId,
        vote_type: "upvote"
      }
      
      // Add item-specific data
      if (item.type === "book") {
        voteData.book_id = id
      } else {
        voteData.pen_name_id = id
      }
      
      // Send vote to API with CSRF protection
      const response = await fetchWithCsrf('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      })
      
      if (response.ok) {
        // Optimistically update the UI
        const updatedData = allData.map(item => 
          item.id === id 
            ? { ...item, votes: item.votes + 1 }
            : item
        )
        
        // Update the appropriate state
        const updatedBooks = updatedData.filter(item => item.type === "book") as BookItem[]
        const updatedAuthors = updatedData.filter(item => item.type === "author") as AuthorItem[]
        
        setBooksData(updatedBooks)
        setAuthorsData(updatedAuthors)
      } else {
        console.error('Failed to submit vote')
        throw new Error('Failed to submit vote')
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
      // You could show a toast notification here
    }
  }, [allData, user])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await fetchData()
    setIsRefreshing(false)
  }, [fetchData])

  // Handle swipe actions
  const handleSwipeLeft = useCallback((id: string) => {
    // TODO: Implement skip functionality
  }, [])

  const handleSwipeRight = useCallback((id: string) => {
    handleVote(id)
  }, [handleVote])

  // Update filters
  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE)
  }, [])

  return {
    // State
    filters,
    booksData,
    authorsData,
    isLoading,
    error,
    isRefreshing,
    filteredData,
    allData,
    
    // Actions
    updateFilters,
    resetFilters,
    handleVote,
    handleRefresh,
    handleSwipeLeft,
    handleSwipeRight,
    fetchData
  }
}
