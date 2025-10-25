"use client"
import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header/index"
import { DashboardStatsCard } from "@/components/dashboard/DashboardStatsCard"
import { BookOpen, Trophy, Heart, Flame, Library, ArrowRight, Megaphone } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage, EnhancedAvatar } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DashboardBookCard } from "@/components/dashboard/DashboardBookCard"
import { DashboardCarouselContainer } from "@/components/dashboard/DashboardCarouselContainer"
import { DashboardAuthorCard } from "@/components/dashboard/DashboardAuthorCard"
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState"
import { DashboardFeaturedGiveawayCard } from "@/components/dashboard/DashboardFeaturedGiveawayCard"
import { FeaturedSlider } from "@/components/dashboard/FeaturedSlider"
import { useAuth } from "@/components/auth/AuthProvider"

const featuredGiveaways = [
  {
    id: 1,
    title: "Epic Fantasy Bundle",
    description: "Win 5 bestselling fantasy novels + $50 Amazon gift card",
    coverImage: "gradient:fantasy",
    entries: 2847,
    daysLeft: 5,
    featured: true,
  },
  {
    id: 2,
    title: "Romance Reader's Dream",
    description: "Complete romance collection with signed editions",
    coverImage: "gradient:romance",
    entries: 1923,
    daysLeft: 3,
    featured: true,
  },
  {
    id: 3,
    title: "Mystery Lover's Package",
    description: "3 mystery thrillers + exclusive author merchandise",
    coverImage: "gradient:mystery",
    entries: 1456,
    daysLeft: 8,
    featured: true,
  },
  {
    id: 4,
    title: "Sci-Fi Adventure Collection",
    description: "5 space opera novels + exclusive bookmarks",
    coverImage: "gradient:scifi",
    entries: 2134,
    daysLeft: 6,
    featured: true,
  },
  {
    id: 5,
    title: "Historical Fiction Set",
    description: "4 award-winning historical novels + tote bag",
    coverImage: "gradient:historical",
    entries: 1678,
    daysLeft: 4,
    featured: true,
  },
  {
    id: 6,
    title: "Horror Classics Bundle",
    description: "6 spine-chilling horror books + reading light",
    coverImage: "gradient:horror",
    entries: 1892,
    daysLeft: 7,
    featured: true,
  },
  {
    id: 7,
    title: "Adventure Seeker's Pack",
    description: "Complete adventure series + map poster",
    coverImage: "gradient:adventure",
    entries: 2456,
    daysLeft: 5,
    featured: true,
  },
  {
    id: 8,
    title: "Dark Fantasy Collection",
    description: "5 dark fantasy novels + exclusive art prints",
    coverImage: "/dark-fantasy-book-cover.png",
    entries: 2089,
    daysLeft: 9,
    featured: true,
  },
]

// Mock data for active entries
const activeEntries = [
  {
    id: 1,
    title: "Midnight's Promise",
    author: "Sarah Blake",
    genre: "Fantasy Romance",
    coverImage: "gradient:fantasy",
    entryDate: "Jan 15",
    daysLeft: 3,
  },
  {
    id: 2,
    title: "The Dragon's Heart",
    author: "Michael Chen",
    genre: "Epic Fantasy",
    coverImage: "gradient:fantasy",
    entryDate: "Jan 12",
    daysLeft: 7,
  },
  {
    id: 3,
    title: "Whispers of Magic",
    author: "Luna Martinez",
    genre: "Urban Fantasy",
    coverImage: "gradient:urban",
    entryDate: "Jan 10",
    daysLeft: 12,
  },
  {
    id: 4,
    title: "Ocean's Echo",
    author: "Elena Rodriguez",
    genre: "Romance",
    coverImage: "gradient:romance",
    entryDate: "Jan 8",
    daysLeft: 5,
  },
  {
    id: 5,
    title: "Shadow's Edge",
    author: "James Morrison",
    genre: "Dark Fantasy",
    coverImage: "gradient:fantasy",
    entryDate: "Jan 5",
    daysLeft: 9,
  },
  {
    id: 6,
    title: "Starlight Dreams",
    author: "Sophia Williams",
    genre: "Sci-Fi Romance",
    coverImage: "gradient:scifi",
    entryDate: "Jan 3",
    daysLeft: 14,
  },
]

