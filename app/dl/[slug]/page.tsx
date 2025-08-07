"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Download,
  Mail,
  BookOpen,
  Star,
  CheckCircle,
  ArrowRight,
  Heart,
  Share2,
  MessageCircle,
  Calendar,
  User,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface ReaderMagnet {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  author: {
    name: string
    bio: string
    avatar_url: string
    website?: string
  }
  book: {
    title: string
    cover_url: string
    genre: string
    page_count?: number
    format: 'pdf' | 'epub' | 'mobi' | 'chapter'
    file_size?: string
  }
  benefits: string[]
  testimonials: {
    name: string
    text: string
    rating: number
  }[]
  download_count: number
  created_at: string
  is_active: boolean
}

export default function ReaderMagnetPage({ params }: { params: Promise<{ slug: string }> }) {
  const [magnet, setMagnet] = useState<ReaderMagnet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState("")
  const [slug, setSlug] = useState<string>("")

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (!slug) return
    
    const fetchMagnet = async () => {
      setIsLoading(true)
      try {
        // Try to fetch from API first
        const response = await fetch(`/api/reader-magnets?slug=${slug}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.reader_magnets && data.reader_magnets.length > 0) {
            const apiMagnet = data.reader_magnets[0]
            // Map API data to our interface
            const mappedMagnet: ReaderMagnet = {
              id: apiMagnet.id,
              slug: apiMagnet.slug,
              title: apiMagnet.title,
              subtitle: apiMagnet.subtitle,
              description: apiMagnet.description,
              author: {
                name: apiMagnet.authors?.name || "Unknown Author",
                bio: apiMagnet.authors?.bio || "",
                avatar_url: apiMagnet.authors?.avatar_url || "/placeholder.svg?height=64&width=64",
                website: apiMagnet.authors?.website
              },
              book: {
                title: apiMagnet.books?.title || "Unknown Book",
                cover_url: apiMagnet.books?.cover_url || "/placeholder.svg?height=300&width=200",
                genre: apiMagnet.books?.genre || "General",
                page_count: apiMagnet.page_count,
                format: apiMagnet.format || 'pdf',
                file_size: apiMagnet.file_size
              },
              benefits: apiMagnet.benefits || [],
              testimonials: [], // Would come from separate API
              download_count: apiMagnet.download_count || 0,
              created_at: apiMagnet.created_at,
              is_active: apiMagnet.is_active
            }
            setMagnet(mappedMagnet)
            return
          }
        }

        // Fallback to mock data for development
        const mockMagnet: ReaderMagnet = {
          id: "1",
          slug: slug,
          title: "The Lost Chapter",
          subtitle: "A never-before-published chapter from Ocean's Echo",
          description: "Discover the secret origins of the underwater kingdom in this exclusive chapter that was cut from the final book. Follow Princess Marina as she uncovers ancient magic that could save or destroy her world.",
          author: {
            name: "Elena Rodriguez",
            bio: "Bestselling fantasy romance author with over 500,000 books sold. Known for her vivid world-building and compelling characters that stay with readers long after the final page.",
            avatar_url: "/placeholder.svg?height=64&width=64",
            website: "https://elenarodriguez.com"
          },
          book: {
            title: "Ocean's Echo",
            cover_url: "/placeholder.svg?height=300&width=200",
            genre: "Fantasy Romance",
            page_count: 45,
            format: 'pdf',
            file_size: "2.3 MB"
          },
          benefits: [
            "Exclusive content not available anywhere else",
            "Get a taste of the author's writing style",
            "Learn about the world before the main story",
            "Free forever - no strings attached"
          ],
          testimonials: [
            {
              name: "Sarah M.",
              text: "This chapter was absolutely magical! I couldn't put it down and immediately bought the full book.",
              rating: 5
            },
            {
              name: "Michael R.",
              text: "Elena's writing is so immersive. This free chapter convinced me to read her entire series.",
              rating: 5
            },
            {
              name: "Jessica L.",
              text: "I love getting free chapters from my favorite authors. This one was perfect!",
              rating: 4
            }
          ],
          download_count: 1247,
          created_at: "2024-01-15",
          is_active: true
        }
        setMagnet(mockMagnet)
      } catch (err) {
        setError('Failed to load reader magnet')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMagnet()
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Call the download API
      const response = await fetch('/api/reader-magnets/downloads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reader_magnet_id: magnet?.id || "1",
          email,
          name,
          ip_address: '127.0.0.1' // In production, get from request
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process download')
      }

      const data = await response.json()
      setIsSubmitted(true)
      setDownloadUrl(data.download_url || "https://example.com/download/oceans-echo-chapter.pdf")
    } catch (err) {
      setError('Failed to submit form')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading your free gift...</span>
        </div>
      </div>
    )
  }

  if (error || !magnet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Reader Magnet Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "This free download doesn't exist or has been removed."}
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              <BookOpen className="h-6 w-6" />
              <span className="font-semibold">BookSweeps</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Download className="h-4 w-4" />
              <span>{magnet.download_count.toLocaleString()} downloads</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Book Info */}
          <div className="space-y-8">
            {/* Book Cover and Title */}
            <div className="text-center lg:text-left">
              <div className="inline-block mb-6">
                <Image
                  src={magnet.book.cover_url}
                  alt={magnet.book.title}
                  width={200}
                  height={300}
                  className="rounded-lg shadow-2xl"
                />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {magnet.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                {magnet.subtitle}
              </p>
              <Badge variant="secondary" className="text-sm">
                {magnet.book.genre}
              </Badge>
            </div>

            {/* Description */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {magnet.description}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                What you'll get:
              </h3>
              <div className="space-y-3">
                {magnet.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Author Info */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <Image
                  src={magnet.author.avatar_url}
                  alt={magnet.author.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {magnet.author.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {magnet.author.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Download Form */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              {isSubmitted ? (
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Download Ready!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your free {magnet.book.format.toUpperCase()} is ready to download.
                  </p>
                  <div className="space-y-4">
                    <Button
                      onClick={() => window.open(downloadUrl, '_blank')}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      size="lg"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Now
                    </Button>
                    <p className="text-xs text-gray-500">
                      You'll also receive updates about new releases and exclusive content.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Download className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Get Your Free Copy
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Enter your email to download this exclusive content instantly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || !email || !name}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2" />
                          Get Free Download
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Lock className="h-3 w-3" />
                      <span>We respect your privacy. Unsubscribe anytime.</span>
                    </div>
                  </form>

                  {/* File Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Format:</span>
                      <span className="font-medium">{magnet.book.format.toUpperCase()}</span>
                    </div>
                    {magnet.book.file_size && (
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>File Size:</span>
                        <span className="font-medium">{magnet.book.file_size}</span>
                      </div>
                    )}
                    {magnet.book.page_count && (
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Pages:</span>
                        <span className="font-medium">{magnet.book.page_count}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Testimonials */}
            <div className="mt-8 space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                What readers are saying:
              </h4>
              <div className="space-y-4">
                {magnet.testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      "{testimonial.text}"
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      — {testimonial.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Social Sharing */}
        <div className="mt-12 text-center">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Love this free content? Share it!
          </h4>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Heart className="h-4 w-4" />
              Follow Author
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
