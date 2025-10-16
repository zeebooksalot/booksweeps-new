"use client"



export function GiveawaySingleLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
        <span className="text-gray-600 dark:text-gray-400">Loading giveaway...</span>
      </div>
    </div>
  )
}
