"use client"

import { useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Header } from '@/components/header/index'
import { useGiveaway } from '@/hooks/useGiveaway'
import { GiveawaySingleRelated } from '@/components/giveaways/GiveawaySingleRelated'
import { GiveawaySingleBook } from '@/components/giveaways/GiveawaySingleBook'
import { GiveawaySingleAuthor } from '@/components/giveaways/GiveawaySingleAuthor'
import { GiveawaySingleSidebar } from '@/components/giveaways/GiveawaySingleSidebar'
import { GiveawaySingleRulesModal } from '@/components/giveaways/GiveawaySingleRulesModal'
import { GiveawaySingleError } from '@/components/giveaways/GiveawaySingleError'
import { GiveawaySingleLoading } from '@/components/giveaways/GiveawaySingleLoading'

interface GiveawayEntryPageProps {
  params: Promise<{ id: string }>
}

export default function GiveawayEntryPage({ params }: GiveawayEntryPageProps) {
  const [showRulesModal, setShowRulesModal] = useState(false)
  const {
    giveaway,
    isLoading,
    error,
    isMobileView,
    isSubmitting,
    isSubmitted,
    handleSubmit
  } = useGiveaway({ params })

  if (isLoading) {
    return <GiveawaySingleLoading />
  }

  if (error || !giveaway) {
    return <GiveawaySingleError error={error} />
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Header 
          searchQuery=""
          onSearchChange={() => {}}
        />

        <main className="max-w-5xl mx-auto px-4 py-8 pt-24">
          <GiveawaySingleRelated />

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <GiveawaySingleBook giveaway={giveaway} />
              <GiveawaySingleAuthor author={giveaway.author} />
            </div>

            {/* Sidebar */}
            <div className="flex flex-col items-start">
              <GiveawaySingleSidebar 
                onShowRules={() => setShowRulesModal(true)} 
                giveaway={giveaway}
              />
            </div>
          </div>
        </main>

        <GiveawaySingleRulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
      </div>
    </TooltipProvider>
  )
}
