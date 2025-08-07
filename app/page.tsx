"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  ChevronDown,
  MessageCircle,
  Tag,
  BookOpen,
  Mail,
  Filter,
  TrendingUp,
  Clock,
  Star,
  Home,
  Compass,
  Trophy,
  User,
  Menu,
  X,
  Mic,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle, SimpleThemeToggle } from "@/components/theme-toggle"
import { FeedItemDisplay } from "@/components/feed-item-display"
import { useApi } from "@/hooks/use-api"

interface BookItem {
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
}

interface AuthorItem {
  id: string
  type: "author"
  name: string
  bio: string
  avatar: string
  votes: number
  books: number
  followers: number
  joinedDate: string
  hasGiveaway?: boolean
  rank: number
}

type FeedItem = BookItem | AuthorItem





export default function BookSweepsHomepage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("trending")
  const [isMobileView, setIsMobileView] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Advanced filtering state
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<number>(0)
  const [hasGiveaway, setHasGiveaway] = useState<boolean | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Data fetching state
  const [booksData, setBooksData] = useState<BookItem[]>([])
  const [authorsData, setAuthorsData] = useState<AuthorItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // API hooks
  const booksApi = useApi<{ books: any[]; pagination: any }>()
  const authorsApi = useApi<{ authors: any[]; pagination: any }>()

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Data mapping functions
  const mapBookFromApi = (book: any, rank: number): BookItem => ({
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
    publishDate: book.published_date ? new Date(book.published_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Unknown",
    rank
  })

  const mapAuthorFromApi = (author: any, rank: number): AuthorItem => ({
    id: author.id,
    type: "author" as const,
    name: author.name,
    bio: author.bio || "",
    avatar: author.avatar_url || "/placeholder.svg?height=64&width=64",
    votes: author.votes_count || 0,
    books: author.books_count || 0,
    followers: author.followers_count || 0,
    joinedDate: author.joined_date ? new Date(author.joined_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Unknown",
    hasGiveaway: author.has_giveaway || false,
    rank
  })

  // Fetch data from APIs
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch books and authors in parallel
      const [booksResponse, authorsResponse] = await Promise.all([
        booksApi.fetchData(`/api/books?sortBy=${sortBy}&limit=10`),
        authorsApi.fetchData(`/api/authors?sortBy=${sortBy}&limit=10`)
      ])
      
      // Map the data
      const mappedBooks = booksResponse.books.map((book: any, index: number) => mapBookFromApi(book, index + 1))
      const mappedAuthors = authorsResponse.authors.map((author: any, index: number) => mapAuthorFromApi(author, index + 1))
      
      // If no data from API, use fallback mock data
      if (mappedBooks.length === 0 && mappedAuthors.length === 0) {
        const fallbackBooks: BookItem[] = [
          {
            id: "1",
            type: "book" as const,
            title: "Ocean's Echo",
            author: "Elena Rodriguez",
            description: "A magical tale of love and adventure beneath the waves that explores the depths of human connection and the mysteries of the ocean.",
            cover: "/placeholder.svg?height=80&width=64",
            votes: 430,
            comments: 89,
            rating: 4.5,
            genres: ["Fantasy", "Romance", "Adventure"],
            hasGiveaway: false,
            publishDate: "Mar 2024",
            rank: 1,
          },
          {
            id: "2",
            type: "book" as const,
            title: "The Last Garden",
            author: "Maria Santos",
            description: "Hope blooms in the most unexpected places in this post-apocalyptic tale that reminds us of the resilience of the human spirit.",
            cover: "/placeholder.svg?height=80&width=64",
            votes: 308,
            comments: 156,
            rating: 4.7,
            genres: ["Post-Apocalyptic", "Dystopian", "Hope"],
            hasGiveaway: true,
            publishDate: "Feb 2024",
            rank: 2,
          },
        ]
        
        const fallbackAuthors: AuthorItem[] = [
          {
            id: "3",
            type: "author" as const,
            name: "Elena Rodriguez",
            bio: "Fantasy romance author who transports readers to magical worlds filled with adventure and love. Known for her vivid world-building and compelling characters that stay with readers long after the final page.",
            avatar: "/placeholder.svg?height=64&width=64",
            votes: 418,
            books: 5,
            followers: 23500,
            joinedDate: "Jul 2018",
            rank: 3,
          },
          {
            id: "4",
            type: "author" as const,
            name: "Sarah Johnson",
            bio: "Bestselling author of contemporary fiction with over 3 million books sold worldwide. Her work has been translated into 15 languages and adapted for screen.",
            avatar: "/placeholder.svg?height=64&width=64",
            votes: 182,
            books: 8,
            followers: 45200,
            joinedDate: "Mar 2020",
            rank: 4,
          },
        ]
        
        setBooksData(fallbackBooks)
        setAuthorsData(fallbackAuthors)
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
  }

  // Fetch data on component mount and when sortBy changes
  useEffect(() => {
    fetchData()
  }, [sortBy])

  // Combine and filter data based on activeTab
  const allData = [...booksData, ...authorsData]
  const filteredData = allData.filter((item) => {
    if (activeTab === "all") return true
    if (activeTab === "books") return item.type === "book"
    if (activeTab === "authors") return item.type === "author"
    if (activeTab === "giveaways") return item.hasGiveaway
    return true
  })

  const handleVote = async (id: string) => {
    console.log(`Voted for item ${id}`)
    
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    try {
      // Find the item to determine its type
      const item = allData.find(item => item.id === id)
      if (!item) return
      
      // Mock user ID for now - this should come from authentication
      const userId = "mock-user-id"
      
      // Prepare vote data
      const voteData: any = {
        user_id: userId,
        vote_type: "upvote"
      }
      
      // Add item-specific data
      if (item.type === "book") {
        voteData.book_id = id
      } else {
        voteData.pen_name_id = id
      }
      
      // Send vote to API
      const response = await fetch('/api/votes', {
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
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
    }
  }

  const handleSwipeLeft = (id: string) => {
    console.log(`Skipped item ${id}`)
  }

  const handleSwipeRight = (id: string) => {
    handleVote(id)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    setIsRefreshing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:bg-white md:dark:bg-gray-900 transition-colors">
      {/* Mobile Header */}
      <header className="fixed top-0 z-20 w-full border-b-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
        <div className="mx-auto max-w-6xl px-4 py-3 md:py-4 lg:px-0">
          <div className="flex items-center justify-between">
            {/* Mobile Layout */}
            <div className="flex items-center gap-3 md:gap-8 w-full md:w-auto">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-orange-500" />
                <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">BookSweeps</span>
              </Link>

              {/* Mobile Search Toggle */}
              <div className="flex-1 md:hidden">
                {showMobileSearch ? (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                        placeholder="Search books and authors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 w-full rounded-full border-0 bg-gray-100 dark:bg-gray-700 pl-10 pr-12 text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none"
                        autoFocus
                      />
                      <button
                        className="absolute right-3 top-3"
                        onClick={() => {
                          /* Voice search */
                        }}
                      >
                        <Mic className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowMobileSearch(false)} className="px-2">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2">
                    <SimpleThemeToggle />
                    <Button variant="ghost" size="sm" onClick={() => setShowMobileSearch(true)} className="px-2">
                      <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </Button>

                    {/* Mobile Menu */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="px-2 md:hidden">
                          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-80 bg-white dark:bg-gray-800">
                        <div className="flex flex-col gap-6 pt-6">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-6 w-6 text-orange-500" />
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">BookSweeps</span>
                          </div>

                          <nav className="flex flex-col gap-4">
                            <a
                              href="#"
                              className="text-16 font-semibold text-gray-600 dark:text-gray-400 hover:text-orange-500"
                            >
                              Launches
                            </a>
                            <a
                              href="#"
                              className="text-16 font-semibold text-gray-600 dark:text-gray-400 hover:text-orange-500"
                            >
                              Books
                            </a>
                            <a
                              href="#"
                              className="text-16 font-semibold text-gray-600 dark:text-gray-400 hover:text-orange-500"
                            >
                              Authors
                            </a>
                            <Link
                              href="/giveaways"
                              className="text-16 font-semibold text-gray-600 dark:text-gray-400 hover:text-orange-500"
                            >
                              Giveaways
                            </Link>
                          </nav>

                          <div className="flex flex-col gap-3">
                            <Button
                              variant="outline"
                              className="justify-start gap-2 bg-transparent border-gray-200 dark:border-gray-700"
                            >
                              <Mail className="h-4 w-4" />
                              Subscribe to Newsletter
                            </Button>
                            <Button className="bg-orange-500 hover:bg-orange-600">Sign In</Button>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                )}
              </div>

              {/* Desktop Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-4 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search books and authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full min-w-[200px] max-w-[300px] cursor-pointer appearance-none rounded-full border-0 bg-gray-100 dark:bg-gray-700 px-10 pl-[40px] text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none"
                />
                <button className="absolute right-4 top-3">
                  <Mic className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:text-orange-500">
                    Launches
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300">Today&apos;s Launches</DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300">This Week</DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300">Popular</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:text-orange-500">
                    Books
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300">New Releases</DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300">Bestsellers</DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300">By Genre</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:text-orange-500">
                    Authors
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300">Featured Authors</DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300">New Authors</DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300">Author Interviews</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/giveaways"
                className="text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:text-orange-500"
              >
                Giveaways
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <a
                href="#"
                className="flex h-10 items-center gap-1 rounded-full border-2 border-gray-200 dark:border-gray-700 px-4 text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Mail className="h-4 w-4" />
                Subscribe
              </a>
              <button className="h-10 px-4 rounded-full bg-orange-500 text-16 font-semibold text-white hover:bg-orange-600 transition-colors">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 bg-white dark:bg-gray-800 rounded-full shadow-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
            <span className="text-14 font-medium text-gray-700 dark:text-gray-300">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-20 pb-20 md:pb-8">
        <div className="mx-0 md:mx-4 my-4 md:my-8 flex flex-col justify-center gap-8 md:flex-row">
          <main className="md:max-w-[900px] w-full">
            {/* Welcome Banner - Hidden on mobile */}
            <section className="hidden md:flex mb-6 flex-row items-center gap-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 p-4 shadow-sm mx-4 border border-orange-100 dark:border-orange-800">
              <BookOpen className="h-7 w-7 rounded-xl border-2 border-orange-100 dark:border-orange-800 bg-white dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-300" />
              <div className="flex flex-col">
                <div className="text-16 font-semibold text-gray-900 dark:text-gray-100">Welcome to BookSweeps!</div>
                <div className="flex flex-row gap-1 text-16 text-gray-600 dark:text-gray-400">
                  The place to discover and vote on amazing books.
                  <button className="text-left text-16 font-semibold text-orange-500 hover:underline">
                    Take a tour.
                  </button>
                </div>
              </div>
              <button className="ml-auto flex cursor-pointer items-center justify-center rounded-full border-2 border-orange-100 dark:border-orange-800 bg-white dark:bg-gray-800 p-2 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                ×
              </button>
            </section>

            {/* Mobile Filter Tabs */}
            <div className="md:hidden px-4 mb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Button
                  variant={activeTab === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("all")}
                  className={`${activeTab === "all" ? "bg-orange-500 hover:bg-orange-600" : "border-gray-200 dark:border-gray-700 bg-transparent"} whitespace-nowrap`}
                >
                  All
                </Button>
                <Button
                  variant={activeTab === "books" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("books")}
                  className={`${activeTab === "books" ? "bg-orange-500 hover:bg-orange-600" : "border-gray-200 dark:border-gray-700 bg-transparent"} whitespace-nowrap`}
                >
                  Books
                </Button>
                <Button
                  variant={activeTab === "authors" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("authors")}
                  className={`${activeTab === "authors" ? "bg-orange-500 hover:bg-orange-600" : "border-gray-200 dark:border-gray-700 bg-transparent"} whitespace-nowrap`}
                >
                  Authors
                </Button>
                <Button
                  variant={activeTab === "giveaways" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("giveaways")}
                  className={`${activeTab === "giveaways" ? "bg-orange-500 hover:bg-orange-600" : "border-gray-200 dark:border-gray-700 bg-transparent"} whitespace-nowrap`}
                >
                  🎁 Giveaways
                </Button>
              </div>
            </div>

            {/* Desktop Filter and Sort Controls */}
            <div className="hidden md:flex mb-6 flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mx-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("all")}
                  className={
                    activeTab === "all"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "border-gray-200 dark:border-gray-700 bg-transparent"
                  }
                >
                  All
                </Button>
                <Button
                  variant={activeTab === "books" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("books")}
                  className={
                    activeTab === "books"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "border-gray-200 dark:border-gray-700 bg-transparent"
                  }
                >
                  Books
                </Button>
                <Button
                  variant={activeTab === "authors" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("authors")}
                  className={
                    activeTab === "authors"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "border-gray-200 dark:border-gray-700 bg-transparent"
                  }
                >
                  Authors
                </Button>
                <Button
                  variant={activeTab === "giveaways" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("giveaways")}
                  className={
                    activeTab === "giveaways"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "border-gray-200 dark:border-gray-700 bg-transparent"
                  }
                >
                  Giveaways
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent border-gray-200 dark:border-gray-700"
                  >
                    <Filter className="h-4 w-4" />
                    Sort by: {sortBy === "trending" ? "Trending" : sortBy === "newest" ? "Newest" : "Top Rated"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <DropdownMenuItem onClick={() => setSortBy("trending")} className="text-gray-700 dark:text-gray-300">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("newest")} className="text-gray-700 dark:text-gray-300">
                    <Clock className="h-4 w-4 mr-2" />
                    Newest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("top")} className="text-gray-700 dark:text-gray-300">
                    <Star className="h-4 w-4 mr-2" />
                    Top Rated
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content */}
            <div className="mb-12 flex flex-col gap-4 md:gap-10">
              <div className="flex flex-col">
                <h1 className="hidden md:block mb-6 text-24 font-semibold text-gray-900 dark:text-gray-100 mx-4">
                  Top Books & Authors Today
                </h1>

                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
                      <span className="text-gray-600 dark:text-gray-400">Loading books and authors...</span>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                      <Button onClick={fetchData} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}

                {/* Content */}
                {!isLoading && !error && (
                  <>
                    {/* Mobile Card View */}
                    <div className="md:hidden">
                      {filteredData.map((item) => (
                        <FeedItemDisplay
                          key={item.id}
                          item={item}
                          isMobileView={true}
                          onVote={handleVote}
                          onSwipeLeft={handleSwipeLeft}
                          onSwipeRight={handleSwipeRight}
                        />
                      ))}
                    </div>

                    {/* Desktop List View */}
                    <div className="hidden md:block">
                      {filteredData.map((item) => (
                        <FeedItemDisplay
                          key={item.id}
                          item={item}
                          isMobileView={false}
                          onVote={handleVote}
                          onSwipeLeft={handleSwipeLeft}
                          onSwipeRight={handleSwipeRight}
                        />
                      ))}
                    </div>
                  </>
                )}

                <button className="relative my-4 mx-4 grow inline-block max-h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-center text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm">
                  See all of today&apos;s books & authors
                </button>
              </div>
            </div>

            {/* Newsletter Signup - Desktop only */}
            <section className="hidden md:flex mb-6 flex-row items-center gap-4 rounded-xl bg-gray-50 dark:bg-gray-800 p-4 shadow-sm mx-4 border border-gray-200 dark:border-gray-700">
              <Mail className="hidden h-7 w-7 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 md:block text-gray-700 dark:text-gray-300" />
              <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-16 font-semibold text-gray-900 dark:text-gray-100">
                  Get the best of BookSweeps, directly in your inbox.
                </div>
                <a
                  href="/newsletters"
                  className="w-full md:w-auto inline-block max-h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-center text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
                >
                  Sign Up
                </a>
              </div>
            </section>
          </main>

          {/* Sidebar - Desktop only */}
          <aside className="hidden md:block w-full md:w-[280px] md:min-w-[280px]">
            <div className="mb-8 flex flex-col gap-4">
              <a className="text-18 font-semibold text-gray-900 dark:text-gray-100 transition-all duration-300 ease-in hover:text-orange-500">
                Trending Discussions
              </a>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col">
                  <div className="group -mx-4 flex cursor-pointer flex-col gap-2 rounded-lg p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-sm">
                    <a className="flex flex-row items-center gap-2 text-14 font-medium text-gray-600 dark:text-gray-400 group-hover:text-orange-500">
                      <Image
                        src="/placeholder.svg?height=20&width=20"
                        alt="Book Club"
                        width={20}
                        height={20}
                        className="rounded"
                      />
                      r/bookclub
                    </a>
                    <a className="block text-16 font-medium text-gray-900 dark:text-gray-100 leading-snug">
                      What&apos;s your favorite book discovery method?
                    </a>
                    <div className="flex flex-row items-center justify-start gap-3 mt-1">
                      <button className="flex flex-row items-center gap-1 text-14 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:text-orange-500">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          className="stroke-[1.5px] stroke-gray-600 dark:stroke-gray-400"
                        >
                          <path d="M2 5.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C3.52 2 4.08 2 5.2 2h5.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C14 3.52 14 4.08 14 5.2v5.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C12.48 14 11.92 14 10.8 14H5.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C2 12.48 2 11.92 2 10.8z"></path>
                          <path d="M7.2 5.733a1 1 0 0 1 1.6 0l2 2.667A1 1 0 0 1 10 10H6a1 1 0 0 1-.8-1.6z"></path>
                        </svg>
                        135
                      </button>
                      <span className="text-12 text-gray-400">•</span>
                      <a className="flex flex-row items-center gap-1 text-14 text-gray-600 dark:text-gray-400">
                        <MessageCircle className="h-3.5 w-3.5" />
                        80
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <a
                    href="/discussions"
                    className="inline-block max-h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-center text-16 font-semibold text-gray-600 dark:text-gray-400 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
                  >
                    View all
                  </a>
                  <a
                    href="/discussions/new"
                    className="flex flex-row items-center justify-center gap-2 text-16 font-semibold text-gray-600 dark:text-gray-400 inline-block max-h-11 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-center transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Start new thread
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer - Desktop only */}
        <footer className="hidden md:block bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-12 transition-colors">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="h-6 w-6 text-orange-500" />
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">BookSweeps</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Connecting readers with amazing books through author giveaways.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">For Readers</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <Link href="/giveaways" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      Browse Giveaways
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      My Dashboard
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">For Authors</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      Create Campaign
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      Author Tools
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      Success Stories
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Support</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>© 2025 BookSweeps. All rights reserved. Built with ❤️ for book lovers.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden transition-colors">
        <div className="flex items-center justify-around py-2">
          <button className="flex flex-col items-center gap-1 p-2 text-orange-500">
            <Home className="h-5 w-5" />
            <span className="text-10 font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400">
            <Compass className="h-5 w-5" />
            <span className="text-10 font-medium">Discover</span>
          </button>
          <Link href="/giveaways" className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400">
            <Trophy className="h-5 w-5" />
            <span className="text-10 font-medium">Giveaways</span>
          </Link>
          <button className="flex flex-col items-center gap-1 p-2 text-gray-600 dark:text-gray-400">
            <User className="h-5 w-5" />
            <span className="text-10 font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
