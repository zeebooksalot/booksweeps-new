"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Edit } from "lucide-react"
import { User } from "@supabase/supabase-js"

interface DashboardHeaderProps {
  user: User
  userProfile: {
    avatar_url?: string | null
    display_name?: string | null
    favorite_genres: string[]
    user_type?: string
  }
  stats: {
    totalDownloads: number
    totalFavorites: number
    readingProgress: number
    booksCompleted: number
  }
}

export function DashboardHeader({ user, userProfile, stats }: DashboardHeaderProps) {
  // Handle fallback profile gracefully
  const displayName = userProfile.display_name || user.email?.split('@')[0] || 'User'
  const userType = userProfile.user_type || 'reader'
  const hasFavoriteGenres = userProfile.favorite_genres && userProfile.favorite_genres.length > 0

  return (
    <div className="mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-6">
          <Image
            src={userProfile.avatar_url || "/placeholder.svg?height=64&width=64"}
            alt={displayName}
            width={80}
            height={80}
            className="rounded-full"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Welcome back, {displayName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {hasFavoriteGenres 
                ? `You love ${userProfile.favorite_genres.join(", ")} books`
                : "Start exploring books to get personalized recommendations"
              }
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.totalDownloads}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalFavorites}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Favorites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.readingProgress}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Reading</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.booksCompleted}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              {!hasFavoriteGenres && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Complete your profile
                </Badge>
              )}
              {userType && (
                <Badge variant="outline" className="capitalize">
                  {userType}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
