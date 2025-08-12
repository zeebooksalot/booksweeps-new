"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Download, 
  Heart, 
  BookOpen, 
  Settings,
  Filter,
  Search
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { DASHBOARD_TABS } from "@/constants/dashboard"
import { DashboardTab } from "@/types/dashboard"

interface DashboardTabsProps {
  activeTab: string
  onTabChange: (tab: DashboardTab) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  showSearch?: boolean
  showFilters?: boolean
  onFiltersClick?: () => void
  itemCounts?: {
    downloads?: number
    favorites?: number
    readingList?: number
  }
}

export function DashboardTabs({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  showSearch = true,
  showFilters = true,
  onFiltersClick,
  itemCounts = {}
}: DashboardTabsProps) {
  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case 'overview': return Home
      case 'downloads': return Download
      case 'favorites': return Heart
      case 'reading-list': return BookOpen
      case 'settings': return Settings
      default: return Home
    }
  }

  const getTabCount = (tabId: string) => {
    switch (tabId) {
      case 'downloads': return itemCounts.downloads
      case 'favorites': return itemCounts.favorites
      case 'reading-list': return itemCounts.readingList
      default: return undefined
    }
  }

  return (
    <div className="mb-6">
      {/* Search and Filters Row */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search your dashboard..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          {showFilters && onFiltersClick && (
            <Button variant="outline" onClick={onFiltersClick}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.values(DASHBOARD_TABS).map((tab) => {
          const Icon = getTabIcon(tab.id)
          const count = getTabCount(tab.id)
          const isActive = activeTab === tab.id
          
          return (
            <Button
              key={tab.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onTabChange(tab.id as DashboardTab)}
              className={`flex items-center gap-2 ${
                isActive 
                  ? "bg-orange-500 hover:bg-orange-600 text-white" 
                  : "border-gray-200 dark:border-gray-700 bg-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {count !== undefined && count > 0 && (
                <Badge 
                  variant="secondary" 
                  className={`ml-1 ${
                    isActive 
                      ? "bg-white/20 text-white" 
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {count}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
