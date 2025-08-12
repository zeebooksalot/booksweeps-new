'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStats as DashboardStatsType } from '@/types/auth'
import { BookOpen, Heart, Trophy, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
  stats: DashboardStatsType
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
      description: 'Books in your library',
    },
    {
      title: 'Favorite Authors',
      value: stats.totalAuthors,
      icon: Heart,
      description: 'Authors you follow',
    },
    {
      title: 'Total Votes',
      value: stats.totalVotes,
      icon: Trophy,
      description: 'Votes cast',
    },
    {
      title: 'Giveaways',
      value: stats.totalGiveaways,
      icon: TrendingUp,
      description: 'Giveaways entered',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
