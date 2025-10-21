"use client"
import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Header } from "@/components/header/index"
import { DashboardStatsCard } from "@/components/dashboard/DashboardStatsCard"
import { BookOpen, Trophy, Heart, Flame, Library, ArrowRight } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DashboardBookCard } from "@/components/dashboard/DashboardBookCard"
import { DashboardCarouselContainer } from "@/components/dashboard/DashboardCarouselContainer"
import { DashboardAuthorCard } from "@/components/dashboard/DashboardAuthorCard"
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState"
import { DashboardFeaturedGiveawayCard } from "@/components/dashboard/DashboardFeaturedGiveawayCard"

const featuredGiveaways = [
  {
    id: 1,
    title: "Epic Fantasy Bundle",
    description: "Win 5 bestselling fantasy novels + $50 Amazon gift card",
    coverImage: "/dragon-fantasy-book-cover.png",
    entries: 2847,
    daysLeft: 5,
    featured: true,
  },
  {
    id: 2,
    title: "Romance Reader's Dream",
    description: "Complete romance collection with signed editions",
    coverImage: "/fantasy-romance-book-cover.jpg",
    entries: 1923,
    daysLeft: 3,
    featured: true,
  },
  {
    id: 3,
    title: "Mystery Lover's Package",
    description: "3 mystery thrillers + exclusive author merchandise",
    coverImage: "/urban-fantasy-book-cover.jpg",
    entries: 1456,
    daysLeft: 8,
    featured: true,
  },
  {
    id: 4,
    title: "Sci-Fi Adventure Collection",
    description: "5 space opera novels + exclusive bookmarks",
    coverImage: "/scifi-romance-book-cover.jpg",
    entries: 2134,
    daysLeft: 6,
    featured: true,
  },
  {
    id: 5,
    title: "Historical Fiction Set",
    description: "4 award-winning historical novels + tote bag",
    coverImage: "/historical-fiction-book-cover.png",
    entries: 1678,
    daysLeft: 4,
    featured: true,
  },
  {
    id: 6,
    title: "Horror Classics Bundle",
    description: "6 spine-chilling horror books + reading light",
    coverImage: "/horror-book-cover.png",
    entries: 1892,
    daysLeft: 7,
    featured: true,
  },
  {
    id: 7,
    title: "Adventure Seeker's Pack",
    description: "Complete adventure series + map poster",
    coverImage: "/adventure-book-cover.png",
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
    coverImage: "/fantasy-romance-book-cover.jpg",
    entryDate: "Jan 15",
    daysLeft: 3,
  },
  {
    id: 2,
    title: "The Dragon's Heart",
    author: "Michael Chen",
    genre: "Epic Fantasy",
    coverImage: "/dragon-fantasy-book-cover.png",
    entryDate: "Jan 12",
    daysLeft: 7,
  },
  {
    id: 3,
    title: "Whispers of Magic",
    author: "Luna Martinez",
    genre: "Urban Fantasy",
    coverImage: "/urban-fantasy-book-cover.jpg",
    entryDate: "Jan 10",
    daysLeft: 12,
  },
  {
    id: 4,
    title: "Ocean's Echo",
    author: "Elena Rodriguez",
    genre: "Romance",
    coverImage: "/ocean-romance-book-cover.jpg",
    entryDate: "Jan 8",
    daysLeft: 5,
  },
  {
    id: 5,
    title: "Shadow's Edge",
    author: "James Morrison",
    genre: "Dark Fantasy",
    coverImage: "/dark-fantasy-book-cover.png",
    entryDate: "Jan 5",
    daysLeft: 9,
  },
  {
    id: 6,
    title: "Starlight Dreams",
    author: "Sophia Williams",
    genre: "Sci-Fi Romance",
    coverImage: "/scifi-romance-book-cover.jpg",
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
    coverImage: "/fantasy-romance-book-cover.jpg",
    entryDate: "Dec 20",
    endedDate: "Jan 10",
    winner: false,
  },
  {
    id: 2,
    title: "Crimson Moon",
    author: "Victor Blackwood",
    genre: "Horror",
    coverImage: "/horror-book-cover.png",
    entryDate: "Dec 18",
    endedDate: "Jan 8",
    winner: false,
  },
  {
    id: 3,
    title: "Space Odyssey",
    author: "Dr. Sarah Chen",
    genre: "Sci-Fi",
    coverImage: "/scifi-romance-book-cover.jpg",
    entryDate: "Dec 15",
    endedDate: "Jan 5",
    winner: true,
  },
  {
    id: 4,
    title: "Ancient Secrets",
    author: "Marcus Stone",
    genre: "Historical",
    coverImage: "/historical-fiction-book-cover.png",
    entryDate: "Dec 12",
    endedDate: "Jan 3",
    winner: false,
  },
  {
    id: 5,
    title: "Desert Storm",
    author: "Amir Hassan",
    genre: "Adventure",
    coverImage: "/adventure-book-cover.png",
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
    coverImage: "/historical-fiction-book-cover.png",
    wonDate: "Dec 28",
    status: "Shipped",
  },
  {
    id: 2,
    title: "Crimson Skies",
    author: "Amanda Foster",
    genre: "Adventure",
    coverImage: "/adventure-book-cover.png",
    wonDate: "Dec 15",
    status: "Delivered",
  },
  {
    id: 3,
    title: "Eternal Night",
    author: "Victor Stone",
    genre: "Horror",
    coverImage: "/horror-book-cover.png",
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
    coverImage: "/fantasy-romance-book-cover.jpg",
    rating: 4.5,
    downloads: 12500,
  },
  {
    id: 2,
    title: "Cyber Dreams",
    author: "Alex Rivera",
    genre: "Sci-Fi",
    coverImage: "/scifi-romance-book-cover.jpg",
    rating: 4.7,
    downloads: 8900,
  },
  {
    id: 3,
    title: "Shadows of the Past",
    author: "Marcus Black",
    genre: "Mystery",
    coverImage: "/dark-fantasy-book-cover.png",
    rating: 4.3,
    downloads: 15200,
  },
  {
    id: 4,
    title: "Love in Paris",
    author: "Sophie Laurent",
    genre: "Romance",
    coverImage: "/ocean-romance-book-cover.jpg",
    rating: 4.6,
    downloads: 10800,
  },
  {
    id: 5,
    title: "The Last Battle",
    author: "David Knight",
    genre: "Historical",
    coverImage: "/historical-fiction-book-cover.png",
    rating: 4.4,
    downloads: 9300,
  },
  {
    id: 6,
    title: "Midnight Terror",
    author: "Rachel Winters",
    genre: "Horror",
    coverImage: "/horror-book-cover.png",
    rating: 4.2,
    downloads: 7600,
  },
  {
    id: 7,
    title: "Desert Winds",
    author: "Amir Hassan",
    genre: "Adventure",
    coverImage: "/adventure-book-cover.png",
    rating: 4.5,
    downloads: 11200,
  },
  {
    id: 8,
    title: "Urban Legends",
    author: "Maya Chen",
    genre: "Urban Fantasy",
    coverImage: "/urban-fantasy-book-cover.jpg",
    rating: 4.8,
    downloads: 13400,
  },
  {
    id: 9,
    title: "Time Traveler's Guide",
    author: "Dr. James Wilson",
    genre: "Sci-Fi",
    coverImage: "/scifi-romance-book-cover.jpg",
    rating: 4.6,
    downloads: 9800,
  },
  {
    id: 10,
    title: "Witch's Brew",
    author: "Sabrina Moon",
    genre: "Fantasy",
    coverImage: "/fantasy-romance-book-cover.jpg",
    rating: 4.4,
    downloads: 10500,
  },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("home")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [entriesFilter, setEntriesFilter] = useState<"active" | "ended">("active")
  const [searchQuery, setSearchQuery] = useState("")
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
        <div className="flex gap-8">
          {/* Floating Left Sidebar */}
          <DashboardSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Home Tab Content */}
            {activeTab === "home" && (
              <div className="space-y-10">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">Welcome, Jane Doe!</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Discover new giveaways and free books tailored to your interests
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
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
                    Track all the giveaways you've entered and their remaining time
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
                  <h2 className="text-2xl font-bold tracking-tight">Books You've Won</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    View all the books you've won from giveaways and their delivery status
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
                  <h2 className="text-2xl font-bold tracking-tight">Authors You're Following</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Stay updated with your favorite authors and their latest giveaways
                  </p>
                </div>
                <div className="mt-6">
                  <DashboardEmptyState
                    icon={Heart}
                    title="You're not following any authors yet"
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
                <div className="space-y-6 mt-6">
                  {/* Stats Overview */}
                  <div>
                    <h3 className="text-lg font-semibold">Your Stats</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                      <DashboardStatsCard title="Active Entries" value={12} icon={BookOpen} />
                      <DashboardStatsCard title="Books Won" value={3} icon={Trophy} />
                      <DashboardStatsCard title="My Books" value={3} icon={Library} />
                      <DashboardStatsCard title="Following" value={28} icon={Heart} />
                      <DashboardStatsCard title="Reading Streak" value="15 days" icon={Flame} />
                    </div>
                  </div>

                  {/* Profile Information Card */}
                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">Profile Information</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Manage your account information and preferences
                          </p>
                        </div>

                        {/* Avatar Section */}
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Profile Picture</Label>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src="/placeholder.svg" alt="Jane Doe" />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                                JD
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                              <Button variant="outline" size="sm">
                                Upload New Photo
                              </Button>
                              <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                            </div>
                          </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">
                            Email Address
                          </Label>
                          <Input id="email" type="email" defaultValue="jane.doe@example.com" className="max-w-md" />
                          <p className="text-xs text-muted-foreground">
                            This is the email address associated with your account
                          </p>
                        </div>

                        {/* Password Reset Section */}
                        <div className="space-y-4 pt-4 border-t border-border/50">
                          <div>
                            <h4 className="font-semibold text-base mb-1">Change Password</h4>
                            <p className="text-sm text-muted-foreground">
                              Update your password to keep your account secure
                            </p>
                          </div>

                          <div className="space-y-4 max-w-md">
                            <div className="space-y-2">
                              <Label htmlFor="current-password" className="text-sm font-medium">
                                Current Password
                              </Label>
                              <Input id="current-password" type="password" />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="new-password" className="text-sm font-medium">
                                New Password
                              </Label>
                              <Input id="new-password" type="password" />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="confirm-password" className="text-sm font-medium">
                                Confirm New Password
                              </Label>
                              <Input id="confirm-password" type="password" />
                            </div>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex gap-3 pt-4">
                          <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
                          <Button variant="outline">Cancel</Button>
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
                          <Button className="bg-primary hover:bg-primary/90">Save Preferences</Button>
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
