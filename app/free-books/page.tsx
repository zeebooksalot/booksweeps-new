'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Filter } from 'lucide-react'
import { Header } from '@/components/Header'
import { FeedItemDisplay } from '@/components/feed-item-display'

interface ReaderMagnet {
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

export default function FreeBooksPage() {
  const [readerMagnets, setReaderMagnets] = useState<ReaderMagnet[]>([])
  const [filteredMagnets, setFilteredMagnets] = useState<ReaderMagnet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobileView, setIsMobileView] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedFormat, setSelectedFormat] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const filterMagnets = useCallback(() => {
    let filtered = readerMagnets.filter(magnet => magnet.is_active)

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(magnet =>
        magnet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        magnet.books.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        magnet.books.genre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(magnet => 
        magnet.books.genre.toLowerCase() === selectedGenre.toLowerCase()
      )
    }

    // Filter by format
    if (selectedFormat !== 'all') {
      filtered = filtered.filter(magnet => magnet.format === selectedFormat)
    }

    setFilteredMagnets(filtered)
  }, [readerMagnets, searchTerm, selectedGenre, selectedFormat])

  useEffect(() => {
    fetchReaderMagnets()
  }, [])

  useEffect(() => {
    filterMagnets()
  }, [filterMagnets])

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

  const fetchReaderMagnets = async () => {
    try {
      console.log('Fetching reader magnets...')
      const response = await fetch('/api/reader-magnets')
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API response:', data)
        console.log('Reader magnets count:', data.reader_magnets?.length || 0)
        setReaderMagnets(data.reader_magnets || [])
      } else {
        console.error('Failed to fetch reader magnets:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('Error fetching reader magnets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUniqueGenres = () => {
    const genres = readerMagnets.map(magnet => magnet.books.genre)
    return ['all', ...Array.from(new Set(genres))]
  }

  // Convert reader magnets to feed items for voting functionality
  const convertToFeedItems = (magnets: ReaderMagnet[]) => {
    return magnets.map((magnet, index) => ({
      id: magnet.id,
      type: "book" as const,
      title: magnet.title,
      author: magnet.books.author,
      description: magnet.description,
      cover: magnet.books.cover_image_url || '/placeholder.jpg',
      votes: Math.floor(Math.random() * 100) + 10, // Mock votes for demo
      comments: Math.floor(Math.random() * 20) + 1, // Mock comments for demo
      rating: Math.floor(Math.random() * 2) + 4, // Mock rating 4-5 stars
      genres: [magnet.books.genre],
      hasGiveaway: false,
      publishDate: new Date(magnet.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      rank: index + 1,
      // Additional properties for free books
      slug: magnet.slug,
      format: magnet.format,
      download_count: magnet.download_count
    }))
  }

  const handleVote = (id: string) => {
    // Handle voting logic here
    console.log('Voted for:', id)
  }

  const handleSwipeLeft = (id: string) => {
    // Handle swipe left logic here
    console.log('Swiped left on:', id)
  }

  const handleSwipeRight = (id: string) => {
    // Handle swipe right logic here
    console.log('Swiped right on:', id)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading free books...</p>
          </div>
        </div>
      </div>
    )
  }

  const feedItems = convertToFeedItems(filteredMagnets)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:bg-white md:dark:bg-gray-900 transition-colors">
      {/* Header */}
      <Header 
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        isMobileView={isMobileView}
      />

      {/* Main Content */}
      <div className="pt-20 pb-20 md:pb-8">
        <div className="mx-0 md:mx-4 my-4 md:my-8 flex flex-col justify-center gap-8 md:flex-row">
          <main className="md:max-w-[900px] w-full">
            {/* Mobile Filter Tabs */}
            <div className="md:hidden px-4 mb-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`gap-1 border-gray-200 dark:border-gray-700 bg-transparent ${
                    showAdvancedFilters ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' : ''
                  }`}
                >
                  <Filter className="h-3 w-3" />
                  Filters
                  {((selectedGenre !== 'all') || (selectedFormat !== 'all')) && (
                    <Badge variant="secondary" className="ml-1 h-4 w-4 rounded-full p-0 text-xs">
                      {[selectedGenre !== 'all', selectedFormat !== 'all'].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Advanced Filters Panel - Mobile */}
            {showAdvancedFilters && (
              <div className="mx-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedGenre('all')
                      setSelectedFormat('all')
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear All
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Genre Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Genre</label>
                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Genres" />
                      </SelectTrigger>
                      <SelectContent>
                        {getUniqueGenres().map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre === 'all' ? 'All Genres' : genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Formats" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Formats</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="epub">EPUB</SelectItem>
                        <SelectItem value="mobi">MOBI</SelectItem>
                        <SelectItem value="chapter">Chapter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {feedItems.length === 0 ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No books found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden">
                  {feedItems.map((item) => (
                    <FeedItemDisplay
                      key={item.id}
                      item={item}
                      isMobileView={true}
                      onVote={handleVote}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      downloadSlug={item.slug}
                    />
                  ))}
                </div>

                {/* Desktop List View */}
                <div className="hidden md:block">
                  {feedItems.map((item) => (
                    <FeedItemDisplay
                      key={item.id}
                      item={item}
                      isMobileView={false}
                      onVote={handleVote}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      downloadSlug={item.slug}
                    />
                  ))}
                </div>
              </>
            )}
          </main>

          {/* Sidebar - Desktop only */}
          <aside className="hidden md:block w-full md:w-[280px] md:min-w-[280px]">
            <div className="mb-8 flex flex-col gap-4">
              <h2 className="text-18 font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="space-y-4">
                  {/* Genre Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Genre</label>
                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Genres" />
                      </SelectTrigger>
                      <SelectContent>
                        {getUniqueGenres().map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre === 'all' ? 'All Genres' : genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Formats" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Formats</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="epub">EPUB</SelectItem>
                        <SelectItem value="mobi">MOBI</SelectItem>
                        <SelectItem value="chapter">Chapter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Results Count */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {feedItems.length} book{feedItems.length !== 1 ? 's' : ''} found
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
