"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  User,
  BookOpen,
  Download,
  Heart,
  Settings,
  Bell,
  Mail,
  Calendar,
  Star,
  ArrowRight,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Clock,
  Eye,
  Bookmark,
  Share2,
  MessageCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url: string
  bio?: string
  join_date: string
  preferences: {
    genres: string[]
    email_notifications: boolean
    newsletter: boolean
  }
}

interface DownloadHistory {
  id: string
  title: string
  author: string
  cover_url: string
  downloaded_at: string
  format: string
  file_size?: string
}

interface FavoriteAuthor {
  id: string
  name: string
  avatar_url: string
  bio: string
  books_count: number
  followers_count: number
}

interface ReadingList {
  id: string
  title: string
  author: string
  cover_url: string
  added_at: string
  status: 'to_read' | 'reading' | 'completed'
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [downloads, setDownloads] = useState<DownloadHistory[]>([])
  const [favorites, setFavorites] = useState<FavoriteAuthor[]>([])
  const [readingList, setReadingList] = useState<ReadingList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Mock data for development
        const mockUser: UserProfile = {
          id: "1",
          name: "Sarah Johnson",
          email: "sarah@example.com",
          avatar_url: "/placeholder.svg?height=64&width=64",
          bio: "Avid reader of fantasy and romance novels. Always looking for the next great story!",
          join_date: "2024-01-15",
          preferences: {
            genres: ["Fantasy", "Romance", "Mystery", "Sci-Fi"],
            email_notifications: true,
            newsletter: true
          }
        }

        const mockDownloads: DownloadHistory[] = [
          {
            id: "1",
            title: "The Lost Chapter",
            author: "Elena Rodriguez",
            cover_url: "/placeholder.svg?height=100&width=70",
            downloaded_at: "2024-01-20",
            format: "PDF",
            file_size: "2.3 MB"
          },
          {
            id: "2",
            title: "Prequel: The Beginning",
            author: "Michael Chen",
            cover_url: "/placeholder.svg?height=100&width=70",
            downloaded_at: "2024-01-18",
            format: "EPUB",
            file_size: "1.8 MB"
          },
          {
            id: "3",
            title: "Bonus Content: Character Profiles",
            author: "Jessica Lee",
            cover_url: "/placeholder.svg?height=100&width=70",
            downloaded_at: "2024-01-15",
            format: "PDF",
            file_size: "3.1 MB"
          }
        ]

        const mockFavorites: FavoriteAuthor[] = [
          {
            id: "1",
            name: "Elena Rodriguez",
            avatar_url: "/placeholder.svg?height=64&width=64",
            bio: "Bestselling fantasy romance author",
            books_count: 12,
            followers_count: 45000
          },
          {
            id: "2",
            name: "Michael Chen",
            avatar_url: "/placeholder.svg?height=64&width=64",
            bio: "Sci-fi and mystery writer",
            books_count: 8,
            followers_count: 32000
          },
          {
            id: "3",
            name: "Jessica Lee",
            avatar_url: "/placeholder.svg?height=64&width=64",
            bio: "Contemporary romance specialist",
            books_count: 15,
            followers_count: 28000
          }
        ]

        const mockReadingList: ReadingList[] = [
          {
            id: "1",
            title: "Ocean's Echo",
            author: "Elena Rodriguez",
            cover_url: "/placeholder.svg?height=100&width=70",
            added_at: "2024-01-20",
            status: 'reading'
          },
          {
            id: "2",
            title: "The Quantum Garden",
            author: "Michael Chen",
            cover_url: "/placeholder.svg?height=100&width=70",
            added_at: "2024-01-18",
            status: 'to_read'
          },
          {
            id: "3",
            title: "Love in the City",
            author: "Jessica Lee",
            cover_url: "/placeholder.svg?height=100&width=70",
            added_at: "2024-01-15",
            status: 'completed'
          }
        ]

        setUser(mockUser)
        setDownloads(mockDownloads)
        setFavorites(mockFavorites)
        setReadingList(mockReadingList)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reading':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'to_read':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading your dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Dashboard Not Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to access your dashboard.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              <BookOpen className="h-6 w-6" />
              <span className="font-semibold">BookSweeps</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* User Profile Section */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-6">
              <Image
                src={user.avatar_url}
                alt={user.name}
                width={80}
                height={80}
                className="rounded-full"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {user.bio}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Member since {new Date(user.join_date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{downloads.length} downloads</span>
                  <span>•</span>
                  <span>{favorites.length} favorite authors</span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="reading-list">Reading List</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{downloads.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +{Math.floor(Math.random() * 5) + 1} from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Favorite Authors</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{favorites.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Authors you follow
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reading List</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{readingList.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Books in your list
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest downloads and reading activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {downloads.slice(0, 3).map((download) => (
                    <div key={download.id} className="flex items-center gap-4">
                      <Image
                        src={download.cover_url}
                        alt={download.title}
                        width={50}
                        height={70}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {download.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          by {download.author}
                        </p>
                        <p className="text-xs text-gray-500">
                          Downloaded {new Date(download.downloaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {download.format}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Downloads Tab */}
          <TabsContent value="downloads" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Download History
              </h2>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search downloads..."
                  className="w-64"
                />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {downloads.map((download) => (
                <Card key={download.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Image
                        src={download.cover_url}
                        alt={download.title}
                        width={60}
                        height={80}
                        className="rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {download.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          by {download.author}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {download.format}
                          </Badge>
                          {download.file_size && (
                            <span className="text-xs text-gray-500">
                              {download.file_size}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Downloaded {new Date(download.downloaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Favorite Authors
              </h2>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Discover More
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((author) => (
                <Card key={author.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Image
                        src={author.avatar_url}
                        alt={author.name}
                        width={60}
                        height={60}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {author.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {author.books_count} books
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {author.bio}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{author.followers_count.toLocaleString()} followers</span>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Books
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reading List Tab */}
          <TabsContent value="reading-list" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                My Reading List
              </h2>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </div>

            <div className="space-y-4">
              {readingList.map((book) => (
                <Card key={book.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        width={60}
                        height={80}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          by {book.author}
                        </p>
                        <p className="text-xs text-gray-500">
                          Added {new Date(book.added_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(book.status)}>
                          {book.status.replace('_', ' ')}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
