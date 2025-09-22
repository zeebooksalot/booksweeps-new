"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Giveaway, ApiCampaign, GiveawayFilters } from "@/types/giveaways"
import { GIVEAWAY_CONFIG, MOCK_GIVEAWAYS } from "@/constants/giveaways"

interface UseGiveawaysProps {
  onFiltersChange?: (filters: GiveawayFilters) => void
}

export function useGiveaways({ onFiltersChange }: UseGiveawaysProps = {}) {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [filters, setFilters] = useState<GiveawayFilters>(GIVEAWAY_CONFIG.defaultFilters)
  const [sortBy, setSortBy] = useState(GIVEAWAY_CONFIG.defaultSortBy)
  
  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < GIVEAWAY_CONFIG.mobileBreakpoint)
    }
    
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

  // Fetch giveaways
  const fetchGiveaways = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/campaigns?status=active&featured=${filters.featured}&limit=20`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch campaigns')
      }
      
      if (data.campaigns.length === 0) {
        // Fallback to mock data
        setGiveaways(MOCK_GIVEAWAYS as unknown as Giveaway[])
      } else {
        // Map API data to Giveaway interface
        const mappedGiveaways = data.campaigns.map((campaign: ApiCampaign) => ({
          id: campaign.id,
          title: campaign.title,
          description: campaign.description || "",
          book: {
            id: campaign.book_id,
            title: campaign.book?.title || "Unknown Book",
            author: campaign.author_name || "Unknown Author",
            cover_image_url: campaign.book_cover_url || "/placeholder.svg?height=80&width=64",
            genre: campaign.campaign_genre || "General",
            description: campaign.book_description || ""
          },
          author: {
            id: campaign.pen_names?.id || "unknown",
            name: campaign.author_name || "Unknown Author",
            avatar_url: campaign.pen_names?.avatar_url || "/placeholder.svg?height=64&width=64",
            bio: campaign.pen_names?.bio || ""
          },
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          max_entries: campaign.max_entries || 1000,
          entry_count: campaign.entry_count || 0,
          number_of_winners: campaign.number_of_winners || 1,
          prize_description: campaign.prize_description || "",
          rules: campaign.rules || "",
          status: (campaign.status === 'active' || campaign.status === 'ended' || campaign.status === 'draft') 
            ? campaign.status as 'active' | 'ended' | 'draft' 
            : 'active',
          is_featured: campaign.is_featured || false,
          created_at: campaign.created_at,
          updated_at: campaign.updated_at
        }))
        setGiveaways(mappedGiveaways)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch giveaways')
      console.error('Error fetching giveaways:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters.featured])

  // Utility functions
  const getTimeRemaining = useCallback((endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return "Ended"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h left`
    return "Ending soon"
  }, [])

  const getEntryPercentage = useCallback((entryCount: number, maxEntries: number) => {
    return Math.min((entryCount / maxEntries) * 100, 100)
  }, [])

  // Filter and sort giveaways
  const filteredGiveaways = useMemo(() => {
    return giveaways.filter((giveaway) => {
      // Search query filtering
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase()
        const searchText = `${giveaway.title} ${giveaway.book.title} ${giveaway.book.author} ${giveaway.author.name} ${giveaway.description}`.toLowerCase()
        if (!searchText.includes(query)) return false
      }

      // Genre filtering
      if (filters.genre && filters.genre !== '') {
        if (giveaway.book.genre.toLowerCase() !== filters.genre.toLowerCase()) return false
      }

      // Featured filtering
      if (filters.featured && !giveaway.is_featured) return false

      // Status filtering
      if (filters.status === 'active' && giveaway.status !== 'active') return false
      if (filters.status === 'ending_soon') {
        const endDate = new Date(giveaway.end_date)
        const now = new Date()
        const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntilEnd > 7) return false
      }

      // Prize type filtering
      if (filters.prizeType !== 'all') {
        const prizeText = giveaway.prize_description.toLowerCase()
        if (filters.prizeType === 'signed' && !prizeText.includes('signed')) return false
        if (filters.prizeType === 'digital' && !prizeText.includes('digital')) return false
        if (filters.prizeType === 'physical' && !prizeText.includes('physical') && !prizeText.includes('copy')) return false
      }

      return true
    }).sort((a, b) => {
      // Sorting logic
      switch (sortBy) {
        case 'featured':
          return b.is_featured ? 1 : -1
        case 'ending_soon':
          const aEnd = new Date(a.end_date)
          const bEnd = new Date(b.end_date)
          return aEnd.getTime() - bEnd.getTime()
        case 'most_entries':
          return b.entry_count - a.entry_count
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })
  }, [giveaways, filters, sortBy])

  // Update filters
  const updateFilters = useCallback((updates: Partial<GiveawayFilters>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }, [filters, onFiltersChange])

  // Reset filters
  const resetFilters = useCallback(() => {
    const resetFilters = {
      ...GIVEAWAY_CONFIG.defaultFilters,
      searchQuery: filters.searchQuery // Keep search query
    }
    setFilters(resetFilters)
    
    if (onFiltersChange) {
      onFiltersChange(resetFilters)
    }
  }, [filters, onFiltersChange])

  // Event handlers
  const handleEnterGiveaway = useCallback((id: string) => {
    // Navigate to giveaway entry page
    window.location.href = `/giveaways/${id}`
  }, [])

  // Effects
  useEffect(() => {
    fetchGiveaways()
  }, [filters.featured])

  return {
    // State
    giveaways,
    filteredGiveaways,
    isLoading,
    error,
    isMobileView,
    filters,
    sortBy,
    
    // Actions
    updateFilters,
    resetFilters,
    setSortBy,
    handleEnterGiveaway,
    
    // Utilities
    getTimeRemaining,
    getEntryPercentage,
    
    // Computed
    hasActiveFilters: filters.genre !== '' || filters.featured || filters.status !== 'all' || filters.prizeType !== 'all'
  }
}
