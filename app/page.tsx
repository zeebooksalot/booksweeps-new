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
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DashboardBookCard } from "@/components/dashboard/DashboardBookCard"
import { DashboardCarouselContainer } from "@/components/dashboard/DashboardCarouselContainer"
import { DashboardAuthorCard } from "@/components/dashboard/DashboardAuthorCard"
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState"
import { DashboardFeaturedGiveawayCard } from "@/components/dashboard/DashboardFeaturedGiveawayCard"
import { HeroFloatingBooks } from "@/components/hero-floating-books"
import { HeroEmailForm } from "@/components/hero-email-form"
import { HeroSocialProof } from "@/components/hero-social-proof"

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

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-secondary">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-b from-primary/5 via-background to-background pt-36 pb-8 md:pt-36 md:pb-12 overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.05),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />

        {/* Floating book covers carousel in background */}
        <HeroFloatingBooks />

        <div className="container mx-auto px-4 text-center relative">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-4">
            Win <span className="text-primary">Books</span>, Read Prizes
          </h1>

          {/* Subheading with improved line-height */}
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed mb-8">
            Enter giveaways from your favorite authors, download free books, and discover new reads. Join thousands of
            book lovers finding their next great read.
          </p>

          {/* Email subscription form and CTAs */}
          <HeroEmailForm />

          {/* Social proof section */}
          <HeroSocialProof />
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">

        <main className="space-y-10">
          {/* Featured Giveaways Section */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Recommended Book Giveaways to Enter</h2>
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
        </main>
      </div>
    </div>
  )
}
