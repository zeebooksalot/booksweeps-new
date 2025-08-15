"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ReaderMagnet, ReaderMagnetFilters, ReaderMagnetFeedItem } from "@/types/reader-magnets"
import { READER_MAGNET_CONFIG } from "@/constants/reader-magnets"

interface UseReaderMagnetsProps {
  onFiltersChange?: (filters: ReaderMagnetFilters) => void
}

export function useReaderMagnets({ onFiltersChange }: UseReaderMagnetsProps = {}) {
  const [readerMagnets, setReaderMagnets] = useState<ReaderMagnet[]>([])
  const [filteredMagnets, setFilteredMagnets] = useState<ReaderMagnet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const [filters, setFilters] = useState<ReaderMagnetFilters>(READER_MAGNET_CONFIG.defaultFilters)

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < READER_MAGNET_CONFIG.mobileBreakpoint)
    }
    
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

  // Fetch reader magnets
  const fetchReaderMagnets = useCallback(async () => {
    try {
      const response = await fetch('/api/reader-magnets')
      
      if (response.ok) {
        const data = await response.json()
        setReaderMagnets(data.reader_magnets || [])
      } else {
        console.error('Failed to fetch reader magnets:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching reader magnets:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Filter magnets based on current filters
  const filterMagnets = useCallback(() => {
    let filtered = readerMagnets.filter(magnet => magnet.is_active)

    // Filter by search term
    if (filters.searchTerm) {
      filtered = filtered.filter(magnet =>
        magnet.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        magnet.books.author.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        magnet.books.genre.toLowerCase().includes(filters.searchTerm.toLowerCase())
      )
    }

    // Filter by genre
    if (filters.selectedGenre !== 'all') {
      filtered = filtered.filter(magnet => 
        magnet.books.genre.toLowerCase() === filters.selectedGenre.toLowerCase()
      )
    }

    // Filter by format
    if (filters.selectedFormat !== 'all') {
      filtered = filtered.filter(magnet => magnet.format === filters.selectedFormat)
    }

    setFilteredMagnets(filtered)
  }, [readerMagnets, filters])

  // Get unique genres from reader magnets
  const uniqueGenres = useMemo(() => {
    const genres = readerMagnets.map(magnet => magnet.books.genre)
    return ['all', ...Array.from(new Set(genres))]
  }, [readerMagnets])

  // Convert reader magnets to feed items for voting functionality
  const convertToFeedItems = useCallback((magnets: ReaderMagnet[]): ReaderMagnetFeedItem[] => {
    return magnets.map((magnet, index) => ({
      id: magnet.id,
      type: "book" as const,
      title: magnet.title,
      author: magnet.books.author,
      description: magnet.description,
      cover: magnet.books.cover_image_url || '/placeholder.jpg',
      votes: magnet.votes || 0, // Use real vote count from API
      comments: magnet.comments || 0, // Use real comment count from API
      rating: magnet.rating || 4.5, // Use real rating from API
      genres: [magnet.books.genre],
      hasGiveaway: false,
      publishDate: new Date(magnet.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      rank: index + 1,
      // Additional properties for free books
      slug: magnet.slug,
      format: magnet.format,
      download_count: magnet.download_count
    }))
  }, [])

  // Update filters
  const updateFilters = useCallback((updates: Partial<ReaderMagnetFilters>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }, [filters, onFiltersChange])

  // Reset filters
  const resetFilters = useCallback(() => {
    const resetFilters = {
      ...READER_MAGNET_CONFIG.defaultFilters,
      searchTerm: filters.searchTerm // Keep search term
    }
    setFilters(resetFilters)
    
    if (onFiltersChange) {
      onFiltersChange(resetFilters)
    }
  }, [filters, onFiltersChange])

  // Event handlers
  const handleVote = useCallback((id: string) => {
    // Handle voting logic here
    // TODO: Implement voting functionality
    console.log('Vote for:', id)
  }, [])

  const handleSwipeLeft = useCallback((id: string) => {
    // Handle swipe left logic here
    // TODO: Implement swipe left functionality
    console.log('Swipe left for:', id)
  }, [])

  const handleSwipeRight = useCallback((id: string) => {
    // Handle swipe right logic here
    // TODO: Implement swipe right functionality
    console.log('Swipe right for:', id)
  }, [])

  // Effects
  useEffect(() => {
    fetchReaderMagnets()
  }, [fetchReaderMagnets])

  useEffect(() => {
    filterMagnets()
  }, [filterMagnets])

  // Convert filtered magnets to feed items
  const feedItems = useMemo(() => convertToFeedItems(filteredMagnets), [filteredMagnets, convertToFeedItems])

  return {
    // State
    readerMagnets,
    filteredMagnets,
    feedItems,
    isLoading,
    isMobileView,
    filters,
    uniqueGenres,
    
    // Actions
    updateFilters,
    resetFilters,
    handleVote,
    handleSwipeLeft,
    handleSwipeRight,
    
    // Computed
    hasActiveFilters: filters.selectedGenre !== 'all' || filters.selectedFormat !== 'all'
  }
}
