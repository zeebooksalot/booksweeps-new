// Shared constants to eliminate duplication across files

// Common genres used across the application
export const SHARED_GENRES = [
  "Fantasy",
  "Romance", 
  "Mystery",
  "Sci-Fi",
  "Thriller",
  "Historical",
  "Contemporary",
  "Post-Apocalyptic",
  "Dystopian"
] as const

// Common sort options used across the application
export const SHARED_SORT_OPTIONS = {
  trending: "trending",
  newest: "newest", 
  votes: "votes",
  rating: "rating",
  featured: "featured",
  ending_soon: "ending_soon",
  most_entries: "most_entries"
} as const

// Common status options used across the application
export const SHARED_STATUS_OPTIONS = {
  all: "all",
  active: "active",
  ending_soon: "ending_soon"
} as const

// Common prize types used across the application
export const SHARED_PRIZE_TYPES = {
  all: "all",
  signed: "signed",
  digital: "digital", 
  physical: "physical"
} as const

// Common date range options
export const SHARED_DATE_RANGES = {
  all: "all",
  week: "week",
  month: "month",
  year: "year"
} as const

// Common rating options
export const SHARED_RATING_OPTIONS = [1, 2, 3, 4, 5] as const

// Common tab options
export const SHARED_TAB_OPTIONS = {
  all: "all",
  books: "books",
  authors: "authors", 
  giveaways: "giveaways"
} as const

// Type definitions for shared constants
export type SharedGenre = typeof SHARED_GENRES[number]
export type SharedSortOption = keyof typeof SHARED_SORT_OPTIONS
export type SharedStatusOption = keyof typeof SHARED_STATUS_OPTIONS
export type SharedPrizeType = keyof typeof SHARED_PRIZE_TYPES
export type SharedDateRange = keyof typeof SHARED_DATE_RANGES
export type SharedRating = typeof SHARED_RATING_OPTIONS[number]
export type SharedTabOption = keyof typeof SHARED_TAB_OPTIONS
