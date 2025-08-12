"use client"

import { Button } from "@/components/ui/button"
import { FilterState } from "@/types"
import { TAB_OPTIONS } from "@/constants"

interface FilterTabsProps {
  filters: FilterState
  onFiltersChange: (updates: Partial<FilterState>) => void
  isMobileView?: boolean
  filterButton?: React.ReactNode
}

export function FilterTabs({ 
  filters, 
  onFiltersChange, 
  isMobileView = false,
  filterButton
}: FilterTabsProps) {
  const handleTabChange = (tab: string) => {
    onFiltersChange({ activeTab: tab })
  }

  const getTabButtonClass = (isActive: boolean) => {
    return isActive 
      ? "bg-orange-500 hover:bg-orange-600" 
      : "border-gray-200 dark:border-gray-700 bg-transparent"
  }

  const tabs = [
    { key: TAB_OPTIONS.all, label: "All" },
    { key: TAB_OPTIONS.books, label: "Books" },
    { key: TAB_OPTIONS.authors, label: "Authors" },
    { key: TAB_OPTIONS.giveaways, label: isMobileView ? "🎁 Giveaways" : "Giveaways" }
  ]

  if (isMobileView) {
    return (
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={filters.activeTab === tab.key ? "default" : "outline"}
              size="sm"
              onClick={() => handleTabChange(tab.key)}
              className={`${getTabButtonClass(filters.activeTab === tab.key)} whitespace-nowrap`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mx-4">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={filters.activeTab === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => handleTabChange(tab.key)}
            className={getTabButtonClass(filters.activeTab === tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      {filterButton && (
        <div className="flex items-center gap-2">
          {filterButton}
        </div>
      )}
    </div>
  )
}
