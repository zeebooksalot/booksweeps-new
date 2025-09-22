"use client"

import { Gift, Search, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GIVEAWAY_TEXT, GIVEAWAY_STYLES } from "@/constants/giveaways"

interface GiveawayEmptyStateProps {
  onResetFilters?: () => void
  onClearSearch?: () => void
  hasActiveFilters?: boolean
  searchQuery?: string
}

export function GiveawayEmptyState({ 
  onResetFilters, 
  onClearSearch, 
  hasActiveFilters = false,
  searchQuery = ""
}: GiveawayEmptyStateProps) {
  const handleResetFilters = () => {
    if (onResetFilters) {
      onResetFilters()
    }
  }

  const handleClearSearch = () => {
    if (onClearSearch) {
      onClearSearch()
    }
  }

  return (
    <div className={GIVEAWAY_STYLES.emptyState}>
      <div className="text-center max-w-md mx-auto">
        {/* Enhanced Icon with Animation */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full blur-lg opacity-20 animate-pulse"></div>
          <Gift className="h-20 w-20 text-orange-500 mx-auto relative z-10 animate-bounce" />
        </div>

        {/* Dynamic Title Based on Context */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {searchQuery ? `No giveaways found for "${searchQuery}"` : 
           hasActiveFilters ? "No giveaways match your filters" : 
           GIVEAWAY_TEXT.noGiveaways.title}
        </h3>

        {/* Dynamic Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {searchQuery ? "Try searching with different keywords or browse all giveaways." :
           hasActiveFilters ? "Try adjusting your filters to see more giveaways." :
           "New giveaways are added regularly. Check back soon for exciting opportunities!"}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {hasActiveFilters && onResetFilters && (
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
          
          {searchQuery && onClearSearch && (
            <Button
              onClick={handleClearSearch}
              variant="outline"
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Clear Search
            </Button>
          )}

          <Button
            onClick={() => window.location.reload()}
            className="gap-2 bg-orange-500 hover:bg-orange-600"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>

        {/* Suggestions Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            💡 Suggestions
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>• Check out our <a href="/authors" className="text-orange-500 hover:text-orange-600 underline">featured authors</a></p>
            <p>• Browse <a href="/free-books" className="text-orange-500 hover:text-orange-600 underline">free books</a> while you wait</p>
            <p>• Follow us on social media for giveaway announcements</p>
          </div>
        </div>
      </div>
    </div>
  )
}
