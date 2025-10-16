'use client'

import { Suspense, useState } from 'react'
import { Header } from '@/components/header/index'
import { ReaderMagnetContent } from '@/components/reader-magnets/ReaderMagnetContent'
import { ReaderMagnetLoadingState } from '@/components/reader-magnets/ReaderMagnetLoadingState'
import { READER_MAGNET_STYLES } from '@/constants/reader-magnets'

export default function FreeBooksPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className={READER_MAGNET_STYLES.container}>
      {/* Header */}
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <div className={READER_MAGNET_STYLES.mainContent}>
        <div className={READER_MAGNET_STYLES.contentWrapper}>
          <Suspense fallback={<ReaderMagnetLoadingState />}>
            <ReaderMagnetContent searchQuery={searchQuery} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
