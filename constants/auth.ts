// Auth-related constants and configuration

import { UserSettings } from '@/types/auth'

// Default user settings
export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'auto',
  font: 'Inter',
  sidebar_collapsed: false,
  keyboard_shortcuts_enabled: true,
  email_notifications: true,
  marketing_emails: true,
  weekly_reports: false,
  language: 'en',
  timezone: 'UTC',
  usage_analytics: true,
  auto_save_drafts: true,
}

// Default reading preferences
export const DEFAULT_READING_PREFERENCES = {
  email_notifications: true,
  marketing_emails: true,
  giveaway_reminders: true,
  weekly_reports: false,
  theme: 'auto' as const,
  language: 'en',
  timezone: 'UTC',
}

// User type options
export const USER_TYPE_OPTIONS = [
  { value: 'reader', label: 'Reader' },
  { value: 'author', label: 'Author' },
  { value: 'both', label: 'Both' },
] as const

// Theme options
export const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' },
] as const

// Font options
export const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
] as const

// Language options
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
] as const

// Timezone options
export const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
] as const

// Genre options for favorite genres
export const GENRE_OPTIONS = [
  'Romance',
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Thriller',
  'Historical Fiction',
  'Contemporary Fiction',
  'Young Adult',
  'Non-Fiction',
  'Biography',
  'Self-Help',
  'Business',
] as const

// Auth configuration
export const AUTH_CONFIG = {
  // Session timeout (in minutes)
  sessionTimeout: 60 * 24 * 7, // 7 days
  
  // Password requirements
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: false,
  
  // Email verification
  requireEmailVerification: true,
  
  // Rate limiting
  maxLoginAttempts: 5,
  lockoutDuration: 15, // minutes
} as const

// Error messages
export const AUTH_ERROR_MESSAGES = {
  emailNotVerified: 'Please verify your email address before signing in.',
  invalidCredentials: 'Invalid email or password.',
  emailAlreadyExists: 'An account with this email already exists.',
  weakPassword: 'Password must be at least 8 characters long.',
  networkError: 'Network error. Please check your connection.',
  unknownError: 'An unexpected error occurred. Please try again.',
} as const

// Shared timing constants for consistency across auth and dashboard
export const AUTH_TIMING = {
  LOGIN_TIMEOUT: 10000, // 10 seconds - matches dashboard profile loading timeout
  ERROR_AUTO_CLEAR: 30000, // 30 seconds - matches dashboard error clearing
  HEALTH_CHECK_CACHE: 5 * 60 * 1000, // 5 minutes - matches dashboard health check cache
  SESSION_ESTABLISHMENT_TIMEOUT: 15000, // 15 seconds for session establishment
} as const
