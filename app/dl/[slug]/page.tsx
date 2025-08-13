"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCsrf } from "@/hooks/useCsrf"
import { 
  Download,
  BookOpen,
  Star,
  CheckCircle,
  Heart,
  Share2,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { Header } from "@/components/Header/index"

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

// Data mapping from book_delivery_methods table:
// - id: delivery_method.id
// - title: delivery_method.title
// - description: delivery_method.description
// - format: delivery_method.format
// - author: books.author + pen_names.bio
// - book: books.* (title, cover_image_url, genre, page_count)
// - download_count: calculated from reader_deliveries table

export default function ReaderMagnetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { fetchWithCsrf } = useCsrf()
  const [magnet, setMagnet] = useState<ReaderMagnet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState("")
  const [slug, setSlug] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileView, setIsMobileView] = useState(false)

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }
    initParams()
  }, [params])

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    
    checkMobileView()
    window.addEventListener('resize', checkMobileView)
    return () => window.removeEventListener('resize', checkMobileView)
  }, [])

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
              subtitle: apiMagnet.description || "", // Use description as subtitle
              description: apiMagnet.description || "",
              author: {
                name: apiMagnet.pen_names?.name || apiMagnet.books?.author || "Unknown Author",
                bio: apiMagnet.pen_names?.bio || "Author bio not available",
                avatar_url: apiMagnet.pen_names?.avatar_url || "/placeholder.svg?height=64&width=64",
                website: apiMagnet.pen_names?.website
              },
              book: {
                title: apiMagnet.books?.title || "Unknown Book",
                cover_url: apiMagnet.books?.cover_image_url || "/placeholder.svg?height=300&width=200",
                genre: apiMagnet.books?.genre || "General",
                page_count: apiMagnet.books?.page_count,
                format: apiMagnet.format || 'pdf'
              },
              benefits: [
                "Exclusive content not available anywhere else",
                "Get a taste of the author's writing style",
                "Learn about the world before the main story",
                "Free forever - no strings attached"
              ], // Default benefits since not stored in DB
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
              ], // Default testimonials since not stored in DB
              download_count: apiMagnet.download_count || 0,
              created_at: apiMagnet.created_at,
              is_active: apiMagnet.is_active
            }
            
            setMagnet(mappedMagnet)
            return
          }
        }

        // If API fails, show error instead of fallback data
        setError('Reader magnet not found or unavailable')
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
      // Call the download API with CSRF protection
      const response = await fetchWithCsrf('/api/reader-magnets/downloads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          delivery_method_id: magnet?.id,
          email,
          name
          // Remove ip_address - server will get it from request headers
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to process download')
      }

      const data = await response.json()
      setIsSubmitted(true)
      setDownloadUrl(data.download_url || null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit form'
      setError(errorMessage)
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
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-0 py-10 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left Column - Book Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Book Cover and Title */}
            <div className="text-center">
              <div className="inline-block mb-6">
                <Image
                  src={magnet.book.cover_url}
                  alt={magnet.book.title}
                  width={200}
                  height={300}
                  className="rounded-lg shadow-2xl"
                />
              </div>
              <div className="mb-4">
                <Badge variant="secondary" className="text-sm">
                  {magnet.book.genre}
                </Badge>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {magnet.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                {magnet.subtitle}
              </p>
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
                What you&apos;ll get:
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

            {/* Testimonials */}
            <div className="mt-8 space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                What readers are saying:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {magnet.testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      — {testimonial.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Download Form */}
          <div className="lg:col-span-1 lg:sticky lg:top-8">
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
                    {downloadUrl ? (
                      <>
                        <Button
                          onClick={() => window.open(downloadUrl, '_blank')}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          size="lg"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Download Now
                        </Button>
                        <p className="text-xs text-gray-500">
                          You&apos;ll also receive updates about new releases and exclusive content.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Your download is being prepared. Please check your email for the download link.
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          If you don&apos;t receive the email within a few minutes, please check your spam folder.
                        </p>
                      </>
                    )}
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

                  {error && (
                    <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {error}
                      </p>
                    </div>
                  )}

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
                      <span>We respect your privacy. Your email is never shared without your permission.</span>
                    </div>
                  </form>


                </>
              )}
            </div>

            {/* Social Sharing */}
            <div className="mt-8 text-center">
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
      </div>
    </div>
  )
}
