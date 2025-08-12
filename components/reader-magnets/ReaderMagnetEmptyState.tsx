"use client"

import { BookOpen } from "lucide-react"
import { READER_MAGNET_TEXT, READER_MAGNET_STYLES } from "@/constants/reader-magnets"

export function ReaderMagnetEmptyState() {
  return (
    <div className={READER_MAGNET_STYLES.emptyState}>
      <div className="text-center">
        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          {READER_MAGNET_TEXT.noBooksFound.title}
        </h3>
        <p className="text-gray-500">
          {READER_MAGNET_TEXT.noBooksFound.description}
        </p>
      </div>
    </div>
  )
}
