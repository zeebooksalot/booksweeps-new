"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star, Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { GradientBookCover } from "@/components/ui/gradient-book-cover"
import { useDynamicBadgeColor } from "@/hooks/useDynamicBadgeColor"

interface FeaturedItem {
  id: number
  type: 'giveaway' | 'book' | 'author'
  title: string
  description: string
  coverImage: string
  author?: string
  entries?: number
  daysLeft?: number
  rating?: number
  followers?: number
}

const featuredItems: FeaturedItem[] = [
  {
    id: 1,
    type: 'giveaway',
    title: "Epic Fantasy Bundle",
    description: "Win 5 bestselling fantasy novels + $50 Amazon gift card. Don't miss this incredible collection!",
    coverImage: "gradient:fantasy",
    entries: 2847,
    daysLeft: 5
  },
  {
    id: 2,
    type: 'book',
    title: "The Midnight Library",
    description: "A beautiful, uplifting novel about life, death, and the in-between. This week's featured read.",
    coverImage: "gradient:mystery",
    author: "Matt Haig",
    rating: 4.5
  },
  {
    id: 3,
    type: 'author',
    title: "Sarah J. Maas",
    description: "Bestselling fantasy author of the Throne of Glass series. Follow for exclusive giveaways and updates.",
    coverImage: "gradient:fantasy",
    followers: 125000
  }
]

interface FeaturedSliderProps {
  getDisplayName: () => string
  isHydrated: boolean
}

export function FeaturedSlider({ getDisplayName, isHydrated }: FeaturedSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredItems.length)
    }, 20000) // Change slide every 20 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredItems.length)
    setIsAutoPlaying(false) // Pause auto-play when user interacts
    // Restart auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)
    setIsAutoPlaying(false) // Pause auto-play when user interacts
    // Restart auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false) // Pause auto-play when user interacts
    // Restart auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const currentItem = featuredItems[currentSlide]

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">
            {!isHydrated ? 'Welcome!' : `Welcome, ${getDisplayName()}!`}
          </h2>
          <p className="text-sm italic text-muted-foreground mt-1">
            "The best way to find out if you can trust somebody is to trust them." - Ernest Hemingway
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Card 
        className="relative overflow-hidden group"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {featuredItems.map((item, index) => {
            const badgeColors = useDynamicBadgeColor(item.coverImage)
            return (
            <div key={item.id} className="w-full flex-shrink-0">
              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="relative w-full md:w-1/3 h-64 md:h-80">
                  {item.coverImage?.startsWith('gradient:') ? (
                    <GradientBookCover
                      genre={item.coverImage.replace('gradient:', '')}
                      title={item.title}
                      className="w-full h-full"
                      size="lg"
                    />
                  ) : (
                    <Image
                      src={item.coverImage || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div>
                      {/* Type Badge */}
                        <Badge 
                          className="mb-3 bg-muted text-muted-foreground border border-border"
                        >
                        {item.type === 'giveaway' ? 'Giveaway of the Week' : item.type === 'book' ? 'Book of the Week' : 'Author of the Week'}
                      </Badge>
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">{item.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {item.entries && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{item.entries.toLocaleString()} entries</span>
                        </div>
                      )}
                      {item.daysLeft && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{item.daysLeft} days left</span>
                        </div>
                      )}
                      {item.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{item.rating}/5</span>
                        </div>
                      )}
                      {item.followers && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{item.followers.toLocaleString()} followers</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Button 
                        size="lg" 
                        className="w-full md:w-auto bg-yellow-500/10 text-yellow-700 border border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500/40"
                        onClick={() => {
                          if (item.type === 'giveaway') {
                            // Navigate to giveaway
                            console.log('Navigate to giveaway:', item.id)
                          } else if (item.type === 'book') {
                            // Navigate to book details
                            console.log('Navigate to book:', item.id)
                          } else {
                            // Navigate to author profile
                            console.log('Navigate to author:', item.id)
                          }
                        }}
                      >
                        {item.type === 'giveaway' ? 'Enter Giveaway' : 
                         item.type === 'book' ? 'Read More' : 'Follow Author'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )
          })}
        </div>

      </Card>
    </div>
  )
}