// Mock data for ended entries
const endedEntries = [
  {
    id: 1,
    title: "The Winter's Tale",
    author: "Rebecca Snow",
    genre: "Fantasy",
    coverImage: "gradient:fantasy",
    entryDate: "Dec 20",
    endedDate: "Jan 10",
    winner: false,
  },
  {
    id: 2,
    title: "Crimson Moon",
    author: "Victor Blackwood",
    genre: "Horror",
    coverImage: "gradient:horror",
    entryDate: "Dec 18",
    endedDate: "Jan 8",
    winner: false,
  },
  {
    id: 3,
    title: "Space Odyssey",
    author: "Dr. Sarah Chen",
    genre: "Sci-Fi",
    coverImage: "gradient:scifi",
    entryDate: "Dec 15",
    endedDate: "Jan 5",
    winner: true,
  },
  {
    id: 4,
    title: "Ancient Secrets",
    author: "Marcus Stone",
    genre: "Historical",
    coverImage: "gradient:historical",
    entryDate: "Dec 12",
    endedDate: "Jan 3",
    winner: false,
  },
  {
    id: 5,
    title: "Desert Storm",
    author: "Amir Hassan",
    genre: "Adventure",
    coverImage: "gradient:adventure",
    entryDate: "Dec 10",
    endedDate: "Jan 1",
    winner: false,
  },
]

const booksWon = [
  {
    id: 1,
    title: "The Last Kingdom",
    author: "Robert Hayes",
    genre: "Historical Fiction",
    coverImage: "gradient:historical",
    wonDate: "Dec 28",
    status: "Shipped",
  },
  {
    id: 2,
    title: "Crimson Skies",
    author: "Amanda Foster",
    genre: "Adventure",
    coverImage: "gradient:adventure",
    wonDate: "Dec 15",
    status: "Delivered",
  },
  {
    id: 3,
    title: "Eternal Night",
    author: "Victor Stone",
    genre: "Horror",
    coverImage: "gradient:horror",
    wonDate: "Dec 1",
    status: "Delivered",
  },
]

// Mock data for user's books
const yourBooks = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Contemporary Fiction",
    coverImage: "/placeholder.svg?height=400&width=300",
    addedDate: "Jan 20",
    status: "Reading",
  },
  {
    id: 2,
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    coverImage: "/placeholder.svg?height=400&width=300",
    addedDate: "Jan 18",
    status: "To Read",
  },
  {
    id: 3,
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    genre: "Historical Fiction",
    coverImage: "/placeholder.svg?height=400&width=300",
    addedDate: "Jan 15",
    status: "Completed",
  },
]

// Mock data for recommended authors
const recommendedAuthors = [
  {
    id: 1,
    name: "Sarah Blake",
    genre: "Fantasy Romance",
    avatar: "SB",
    booksPublished: 12,
    followers: 8500,
    bio: "Author of magical romance novels",
  },
  {
    id: 2,
    name: "Michael Chen",
    genre: "Epic Fantasy",
    avatar: "MC",
    booksPublished: 8,
    followers: 12300,
    bio: "Award-winning fantasy storyteller",
  },
  {
    id: 3,
    name: "Luna Martinez",
    genre: "Urban Fantasy",
    avatar: "LM",
    booksPublished: 15,
    followers: 9800,
    bio: "Creator of modern magical worlds",
  },
  {
    id: 4,
    name: "Elena Rodriguez",
    genre: "Romance",
    avatar: "ER",
    booksPublished: 20,
    followers: 15600,
    bio: "Contemporary romance specialist",
  },
  {
    id: 5,
    name: "David Knight",
    genre: "Historical Fiction",
    avatar: "DK",
    booksPublished: 10,
    followers: 7200,
    bio: "Master of historical narratives",
  },
  {
    id: 6,
    name: "Rachel Winters",
    genre: "Horror",
    avatar: "RW",
    booksPublished: 14,
    followers: 11400,
    bio: "Queen of spine-chilling tales",
  },
  {
    id: 7,
    name: "Amir Hassan",
    genre: "Adventure",
    avatar: "AH",
    booksPublished: 9,
    followers: 6800,
    bio: "Explorer of thrilling adventures",
  },
  {
    id: 8,
    name: "Maya Chen",
    genre: "Urban Fantasy",
    avatar: "MC",
    booksPublished: 11,
    followers: 10200,
    bio: "Weaver of urban magic stories",
  },
]

