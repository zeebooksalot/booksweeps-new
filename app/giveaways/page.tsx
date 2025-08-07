"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Gift,
  TrendingUp,
  Star,
  Calendar,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/hooks/use-api"

interface Giveaway {
  id: string
  title: string
  description: string
  book: {
    id: string
    title: string
    author: string
    cover_image_url: string
    genre: string
    description: string
  }
  author: {
    id: string
    name: string
    avatar_url: string
    bio: string
  }
  start_date: string
  end_date: string
  max_entries: number
  entry_count: number
  number_of_winners: number
  prize_description: string
  rules: string
  status: 'active' | 'ended' | 'draft'
  is_featured: boolean
  created_at: string
  updated_at: string
}

export default function GiveawaysPage() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    genre: '',
    featured: false,
    endingSoon: false
  })
  const [sortBy, setSortBy] = useState('featured')
  
  const campaignsApi = useApi<{ campaigns: any[]; pagination: any }>()

  const fetchGiveaways = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await campaignsApi.fetchData(`/api/campaigns?status=active&featured=${filters.featured}&limit=20`)
      
      if (response.campaigns.length === 0) {
        // Fallback mock data
        const mockGiveaways: Giveaway[] = [
          {
            id: "1",
            title: "Win 'Ocean's Echo' - Fantasy Romance",
            description: "Enter to win a signed copy of this magical tale of love and adventure beneath the waves.",
            book: {
              id: "1",
              title: "Ocean's Echo",
              author: "Elena Rodriguez",
              cover_image_url: "/placeholder.svg?height=80&width=64",
              genre: "Fantasy",
              description: "A magical tale of love and adventure beneath the waves."
            },
            author: {
              id: "1",
              name: "Elena Rodriguez",
              avatar_url: "/placeholder.svg?height=64&width=64",
              bio: "Fantasy romance author who transports readers to magical worlds."
            },
            start_date: "2024-01-01",
            end_date: "2024-12-31",
            max_entries: 1000,
            entry_count: 156,
            number_of_winners: 5,
            prize_description: "Signed copy of Ocean's Echo",
            rules: "Open to US residents 18+. One entry per person.",
            status: 'active',
            is_featured: true,
            created_at: "2024-01-01",
            updated_at: "2024-01-01"
          },
          {
            id: "2",
            title: "The Last Garden - Post-Apocalyptic Giveaway",
            description: "Win a copy of this hope-filled post-apocalyptic tale.",
            book: {
              id: "2",
              title: "The Last Garden",
              author: "Maria Santos",
              cover_image_url: "/placeholder.svg?height=80&width=64",
              genre: "Post-Apocalyptic",
              description: "Hope blooms in the most unexpected places."
            },
            author: {
              id: "2",
              name: "Maria Santos",
              avatar_url: "/placeholder.svg?height=64&width=64",
              bio: "Post-apocalyptic fiction writer who explores themes of hope."
            },
            start_date: "2024-01-01",
            end_date: "2024-12-31",
            max_entries: 500,
            entry_count: 89,
            number_of_winners: 3,
            prize_description: "Digital copy of The Last Garden",
            rules: "Open worldwide 18+. One entry per person.",
            status: 'active',
            is_featured: false,
            created_at: "2024-01-01",
            updated_at: "2024-01-01"
          }
        ]
        setGiveaways(mockGiveaways)
      } else {
        // Map API data to Giveaway interface
        const mappedGiveaways = response.campaigns.map((campaign: any) => ({
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
            id: campaign.pen_name_id,
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
          status: campaign.status,
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
  }

  useEffect(() => {
    fetchGiveaways()
  }, [filters, sortBy])

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return "Ended"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h left`
    return "Ending soon"
  }

  const getEntryPercentage = (entryCount: number, maxEntries: number) => {
    return Math.min((entryCount / maxEntries) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                🎁 Giveaways
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Discover and enter amazing book giveaways from your favorite authors
              </p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search giveaways..."
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading giveaways...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={fetchGiveaways} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giveaways.map((giveaway) => (
              <div
                key={giveaway.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Featured Badge */}
                {giveaway.is_featured && (
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 text-sm font-semibold text-center">
                    ⭐ Featured
                  </div>
                )}

                <div className="p-6">
                  {/* Book Cover and Info */}
                  <div className="flex gap-4 mb-4">
                    <Image
                      src={giveaway.book.cover_image_url}
                      alt={giveaway.book.title}
                      width={80}
                      height={100}
                      className="rounded-lg shadow-sm"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {giveaway.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        by {giveaway.author.name}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {giveaway.book.genre}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {giveaway.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{giveaway.entry_count} entries</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Gift className="h-4 w-4" />
                      <span>{giveaway.number_of_winners} winners</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeRemaining(giveaway.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Ends {new Date(giveaway.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Entries</span>
                      <span>{giveaway.entry_count}/{giveaway.max_entries}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${getEntryPercentage(giveaway.entry_count, giveaway.max_entries)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={`/giveaways/${giveaway.id}`}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">
                      Enter Giveaway
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
