'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider-refactored'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { 
  BookOpen, 
  Heart, 
  Trophy, 
  User, 
  Calendar, 
  TrendingUp,
  Star,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalBooks: number
  totalAuthors: number
  totalVotes: number
  totalGiveaways: number
  recentActivity: Array<{
    id: string
    type: 'vote' | 'giveaway' | 'book' | 'author'
    title: string
    timestamp: string
  }>
}

export function UserDashboard() {
  const { user, userProfile, loading } = useAuth()
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

  if (loading || isLoadingStats) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <ErrorState
        title="Authentication Required"
        message="Please sign in to view your dashboard."
        variant="compact"
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Dashboard Error"
        message={error}
        onRetry={() => window.location.reload()}
        variant="compact"
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userProfile?.display_name || user.email}!</h1>
          <p className="text-gray-600">Here&apos;s what&apos;s happening with your account.</p>
        </div>
        <Avatar className="h-12 w-12">
          <AvatarFallback>
            {userProfile?.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBooks || 0}</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Authors</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAuthors || 0}</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVotes || 0}</div>
            <p className="text-xs text-muted-foreground">+89 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giveaways</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalGiveaways || 0}</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest interactions and updates.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border">
                <div className="flex-shrink-0">
                  {activity.type === 'vote' && <Heart className="h-5 w-5 text-red-500" />}
                  {activity.type === 'giveaway' && <Trophy className="h-5 w-5 text-yellow-500" />}
                  {activity.type === 'book' && <BookOpen className="h-5 w-5 text-blue-500" />}
                  {activity.type === 'author' && <User className="h-5 w-5 text-green-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Reading List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your saved books and reading preferences.
            </p>
            <Button asChild className="w-full">
              <Link href="/reading-list">View Reading List</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your favorite books and authors in one place.
            </p>
            <Button asChild className="w-full">
              <Link href="/favorites">View Favorites</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Giveaways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track your giveaway entries and wins.
            </p>
            <Button asChild className="w-full">
              <Link href="/giveaways">View Giveaways</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