// Mock data for recommended free books
const recommendedFreeBooks = [
  {
    id: 1,
    title: "The Enchanted Forest",
    author: "Emma Thompson",
    genre: "Fantasy",
    coverImage: "gradient:fantasy",
    rating: 4.5,
    downloads: 12500,
  },
  {
    id: 2,
    title: "Cyber Dreams",
    author: "Alex Rivera",
    genre: "Sci-Fi",
    coverImage: "gradient:scifi",
    rating: 4.7,
    downloads: 8900,
  },
  {
    id: 3,
    title: "Shadows of the Past",
    author: "Marcus Black",
    genre: "Mystery",
    coverImage: "gradient:mystery",
    rating: 4.3,
    downloads: 15200,
  },
  {
    id: 4,
    title: "Love in Paris",
    author: "Sophie Laurent",
    genre: "Romance",
    coverImage: "gradient:romance",
    rating: 4.6,
    downloads: 10800,
  },
  {
    id: 5,
    title: "The Last Battle",
    author: "David Knight",
    genre: "Historical",
    coverImage: "gradient:historical",
    rating: 4.4,
    downloads: 9300,
  },
  {
    id: 6,
    title: "Midnight Terror",
    author: "Rachel Winters",
    genre: "Horror",
    coverImage: "gradient:horror",
    rating: 4.2,
    downloads: 7600,
  },
  {
    id: 7,
    title: "Desert Winds",
    author: "Amir Hassan",
    genre: "Adventure",
    coverImage: "gradient:adventure",
    rating: 4.5,
    downloads: 11200,
  },
  {
    id: 8,
    title: "Urban Legends",
    author: "Maya Chen",
    genre: "Urban Fantasy",
    coverImage: "gradient:urban",
    rating: 4.8,
    downloads: 13400,
  },
  {
    id: 9,
    title: "Time Traveler's Guide",
    author: "Dr. James Wilson",
    genre: "Sci-Fi",
    coverImage: "gradient:scifi",
    rating: 4.6,
    downloads: 9800,
  },
  {
    id: 10,
    title: "Witch's Brew",
    author: "Sabrina Moon",
    genre: "Fantasy",
    coverImage: "gradient:fantasy",
    rating: 4.4,
    downloads: 10500,
  },
]

