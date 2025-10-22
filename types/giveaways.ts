// Import and re-export consolidated types from main types file
import type {
  GiveawayBook,
  GiveawayAuthor,
  Giveaway,
  ApiCampaign,
  GiveawayFilters
} from './index'

export type {
  GiveawayBook,
  GiveawayAuthor,
  Giveaway,
  ApiCampaign,
  GiveawayFilters
}

export interface GiveawaySortOptions {
  featured: string
  ending_soon: string
  most_entries: string
  newest: string
}

export interface GiveawayCardProps {
  giveaway: Giveaway
  onEnter: (id: string) => void
  isMobileView: boolean
}

export interface GiveawayListProps {
  giveaways: Giveaway[]
  onEnter: (id: string) => void
  isMobileView: boolean
}

export interface GiveawayFiltersProps {
  filters: GiveawayFilters
  onFiltersChange: (updates: Partial<GiveawayFilters>) => void
  onResetFilters: () => void
  isMobileView: boolean
  sortBy: string
  onSortChange: (sortBy: string) => void
}

export interface GiveawayEntryFormProps {
  giveaway: Giveaway
  onSubmit: (email: string) => Promise<void>
  isSubmitting: boolean
  isSubmitted: boolean
}

export interface GiveawayStatsProps {
  giveaway: Giveaway
  isMobileView: boolean
}
