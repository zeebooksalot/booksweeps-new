// Auth utility functions for consistent error handling and validation

export interface AuthError {
  message: string
  code?: string
  context?: string
}

/**
 * Consistent error handling for auth operations
 */
export function handleAuthError(error: unknown, context: string): AuthError {
  console.error(`Error in ${context}:`, error)
  
  if (error instanceof Error) {
    return {
      message: error.message,
      context,
    }
  }
  
  if (typeof error === 'string') {
    return {
      message: error,
      context,
    }
  }
  
  return {
    message: `An unexpected error occurred in ${context}`,
    context,
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate user profile data
 */
export function validateUserProfile(data: {
  display_name?: string
  first_name?: string
  last_name?: string
  favorite_genres?: string[]
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.display_name?.trim()) {
    errors.push('Display name is required')
  }
  
  if (data.favorite_genres && data.favorite_genres.length === 0) {
    errors.push('Please select at least one favorite genre')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate user settings data
 */
export function validateUserSettings(data: {
  language?: string
  timezone?: string
  theme?: string
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.language?.trim()) {
    errors.push('Language is required')
  }
  
  if (!data.timezone?.trim()) {
    errors.push('Timezone is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: AuthError | string): string {
  if (typeof error === 'string') {
    return error
  }
  
  return error.message
}

/**
 * Check if user has required permissions
 */
export function hasPermission(userType: string, requiredPermission: string): boolean {
  const permissions = {
    reader: ['read_books', 'vote_books', 'enter_giveaways'],
    author: ['read_books', 'vote_books', 'enter_giveaways', 'create_giveaways', 'manage_books'],
    both: ['read_books', 'vote_books', 'enter_giveaways', 'create_giveaways', 'manage_books'],
  }
  
  return permissions[userType as keyof typeof permissions]?.includes(requiredPermission) || false
}
