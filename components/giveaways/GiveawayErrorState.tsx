"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { GIVEAWAY_STYLES } from "@/constants/giveaways"

interface GiveawayErrorStateProps {
  error?: string | null
}

export function GiveawayErrorState({ error }: GiveawayErrorStateProps) {
  return (
    <div className={GIVEAWAY_STYLES.loadingState}>
      <div className="flex items-center justify-center min-h-screen">
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
    </div>
  )
}
