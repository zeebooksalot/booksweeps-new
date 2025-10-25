"use client"

import { useState, useEffect, useCallback } from "react"
import { Giveaway, ApiCampaign } from "@/types"
import { GIVEAWAY_CONFIG } from "@/constants/giveaways"
import { useApi } from "@/hooks/use-api"

interface UseGiveawayProps {
  params: Promise<{ id: string }>
}

export function useGiveaway({ params }: UseGiveawayProps) {
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [id, setId] = useState<string>("")

  const campaignsApi = useApi<{ campaigns: ApiCampaign[]; pagination: unknown }>()

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < GIVEAWAY_CONFIG.mobileBreakpoint)
    }
    
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

  // Extract params
  useEffect(() => {
    const extractParams = async () => {
      const { id: paramId } = await params
      setId(paramId)
    }
    extractParams()
  }, [params])

  // Fetch giveaway data
  const fetchGiveaway = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // For now, use mock data - in production this would be an API call
      const mockGiveaway: Giveaway = {
        id: id || "1",
        title: "Enter to Win Ocean's Echo by Elena Rodriguez",
        description: "Win a signed copy of Ocean's Echo plus exclusive bookmarks and a personal letter from author Elena Rodriguez",
        book: {
          id: "1",
          title: "Ocean's Echo",
          author: "Elena Rodriguez",
          cover_image_url: "gradient:fantasy",
          genre: "Fantasy",
          description: "A magical tale of love and adventure beneath the waves that explores the depths of human connection and the mysteries of the ocean."
        },
        author: {
          id: "1",
          name: "Elena Rodriguez",
          avatar_url: "gradient:author",
          bio: "Fantasy romance author who transports readers to magical worlds filled with adventure and love."
        },
        start_date: "2024-01-01",
        end_date: "2025-12-31",
        entry_count: 156,
        max_entries: 1000,
        number_of_winners: 5,
        prize_description: "Signed copy of Ocean's Echo",
        rules: "Open to US residents 18+. One entry per person. Winners will be selected randomly and notified via email.",
        status: 'active',
        is_featured: true,
        created_at: "2024-01-01",
        updated_at: "2024-01-01"
      }
      
      setGiveaway(mockGiveaway)
    } catch (err) {
      setError('Failed to load giveaway')
      console.error('Error fetching giveaway:', err)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  // Handle form submission
  const handleSubmit = useCallback(async (email: string) => {
    if (!id) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/giveaways/${id}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit entry')
      }
      
      const result = await response.json()
      console.log('Entry submitted successfully:', result)
      setIsSubmitted(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit entry'
      setError(errorMessage)
      console.error('Error submitting entry:', err)
    } finally {
      setIsSubmitting(false)
    }
  }, [id])

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

  const isEnded = useCallback((endDate: string) => {
    return new Date(endDate) < new Date()
  }, [])

  // Effects
  useEffect(() => {
    fetchGiveaway()
  }, [fetchGiveaway])

  return {
    // State
    giveaway,
    isLoading,
    error,
    email,
    isSubmitting,
    isSubmitted,
    isMobileView,
    id,
    
    // Actions
    setEmail,
    handleSubmit,
    
    // Utilities
    getTimeRemaining,
    getEntryPercentage,
    isEnded,
    
    // Computed
    canEnter: giveaway && !isEnded(giveaway.end_date) && !isSubmitted,
    isExpired: giveaway ? isEnded(giveaway.end_date) : false
  }
}
