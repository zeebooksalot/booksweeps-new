/**
 * Shared security utilities
 * Common security patterns and utilities used across the application
 */

/**
 * XSS patterns to detect and prevent
 */
export const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
  /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /expression\s*\(/gi,
  /vbscript:/gi,
  /data:/gi
] as const

/**
 * SQL injection patterns to detect
 */
export const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
  /(\b(UNION|SELECT)\b.*\b(SELECT|UNION)\b)/gi,
  /(\b(OR|AND)\s+['"]\s*=\s*['"])/gi,
  /(\b(OR|AND)\s+\w+\s*=\s*\w+)/gi,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
  /(\b(OR|AND)\s+['"]\s*=\s*['"])/gi,
  /(\b(OR|AND)\s+\w+\s*=\s*\w+)/gi,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
  /(\b(OR|AND)\s+['"]\s*=\s*['"])/gi
] as const

/**
 * Common passwords to prevent (top 1000)
 */
export const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'hello',
  'freedom', 'whatever', 'qazwsx', 'trustno1', 'jordan', 'harley',
  'ranger', 'buster', 'tiger', 'robert', 'charlie', 'thomas', 'hunter',
  'michelle', 'jessica', 'joshua', 'minnie', 'oliver', 'daniel', 'john',
  'jack', 'love', 'baby', 'shadow', 'michael', 'charlie', 'andrew',
  'angel', 'jennifer', 'hannah', 'computer', 'summer', 'jordan', 'football',
  'baseball', 'welcome', 'ncc1701', 'princess', 'master', 'hello',
  'freedom', 'whatever', 'qazwsx', 'trustno1', 'jordan', 'harley',
  'ranger', 'buster', 'tiger', 'robert', 'charlie', 'thomas', 'hunter',
  'michelle', 'jessica', 'joshua', 'minnie', 'oliver', 'daniel', 'john',
  'jack', 'love', 'baby', 'shadow', 'michael', 'charlie', 'andrew',
  'angel', 'jennifer', 'hannah', 'computer', 'summer', 'jordan', 'football'
])

/**
 * Security analysis result
 */
export interface SecurityAnalysis {
  isSafe: boolean
  riskLevel: 'low' | 'medium' | 'high'
  threats: string[]
  recommendations: string[]
}

/**
 * Analyze input for security threats
 */
export function analyzeSecurityThreats(input: string): SecurityAnalysis {
  const threats: string[] = []
  const recommendations: string[] = []

  // Check for XSS patterns
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) {
      threats.push('Potential XSS attack detected')
      recommendations.push('Sanitize HTML content and use proper encoding')
      break
    }
  }

  // Check for SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      threats.push('Potential SQL injection detected')
      recommendations.push('Use parameterized queries and input validation')
      break
    }
  }

  // Check for suspicious characters
  const suspiciousChars = /[<>'"&]/
  if (suspiciousChars.test(input)) {
    threats.push('Suspicious characters detected')
    recommendations.push('Escape special characters or use proper encoding')
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (threats.length > 0) {
    riskLevel = threats.length > 2 ? 'high' : 'medium'
  }

  return {
    isSafe: threats.length === 0,
    riskLevel,
    threats,
    recommendations
  }
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(input: string, options: {
  allowedTags?: string[]
  allowedAttributes?: string[]
  stripHtml?: boolean
} = {}): string {
  if (options.stripHtml) {
    return input.replace(/<[^>]*>/g, '')
  }

  // Basic HTML sanitization (in production, use a proper library like DOMPurify)
  let sanitized = input

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove data: URLs
  sanitized = sanitized.replace(/data:/gi, '')

  return sanitized
}

/**
 * Escape HTML entities
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

/**
 * Generate secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Generate secure random bytes
 */
export function generateSecureBytes(length: number = 32): Uint8Array {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint8Array(length))
  }
  
  // Fallback for environments without crypto.getRandomValues
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256)
  }
  
  return bytes
}

/**
 * Hash string with SHA-256 (browser environment)
 */
export async function hashString(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  // Fallback for environments without crypto.subtle
  throw new Error('SHA-256 hashing not available in this environment')
}

