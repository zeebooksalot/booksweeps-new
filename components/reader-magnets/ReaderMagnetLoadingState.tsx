"use client"

import { READER_MAGNET_TEXT, READER_MAGNET_STYLES } from "@/constants/reader-magnets"

export function ReaderMagnetLoadingState() {
  return (
    <div className={READER_MAGNET_STYLES.loadingState}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{READER_MAGNET_TEXT.loading}</p>
        </div>
      </div>
    </div>
  )
}
