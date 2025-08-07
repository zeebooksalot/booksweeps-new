"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  ArrowLeft,
  Clock,
  Users,
  Gift,
  Mail,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useApi } from "@/hooks/use-api"

export default function GiveawayEntryPage({ params }: { params: { id: string } }) {
  const [giveaway, setGiveaway] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const campaignsApi = useApi<any>()

  useEffect(() => {
    const fetchGiveaway = async () => {
      setIsLoading(true)
      try {
        // For now, use mock data
        const mockGiveaway = {
          id: params.id,
          title: "Win 'Ocean's Echo' - Fantasy Romance",
          description: "Enter to win a signed copy of this magical tale of love and adventure beneath the waves.",
          book: {
            title: "Ocean's Echo",
            author: "Elena Rodriguez",
            cover_image_url: "/placeholder.svg?height=200&width=160",
            genre: "Fantasy",
            description: "A magical tale of love and adventure beneath the waves that explores the depths of human connection and the mysteries of the ocean."
          },
          author: {
            name: "Elena Rodriguez",
            avatar_url: "/placeholder.svg?height=64&width=64",
            bio: "Fantasy romance author who transports readers to magical worlds filled with adventure and love."
          },
          end_date: "2024-12-31",
          entry_count: 156,
          max_entries: 1000,
          number_of_winners: 5,
          prize_description: "Signed copy of Ocean's Echo",
          rules: "Open to US residents 18+. One entry per person. Winners will be selected randomly and notified via email."
        }
        setGiveaway(mockGiveaway)
      } catch (err) {
        setError('Failed to load giveaway')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGiveaway()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (err) {
      setError('Failed to submit entry')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading giveaway...</span>
        </div>
      </div>
    )
  }

  if (error || !giveaway) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Giveaway Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "This giveaway doesn't exist or has been removed."}
          </p>
          <Link href="/giveaways">
            <Button>Back to Giveaways</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/giveaways" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Giveaways
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {giveaway.title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Info */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex gap-6 mb-6">
                <Image
                  src={giveaway.book.cover_image_url}
                  alt={giveaway.book.title}
                  width={160}
                  height={200}
                  className="rounded-lg shadow-lg"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {giveaway.book.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                    by {giveaway.author.name}
                  </p>
                  <Badge variant="secondary" className="mb-4">
                    {giveaway.book.genre}
                  </Badge>
                  <p className="text-gray-600 dark:text-gray-400">
                    {giveaway.book.description}
                  </p>
                </div>
              </div>

              {/* Author Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center gap-4">
                  <Image
                    src={giveaway.author.avatar_url}
                    alt={giveaway.author.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {giveaway.author.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {giveaway.author.bio}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Entry Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
              {isSubmitted ? (
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Entry Submitted!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You've successfully entered this giveaway. We'll notify you if you win!
                  </p>
                  <Link href="/giveaways">
                    <Button className="w-full">Browse More Giveaways</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Enter Giveaway
                  </h3>

                  {/* Stats */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Entries</span>
                      <span className="font-semibold">{giveaway.entry_count}/{giveaway.max_entries}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Winners</span>
                      <span className="font-semibold">{giveaway.number_of_winners}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Ends</span>
                      <span className="font-semibold">
                        {new Date(giveaway.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Prize */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Prize</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {giveaway.prize_description}
                    </p>
                  </div>

                  {/* Entry Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                      disabled={isSubmitting || !email}
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                    >
                      {isSubmitting ? "Submitting..." : "Enter Giveaway"}
                    </Button>
                  </form>

                  {/* Rules */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Rules</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {giveaway.rules}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