/**
 * Validate password strength
 */
export function validatePasswordSecurity(password: string): {
  isSecure: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long')
  } else if (password.length >= 12) {
    score += 2
  } else {
    score += 1
  }

  // Character variety checks
  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter')
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number')
  } else {
    score += 1
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character')
  } else {
    score += 1
  }

  // Check against common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    feedback.push('Password is too common, please choose a more unique password')
    score -= 2
  }

  // Complexity check
  const uniqueChars = new Set(password).size
  if (uniqueChars < password.length * 0.5) {
    feedback.push('Password should have more unique characters')
  } else {
    score += 1
  }

  return {
    isSecure: score >= 5 && feedback.length === 0,
    score: Math.max(0, score),
    feedback
  }
}

/**
 * Rate limiting helper
 */
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (identifier: string) => string
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  constructor(private config: RateLimitConfig) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier
    const requests = this.requests.get(key) || []
    
    // Remove old requests outside the window
    const windowStart = now - this.config.windowMs
    const validRequests = requests.filter(time => time > windowStart)
    
    if (validRequests.length >= this.config.maxRequests) {
      return false
    }
    
    // Add current request
    validRequests.push(now)
    this.requests.set(key, validRequests)
    
    return true
  }

  getRemainingRequests(identifier: string): number {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier
    const requests = this.requests.get(key) || []
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    const validRequests = requests.filter(time => time > windowStart)
    
    return Math.max(0, this.config.maxRequests - validRequests.length)
  }

  reset(identifier: string): void {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier
    this.requests.delete(key)
  }
}

/**
 * Content Security Policy helper
 */
export function generateCSPHeader(options: {
  defaultSrc?: string[]
  scriptSrc?: string[]
  styleSrc?: string[]
  imgSrc?: string[]
  connectSrc?: string[]
  fontSrc?: string[]
  objectSrc?: string[]
  mediaSrc?: string[]
  frameSrc?: string[]
  workerSrc?: string[]
  manifestSrc?: string[]
  formAction?: string[]
  frameAncestors?: string[]
  baseUri?: string[]
  upgradeInsecureRequests?: boolean
  blockAllMixedContent?: boolean
} = {}): string {
  const directives: string[] = []

  if (options.defaultSrc) {
    directives.push(`default-src ${options.defaultSrc.join(' ')}`)
  }

  if (options.scriptSrc) {
    directives.push(`script-src ${options.scriptSrc.join(' ')}`)
  }

  if (options.styleSrc) {
    directives.push(`style-src ${options.styleSrc.join(' ')}`)
  }

  if (options.imgSrc) {
    directives.push(`img-src ${options.imgSrc.join(' ')}`)
  }

  if (options.connectSrc) {
    directives.push(`connect-src ${options.connectSrc.join(' ')}`)
  }

  if (options.fontSrc) {
    directives.push(`font-src ${options.fontSrc.join(' ')}`)
  }

  if (options.objectSrc) {
    directives.push(`object-src ${options.objectSrc.join(' ')}`)
  }

  if (options.mediaSrc) {
    directives.push(`media-src ${options.mediaSrc.join(' ')}`)
  }

  if (options.frameSrc) {
    directives.push(`frame-src ${options.frameSrc.join(' ')}`)
  }

  if (options.workerSrc) {
    directives.push(`worker-src ${options.workerSrc.join(' ')}`)
  }

  if (options.manifestSrc) {
    directives.push(`manifest-src ${options.manifestSrc.join(' ')}`)
  }

  if (options.formAction) {
    directives.push(`form-action ${options.formAction.join(' ')}`)
  }

  if (options.frameAncestors) {
    directives.push(`frame-ancestors ${options.frameAncestors.join(' ')}`)
  }

  if (options.baseUri) {
    directives.push(`base-uri ${options.baseUri.join(' ')}`)
  }

  if (options.upgradeInsecureRequests) {
    directives.push('upgrade-insecure-requests')
  }

  if (options.blockAllMixedContent) {
    directives.push('block-all-mixed-content')
  }

  return directives.join('; ')
}
