"use client"

import { Suspense, useState } from 'react'
import { Header } from '@/components/Header/index'
import { GiveawayContent } from '@/components/giveaways/GiveawayContent'
import { GiveawayLoadingState } from '@/components/giveaways/GiveawayLoadingState'
import { GIVEAWAY_STYLES } from '@/constants/giveaways'

export default function GiveawaysPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className={GIVEAWAY_STYLES.container}>
      {/* Header */}
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <Suspense fallback={<GiveawayLoadingState />}>
        <GiveawayContent searchQuery={searchQuery} />
      </Suspense>
    </div>
  )
}
