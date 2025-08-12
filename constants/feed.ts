// Feed display configuration
export const FEED_CONFIG = {
  swipeThreshold: 100,
  animationDuration: 300,
  voteAnimationDuration: 1000,
  maxGenresDisplay: 2,
  maxDescriptionLines: 3,
  maxTitleLines: 2,
} as const

// Feed item display constants
export const FEED_DISPLAY = {
  imageSizes: {
    book: { width: 80, height: 100 },
    author: { width: 80, height: 80 },
    bookDesktop: { width: 64, height: 80 },
    authorDesktop: { width: 64, height: 64 },
  },
  badgeSizes: {
    mobile: { width: 40, height: 40 },
    desktop: { width: 32, height: 32 },
  },
  actionButtonSizes: {
    width: 48,
    height: 48,
  },
} as const

// Status colors for different states
export const FEED_STATUS_COLORS = {
  swipeRight: 'bg-green-500',
  swipeLeft: 'bg-red-500',
  vote: 'bg-orange-500',
  giveaway: 'bg-gradient-to-r from-purple-600 to-pink-600',
} as const

// Text content
export const FEED_TEXT = {
  swipeIndicators: {
    vote: '👍 Vote',
    skip: '👎 Skip',
  },
  giveaway: {
    active: '🎁 Giveaway Active',
    enter: 'Enter Now',
    enterDesktop: '🎁 Enter Giveaway',
  },
  stats: {
    books: 'books',
    followers: 'followers',
    votes: 'votes',
    comments: 'comments',
    published: 'Published',
    joined: 'Joined',
  },
} as const
