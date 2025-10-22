"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface GiveawayHeaderProps {
  title: string
}

export function GiveawaySingleHeader({ title }: GiveawayHeaderProps) {
  return (
    <div className="mb-6">
      <Link 
        href="/book-giveaways" 
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Giveaways
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h1>
    </div>
  )
}
