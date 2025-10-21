import { 
  SHARED_GENRES, 
  SHARED_DATE_RANGES, 
  SHARED_SORT_OPTIONS, 
  SHARED_RATING_OPTIONS, 
  SHARED_PRIZE_TYPES, 
  SHARED_STATUS_OPTIONS,
  SHARED_TAB_OPTIONS
} from './shared'

// Filter options using shared constants
export const FILTER_OPTIONS = {
  genres: SHARED_GENRES,
  dateRanges: Object.values(SHARED_DATE_RANGES),
  sortOptions: Object.keys(SHARED_SORT_OPTIONS),
  ratingOptions: SHARED_RATING_OPTIONS,
  prizeTypes: Object.values(SHARED_PRIZE_TYPES),
  statusOptions: Object.values(SHARED_STATUS_OPTIONS)
} as const

// Tab options using shared constants
export const TAB_OPTIONS = SHARED_TAB_OPTIONS

// Sort options using shared constants  
export const SORT_OPTIONS = SHARED_SORT_OPTIONS

// Date range options using shared constants
export const DATE_RANGE_OPTIONS = SHARED_DATE_RANGES

// Default filter states
export const DEFAULT_FILTER_STATE = {
  activeTab: TAB_OPTIONS.all,
  searchQuery: "",
  sortBy: SORT_OPTIONS.trending,
  selectedGenres: [] as string[],
  dateRange: DATE_RANGE_OPTIONS.all,
  ratingFilter: 0,
  hasGiveaway: null,
  showAdvancedFilters: false
} as const

// Advanced filter options
export const ADVANCED_FILTER_OPTIONS = {
  hasGiveaway: [true, false, null] as const,
  ratingRange: [1, 2, 3, 4, 5] as const,
  dateRange: Object.values(SHARED_DATE_RANGES),
  endingSoon: false,
  status: 'all' as const,
  prizeType: 'all' as const
} as const

// Type definitions for filter constants
export type FilterOptions = typeof FILTER_OPTIONS
export type TabOptions = typeof TAB_OPTIONS
export type SortOptions = typeof SORT_OPTIONS
export type DateRangeOptions = typeof DATE_RANGE_OPTIONS
export type DefaultFilterState = typeof DEFAULT_FILTER_STATE
export type AdvancedFilterOptions = typeof ADVANCED_FILTER_OPTIONS