export default function DashboardPage() {
  const { user, userProfile } = useAuth()
  const searchParams = useSearchParams()
  
  // Initialize activeTab from URL search params immediately
  const getInitialTab = () => {
    const tab = searchParams.get('tab')
    if (tab && ['home', 'active-entries', 'books-won', 'your-books', 'following', 'profile', 'settings'].includes(tab)) {
      return tab
    }
    return "home"
  }
  
  const [activeTab, setActiveTab] = useState(getInitialTab)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [entriesFilter, setEntriesFilter] = useState<"active" | "ended">("active")
  const [searchQuery, setSearchQuery] = useState("")
  const [isHydrated, setIsHydrated] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Update URL when activeTab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    if (tab === 'home') {
      url.searchParams.delete('tab')
    } else {
      url.searchParams.set('tab', tab)
    }
    window.history.replaceState({}, '', url.toString())
  }
  const [genrePreferences, setGenrePreferences] = useState({
    fantasy: true,
    romance: true,
    sciFi: false,
    mystery: true,
    thriller: false,
    horror: false,
    historicalFiction: false,
    contemporary: true,
    youngAdult: false,
    paranormal: false,
  })

  // Get display name with fallbacks
  const getDisplayName = () => {
    if (userProfile?.display_name) {
      return userProfile.display_name
    }
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    }
    if (userProfile?.first_name) {
      return userProfile.first_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  const [emailNotifications, setEmailNotifications] = useState({
    newGiveaways: true,
    endingReminders: true,
    winnerAnnouncements: true,
    followedAuthors: true,
    weeklyDigest: false,
    marketingEmails: false,
  })

  const handleGenreToggle = (genre: keyof typeof genrePreferences) => {
    setGenrePreferences((prev) => ({
      ...prev,
      [genre]: !prev[genre],
    }))
  }

  const handleEmailToggle = (notification: keyof typeof emailNotifications) => {
    setEmailNotifications((prev) => ({
      ...prev,
      [notification]: !prev[notification],
    }))
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex gap-12">
          {/* Floating Left Sidebar */}
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Home Tab Content */}
            {activeTab === "home" && (
              <div className="space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Entries</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Books Won</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Following</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">28</p>
                      </div>
                      <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center">
                        <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reading Streak</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">15 days</p>
                      </div>
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                        <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Featured Slider */}
                <FeaturedSlider getDisplayName={getDisplayName} isHydrated={isHydrated} />

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">Recommended Book Giveaways to Enter</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Discover new giveaways and free books tailored to your interests
                      </p>
                    </div>
                    <Link href="/book-giveaways">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <DashboardCarouselContainer>
                    {featuredGiveaways.map((giveaway) => (
                      <DashboardFeaturedGiveawayCard key={giveaway.id} {...giveaway} />
                    ))}
                  </DashboardCarouselContainer>
                </div>

                {/* Recommended Free Books to Download Section */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Recommended Free Books to Download</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Download these free books instantly to your device
                      </p>
                    </div>
                    <Link href="/free-ebooks">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <DashboardCarouselContainer>
                    {recommendedFreeBooks.map((book) => (
                      <div key={book.id} className="flex-none w-[calc(20%-12.8px)] min-w-[180px] snap-start">
                        <DashboardBookCard {...book} showDownloadButton={true} />
                      </div>
                    ))}
                  </DashboardCarouselContainer>
                </div>

                {/* Recommended Authors to Follow Section */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Recommended Authors to Follow</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Follow these authors to get notified of their new giveaways and releases
                      </p>
                    </div>
                    <Link href="/authors">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <DashboardCarouselContainer>
                    {recommendedAuthors.map((author) => (
                      <DashboardAuthorCard key={author.id} {...author} />
                    ))}
                  </DashboardCarouselContainer>
                </div>
              </div>
            )}

            {/* Active Entries Tab Content */}
            {activeTab === "active-entries" && (
              <div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Your Active Entries</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track all the giveaways you&apos;ve entered and their remaining time
                  </p>
                </div>

                <div className="flex gap-2 mt-6 mb-4">
                  <Button
                    variant={entriesFilter === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEntriesFilter("active")}
                    className={entriesFilter === "active" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Active ({activeEntries.length})
                  </Button>
                  <Button
                    variant={entriesFilter === "ended" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEntriesFilter("ended")}
                    className={entriesFilter === "ended" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Ended ({endedEntries.length})
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {entriesFilter === "active"
                    ? activeEntries.map((entry) => <DashboardBookCard key={entry.id} {...entry} />)
                    : endedEntries.map((entry) => <DashboardBookCard key={entry.id} {...entry} />)}
                </div>
              </div>
            )}

            {/* Books Won Tab Content */}
            {activeTab === "books-won" && (
              <div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Books You&apos;ve Won</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    View all the books you&apos;ve won from giveaways and their delivery status
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
                  {booksWon.map((book) => (
                    <DashboardBookCard key={book.id} {...book} />
                  ))}
                </div>
              </div>
            )}

            {/* Your Books Tab Content */}
            {activeTab === "your-books" && (
              <div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Your Books</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your personal book collection and reading progress
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-6">
                  {yourBooks.map((book) => (
                    <DashboardBookCard key={book.id} {...book} />
                  ))}
                </div>
              </div>
            )}

            {/* Following Tab Content */}
            {activeTab === "following" && (
              <div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Authors You&apos;re Following</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Stay updated with your favorite authors and their latest giveaways
                  </p>
                </div>
                <div className="mt-6">
                  <DashboardEmptyState
                    icon={Heart}
                    title="You&apos;re not following any authors yet"
                    description="Discover authors below and follow them to get notified of their new giveaways"
                  />

                  {/* Recommended Authors Section */}
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Recommended Authors to Follow</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {recommendedAuthors.map((author) => (
                        <div key={author.id} className="w-full">
                          <DashboardAuthorCard {...author} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab Content */}
            {activeTab === "profile" && (
              <div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Your Profile</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your account information and view your BookSweeps activity
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 items-start">
                  {/* Profile Information Card */}
                  <Card className="border-border/50 lg:col-span-2">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-lg">Profile Information</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Member Since</span>
                              <span className="text-sm font-medium text-foreground">
                                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  year: 'numeric' 
                                }) : 'N/A'}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Manage your account information and preferences
                          </p>
                        </div>

                        {/* Avatar and Form Fields Section */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-8">
                            <div className="space-y-3 flex flex-col items-center">
                              <Label className="text-sm font-medium">Profile Picture</Label>
                              {!isHydrated ? (
                                <div className="h-20 w-20 bg-muted animate-pulse rounded-full flex items-center justify-center">
                                  <span className="text-muted-foreground text-sm">Loading...</span>
                                </div>
                              ) : (
                                <EnhancedAvatar
                                  src={userProfile?.avatar_url}
                                  email={user?.email}
                                  name={userProfile?.display_name || undefined}
                                  size={80}
                                  alt={getDisplayName()}
                                  className="h-20 w-20"
                                />
                              )}
                              <div className="text-center">
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/20 hover:text-yellow-700 hover:border-yellow-500/40"
                                      >
                                        Upload New Photo
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>JPG, PNG or GIF. Max size 2MB.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                            
                            {/* Name and Email Fields */}
                            <div className="space-y-4 flex-1">
                              <div className="space-y-2">
                                <Label htmlFor="display_name" className="text-sm font-medium">
                                  Display Name
                                </Label>
                                {!isHydrated ? (
                                  <div className="h-10 bg-muted animate-pulse rounded-md max-w-md"></div>
                                ) : (
                                  <Input 
                                    id="display_name" 
                                    type="text" 
                                    defaultValue={userProfile?.display_name || ""} 
                                    className="max-w-md" 
                                    placeholder="Enter your display name"
                                  />
                                )}
                                <p className="text-xs text-muted-foreground">
                                  This is how your name will appear to other users
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                  Email Address
                                </Label>
                                {!isHydrated ? (
                                  <div className="h-10 bg-muted animate-pulse rounded-md max-w-md"></div>
                                ) : (
                                  <Input id="email" type="email" defaultValue={user?.email || ""} className="max-w-md" />
                                )}
                                <p className="text-xs text-muted-foreground">
                                  This is the email address associated with your account
                                </p>
                              </div>
                              
                              <div className="pt-2 space-y-3">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-sm bg-background border-border text-foreground font-normal hover:border-foreground/50 hover:bg-background hover:text-foreground"
                                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                                >
                                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                                </Button>
                                
                                {showPasswordForm && (
                                  <div className="space-y-3 p-4 border border-border/50 rounded-lg bg-muted/30">
                                    <h4 className="font-semibold text-sm">Change Password</h4>
                                    <div className="space-y-3">
                                      <div className="space-y-2">
                                        <Label htmlFor="current-password" className="text-sm font-medium">
                                          Current Password
                                        </Label>
                                        <Input id="current-password" type="password" className="max-w-md" />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="new-password" className="text-sm font-medium">
                                          New Password
                                        </Label>
                                        <Input id="new-password" type="password" className="max-w-md" />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="confirm-password" className="text-sm font-medium">
                                          Confirm New Password
                                        </Label>
                                        <Input id="confirm-password" type="password" className="max-w-md" />
                                      </div>
                                      <div className="flex gap-2 pt-2">
                                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                                          Update Password
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => setShowPasswordForm(false)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <div className="flex gap-3 p-6 border-t border-border/50">
                      <Button className="bg-primary hover:bg-primary/90 text-white">Save Changes</Button>
                      <Button variant="outline">Cancel</Button>
                    </div>
                  </Card>
                  
                  {/* Invite Your Friends Card */}
                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">Invite Your Friends</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Share BookSweeps with your book-loving friends and earn rewards!
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium">Your Referral Link</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-background px-2 py-1 rounded border flex-1 truncate">
                                booksweeps.com/ref/yourcode
                              </code>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="shrink-0"
                              >
                                Copy
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Friends Referred</span>
                              <span className="font-medium">0</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Rewards Earned</span>
                              <span className="font-medium">$0</span>
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            className="w-full bg-yellow-500/10 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/20 hover:text-yellow-700 hover:border-yellow-500/40"
                          >
                            Share with Friends
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Settings Tab Content */}
            {activeTab === "settings" && (
              <div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customize your preferences and notification settings
                  </p>
                </div>
                <div className="space-y-6 mt-6">
                  {/* Genre Preferences Card */}
                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">Genre Preferences</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Select your favorite genres to receive personalized giveaway recommendations
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <Label htmlFor="fantasy" className="text-sm font-medium cursor-pointer">
                              Fantasy
                            </Label>
                            <Switch
                              id="fantasy"
                              checked={genrePreferences.fantasy}
                              onCheckedChange={() => handleGenreToggle("fantasy")}
                            />
                          </div>
                          <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <Label htmlFor="romance" className="text-sm font-medium cursor-pointer">
                              Romance
                            </Label>
                            <Switch
                              id="romance"
                              checked={genrePreferences.romance}
                              onCheckedChange={() => handleGenreToggle("romance")}
                            />
                          </div>
                          <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <Label htmlFor="sciFi" className="text-sm font-medium cursor-pointer">
                              Science Fiction
                            </Label>
                            <Switch
                              id="sciFi"
                              checked={genrePreferences.sciFi}
                              onCheckedChange={() => handleGenreToggle("sciFi")}
                            />
                          </div>
                          <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <Label htmlFor="mystery" className="text-sm font-medium cursor-pointer">
                              Mystery
                            </Label>
                            <Switch
                              id="mystery"
                              checked={genrePreferences.mystery}
                              onCheckedChange={() => handleGenreToggle("mystery")}
                            />
                          </div>
                          <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <Label htmlFor="thriller" className="text-sm font-medium cursor-pointer">
                              Thriller
                            </Label>
                            <Switch
                              id="thriller"
                              checked={genrePreferences.thriller}
                              onCheckedChange={() => handleGenreToggle("thriller")}
                            />
                          </div>
                          <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <Label htmlFor="horror" className="text-sm font-medium cursor-pointer">
                              Horror
                            </Label>
                            <Switch
                              id="horror"
                              checked={genrePreferences.horror}
                              onCheckedChange={() => handleGenreToggle("horror")}
                            />
                          </div>
                          <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <Label htmlFor="historicalFiction" className="text-sm font-medium cursor-pointer">
                              Historical Fiction
                            </Label>
                            <Switch
                              id="historicalFiction"
                              checked={genrePreferences.historicalFiction}
                              onCheckedChange={() => handleGenreToggle("historicalFiction")}
                            />
                          </div>
                          <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <Label htmlFor="contemporary" className="text-sm font-medium cursor-pointer">
                              Contemporary
                            </Label>
                            <Switch
                              id="contemporary"
                              checked={genrePreferences.contemporary}
                              onCheckedChange={() => handleGenreToggle("contemporary")}
                            />
                          </div>
                          <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <Label htmlFor="youngAdult" className="text-sm font-medium cursor-pointer">
                              Young Adult
                            </Label>
                            <Switch
                              id="youngAdult"
                              checked={genrePreferences.youngAdult}
                              onCheckedChange={() => handleGenreToggle("youngAdult")}
                            />
                          </div>
                          <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <Label htmlFor="paranormal" className="text-sm font-medium cursor-pointer">
                              Paranormal
                            </Label>
                            <Switch
                              id="paranormal"
                              checked={genrePreferences.paranormal}
                              onCheckedChange={() => handleGenreToggle("paranormal")}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-border/50">
                          <Button className="bg-primary hover:bg-primary/90 text-white">Save Preferences</Button>
                          <Button variant="outline">Reset to Default</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Email Notifications Card */}
                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">Email Notifications</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Manage how and when you receive email notifications from BookSweeps
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start justify-between space-x-4 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <div className="space-y-0.5">
                              <Label htmlFor="newGiveaways" className="text-sm font-medium cursor-pointer">
                                New Giveaway Alerts
                              </Label>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Get notified when new giveaways match your genre preferences
                              </p>
                            </div>
                            <Switch
                              id="newGiveaways"
                              checked={emailNotifications.newGiveaways}
                              onCheckedChange={() => handleEmailToggle("newGiveaways")}
                            />
                          </div>

                          <div className="flex items-start justify-between space-x-4 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <div className="space-y-0.5">
                              <Label htmlFor="endingReminders" className="text-sm font-medium cursor-pointer">
                                Giveaway Ending Reminders
                              </Label>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Receive reminders when your entered giveaways are ending soon
                              </p>
                            </div>
                            <Switch
                              id="endingReminders"
                              checked={emailNotifications.endingReminders}
                              onCheckedChange={() => handleEmailToggle("endingReminders")}
                            />
                          </div>

                          <div className="flex items-start justify-between space-x-4 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <div className="space-y-0.5">
                              <Label htmlFor="winnerAnnouncements" className="text-sm font-medium cursor-pointer">
                                Winner Announcements
                              </Label>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Be notified immediately when you win a giveaway
                              </p>
                            </div>
                            <Switch
                              id="winnerAnnouncements"
                              checked={emailNotifications.winnerAnnouncements}
                              onCheckedChange={() => handleEmailToggle("winnerAnnouncements")}
                            />
                          </div>

                          <div className="flex items-start justify-between space-x-4 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <div className="space-y-0.5">
                              <Label htmlFor="followedAuthors" className="text-sm font-medium cursor-pointer">
                                New Books from Followed Authors
                              </Label>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Get alerts when authors you follow launch new giveaways
                              </p>
                            </div>
                            <Switch
                              id="followedAuthors"
                              checked={emailNotifications.followedAuthors}
                              onCheckedChange={() => handleEmailToggle("followedAuthors")}
                            />
                          </div>

                          <div className="flex items-start justify-between space-x-4 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <div className="space-y-0.5">
                              <Label htmlFor="weeklyDigest" className="text-sm font-medium cursor-pointer">
                                Weekly Digest
                              </Label>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Receive a weekly summary of new giveaways and your activity
                              </p>
                            </div>
                            <Switch
                              id="weeklyDigest"
                              checked={emailNotifications.weeklyDigest}
                              onCheckedChange={() => handleEmailToggle("weeklyDigest")}
                            />
                          </div>

                          <div className="flex items-start justify-between space-x-4 p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                            <div className="space-y-0.5">
                              <Label htmlFor="marketingEmails" className="text-sm font-medium cursor-pointer">
                                Marketing & Promotions
                              </Label>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Receive promotional content, special offers, and platform updates
                              </p>
                            </div>
                            <Switch
                              id="marketingEmails"
                              checked={emailNotifications.marketingEmails}
                              onCheckedChange={() => handleEmailToggle("marketingEmails")}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-border/50">
                          <Button className="bg-primary hover:bg-primary/90">Save Notification Settings</Button>
                          <Button variant="outline">Unsubscribe from All</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
