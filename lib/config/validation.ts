// Validation configuration
export const VALIDATION_CONFIG = {
  // Email validation
  emailMaxLength: 255,
  emailRegex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  // Name validation
  nameMaxLength: 100,
  nameRegex: /^[a-zA-Z\s\-'\.]+$/,
  
  // UUID validation
  uuidRegex: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Token validation
  tokenMinLength: 10,
  tokenMaxLength: 255,
} as const

// Type exports
export type ValidationConfig = typeof VALIDATION_CONFIG
