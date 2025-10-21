// API configuration constants
export const API_CONFIG = {
  defaultLimit: 10,
  maxLimit: 100,
  defaultPage: 1,
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 10000
} as const

// API endpoint paths
export const API_ENDPOINTS = {
  authors: '/api/authors',
  books: '/api/books',
  giveaways: '/api/giveaways',
  campaigns: '/api/campaigns',
  comments: '/api/comments',
  entries: '/api/entries',
  votes: '/api/votes',
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    trackLogin: '/api/auth/track-login',
    upgradeUserType: '/api/auth/upgrade-user-type'
  },
  csrf: {
    generate: '/api/csrf/generate'
  }
} as const

// API response status codes
export const API_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500
} as const

// Type definitions for API constants
export type ApiConfig = typeof API_CONFIG
export type ApiEndpoints = typeof API_ENDPOINTS
export type ApiStatusCode = typeof API_STATUS_CODES[keyof typeof API_STATUS_CODES]
