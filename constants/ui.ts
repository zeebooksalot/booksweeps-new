// UI configuration constants
export const UI_CONFIG = {
  debounceDelay: 300,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
  desktopBreakpoint: 1280,
  maxSearchLength: 100,
  maxDescriptionLength: 200
} as const

// Date formatting options
export const DATE_FORMAT_OPTIONS = {
  short: { month: 'short', year: 'numeric' } as const,
  long: { year: 'numeric', month: 'long', day: 'numeric' } as const,
  timeAgo: { numeric: 'auto', compactDisplay: 'short' } as const
} as const

// Placeholder images
export const PLACEHOLDER_IMAGES = {
  book: "/placeholder.svg?height=80&width=64",
  author: "/placeholder.svg?height=64&width=64",
  user: "/placeholder-user.jpg",
  logo: "/placeholder-logo.svg"
} as const

// Animation and transition constants
export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
  }
} as const

// Type definitions for UI constants
export type UiConfig = typeof UI_CONFIG
export type DateFormatOptions = typeof DATE_FORMAT_OPTIONS
export type PlaceholderImages = typeof PLACEHOLDER_IMAGES
export type AnimationConfig = typeof ANIMATION_CONFIG
