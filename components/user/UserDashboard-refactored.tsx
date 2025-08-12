'use client'

import { useAuth } from '@/components/auth/AuthProvider-refactored'
import { LoadingSpinner } from '@/components/ui/loading'
import { ErrorState } from '@/components/ui/error-state'
import { useUserDashboard } from '@/hooks/useUserDashboard'
import { DashboardStats } from './DashboardStats'
import { RecentActivity } from './RecentActivity'

export function UserDashboard() {
  const { user, loading } = useAuth()
  const { stats, isLoadingStats, error, getActivityIcon, getActivityColor } = useUserDashboard()

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
        title="Failed to Load Dashboard"
        message={error}
        variant="compact"
      />
    )
  }

  if (!stats) {
    return (
      <ErrorState
        title="No Data Available"
        message="Unable to load dashboard data."
        variant="compact"
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Dashboard Stats */}
      <DashboardStats stats={stats} />

      {/* Recent Activity */}
      <RecentActivity
        activities={stats.recentActivity}
        getActivityIcon={getActivityIcon}
        getActivityColor={getActivityColor}
      />
    </div>
  )
}
