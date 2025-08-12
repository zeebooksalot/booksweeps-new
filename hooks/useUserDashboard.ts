'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider-refactored'
import { DashboardStats } from '@/types/auth'

export function useUserDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user) return

      try {
        setIsLoadingStats(true)
        setError(null)

        // Mock dashboard stats - replace with actual API calls
        const mockStats: DashboardStats = {
          totalBooks: 156,
          totalAuthors: 89,
          totalVotes: 1247,
          totalGiveaways: 23,
          recentActivity: [
            {
              id: '1',
              type: 'vote',
              title: 'Voted for "Ocean\'s Echo" by Elena Rodriguez',
              timestamp: '2 hours ago'
            },
            {
              id: '2',
              type: 'giveaway',
              title: 'Entered giveaway for "The Last Garden"',
              timestamp: '1 day ago'
            },
            {
              id: '3',
              type: 'book',
              title: 'Added "Midnight Dreams" to reading list',
              timestamp: '3 days ago'
            },
            {
              id: '4',
              type: 'author',
              title: 'Started following Sarah Johnson',
              timestamp: '1 week ago'
            }
          ]
        }

        setStats(mockStats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchDashboardStats()
  }, [user])

  const getActivityIcon = (type: DashboardStats['recentActivity'][0]['type']) => {
    switch (type) {
      case 'vote':
        return '👍'
      case 'giveaway':
        return '🎁'
      case 'book':
        return '📚'
      case 'author':
        return '👤'
      default:
        return '📝'
    }
  }

  const getActivityColor = (type: DashboardStats['recentActivity'][0]['type']) => {
    switch (type) {
      case 'vote':
        return 'text-blue-600'
      case 'giveaway':
        return 'text-purple-600'
      case 'book':
        return 'text-green-600'
      case 'author':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  return {
    stats,
    isLoadingStats,
    error,
    getActivityIcon,
    getActivityColor,
  }
}
