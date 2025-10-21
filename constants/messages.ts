// Error messages
export const ERROR_MESSAGES = {
  fetchFailed: "Failed to fetch data",
  networkError: "Network error occurred",
  serverError: "Server error occurred",
  notFound: "Resource not found",
  unauthorized: "Unauthorized access",
  validationError: "Invalid input provided",
  rateLimitExceeded: "Too many requests. Please try again later.",
  downloadLimitReached: "Download limit reached",
  duplicateDownload: "You have already downloaded this book"
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  downloadSuccess: "Download link generated successfully",
  voteSuccess: "Vote recorded successfully",
  entrySuccess: "Entry submitted successfully",
  profileUpdated: "Profile updated successfully"
} as const

// Loading messages
export const LOADING_MESSAGES = {
  loading: "Loading...",
  loadingAuthors: "Loading authors...",
  loadingBooks: "Loading books...",
  loadingGiveaways: "Loading giveaways...",
  loadingData: "Loading data...",
  processing: "Processing..."
} as const

// Empty state messages
export const EMPTY_STATE_MESSAGES = {
  noAuthors: "No authors found",
  noBooks: "No books found",
  noGiveaways: "No giveaways found",
  noResults: "No results found",
  noData: "No data available"
} as const

// Validation messages
export const VALIDATION_MESSAGES = {
  required: "This field is required",
  emailInvalid: "Please enter a valid email address",
  passwordTooShort: "Password must be at least 8 characters",
  passwordMismatch: "Passwords do not match",
  nameTooShort: "Name must be at least 2 characters",
  descriptionTooLong: "Description is too long"
} as const

// Type definitions for message constants
export type ErrorMessages = typeof ERROR_MESSAGES
export type SuccessMessages = typeof SUCCESS_MESSAGES
export type LoadingMessages = typeof LOADING_MESSAGES
export type EmptyStateMessages = typeof EMPTY_STATE_MESSAGES
export type ValidationMessages = typeof VALIDATION_MESSAGES
