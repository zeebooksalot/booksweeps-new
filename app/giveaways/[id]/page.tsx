"use client"

import { Header } from '@/components/Header/index'
import { useGiveaway } from '@/hooks/useGiveaway'
import { GiveawayHeader } from '@/components/giveaways/GiveawayHeader'
import { GiveawayBookInfo } from '@/components/giveaways/GiveawayBookInfo'
import { GiveawayEntryForm } from '@/components/giveaways/GiveawayEntryForm'
import { GiveawayErrorState } from '@/components/giveaways/GiveawayErrorState'
import { GiveawayDetailLoadingState } from '@/components/giveaways/GiveawayDetailLoadingState'
import { GIVEAWAY_STYLES } from '@/constants/giveaways'

interface GiveawayEntryPageProps {
  params: Promise<{ id: string }>
}

export default function GiveawayEntryPage({ params }: GiveawayEntryPageProps) {
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
    return <GiveawayDetailLoadingState />
  }

  if (error || !giveaway) {
    return <GiveawayErrorState error={error} />
  }

  return (
    <div className={GIVEAWAY_STYLES.container}>
      {/* Header */}
      <Header 
        searchQuery=""
        onSearchChange={() => {}}
        isMobileView={isMobileView}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
        <GiveawayHeader title={giveaway.title} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Info */}
          <GiveawayBookInfo giveaway={giveaway} />

          {/* Entry Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
              <GiveawayEntryForm
                giveaway={giveaway}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isSubmitted={isSubmitted}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
