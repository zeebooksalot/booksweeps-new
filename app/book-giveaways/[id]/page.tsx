"use client"

import { useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Header } from '@/components/header/index'
import { useGiveaway } from '@/hooks/useGiveaway'
import { GiveawayTitleCard } from '@/components/giveaways/GiveawayTitleCard'
import { GiveawayEntryForm } from '@/components/giveaways/GiveawayEntryForm'
import { GiveawayAuthorSection } from '@/components/giveaways/GiveawayAuthorSection'
import { GiveawayLiveSidebar } from '@/components/giveaways/GiveawayLiveSidebar'
import { GiveawayActiveGiveaways } from '@/components/giveaways/GiveawayActiveGiveaways'
import { GiveawaySingleRulesModal } from '@/components/giveaways/GiveawaySingleRulesModal'
import { GiveawaySingleError } from '@/components/giveaways/GiveawaySingleError'
import { GiveawaySingleLoading } from '@/components/giveaways/GiveawaySingleLoading'
import { useRouter } from 'next/navigation'

interface GiveawayEntryPageProps {
  params: Promise<{ id: string }>
}

export default function GiveawayEntryPage({ params }: GiveawayEntryPageProps) {
  const [showRulesModal, setShowRulesModal] = useState(false)
  const router = useRouter()
  const {
    giveaway,
    isLoading,
    error,
    isMobileView,
    isSubmitting,
    isSubmitted,
    handleSubmit,
    isExpired,
    id
  } = useGiveaway({ params })

  // Show loading while data is loading
  if (isLoading) {
    return <GiveawaySingleLoading />
  }

  if (error || !giveaway) {
    return <GiveawaySingleError error={error} />
  }

  // If giveaway is expired, redirect to expired page
  if (isExpired) {
    router.push(`/book-giveaways/${giveaway.id}/expired`)
    return null
  }

  const endDate = new Date(giveaway.end_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Header 
          searchQuery=""
          onSearchChange={() => {}}
        />

        <main className="max-w-[980px] mx-auto px-10 pt-28 pb-12">
          {/* Main Content - Title, Giveaway Entry and Author (70% width) */}
          <div className="grid lg:grid-cols-10 gap-12 items-start">
            <div className="lg:col-span-7">
              <div className="space-y-0">
                <GiveawayTitleCard giveaway={giveaway} />
                <GiveawayEntryForm 
                  onShowRules={() => setShowRulesModal(true)} 
                  endDate={endDate}
                  onSubmit={handleSubmit}
                />
              </div>
              <div className="mt-8">
                <GiveawayAuthorSection author={giveaway.author} />
              </div>
            </div>

            {/* Sidebar - Book Info (30% width) */}
            <div className="lg:col-span-3 lg:-mt-0">
              <GiveawayLiveSidebar 
                author={giveaway.author}
                book={giveaway.book}
              />
            </div>
          </div>

          <div className="mt-16">
            <GiveawayActiveGiveaways />
          </div>
        </main>

        <GiveawaySingleRulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
      </div>
    </TooltipProvider>
  )
}
