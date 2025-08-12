"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Gift, CheckCircle } from "lucide-react"
import { GiveawayEntryFormProps } from "@/types/giveaways"
import { GIVEAWAY_TEXT } from "@/constants/giveaways"
import { GiveawayStats } from "./GiveawayStats"

export function GiveawayEntryForm({ 
  giveaway, 
  onSubmit, 
  isSubmitting, 
  isSubmitted 
}: GiveawayEntryFormProps) {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(email)
  }

  if (isSubmitted) {
    return (
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Entry Submitted!
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You&apos;ve successfully entered this giveaway. We&apos;ll notify you if you win!
        </p>
        <Link href="/giveaways">
          <Button className="w-full">Browse More Giveaways</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {GIVEAWAY_TEXT.entry.title}
      </h3>

      {/* Stats */}
      <GiveawayStats giveaway={giveaway} />

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
            {GIVEAWAY_TEXT.entry.email}
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
          {isSubmitting ? GIVEAWAY_TEXT.entry.submitting : GIVEAWAY_TEXT.entry.submit}
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
  )
}
