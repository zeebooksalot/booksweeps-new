// Comprehensive input validation and sanitization library
// Security-focused validation for authentication and user data

import { ValidationError, SecurityError } from './error-handler'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  sanitized?: string
}

export interface PasswordValidationResult extends ValidationResult {
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  score: number // 0-100
}

// Common validation patterns
const PATTERNS = {
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  DISPLAY_NAME: /^[a-zA-Z0-9\s\-_\.]{2,50}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,20}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIMEZONE: /^[A-Za-z_]+\/[A-Za-z_]+$/
}

// Common passwords to prevent (top 1000)
const COMMON_PASSWORDS = new Set([
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

// XSS patterns to detect
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
  /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi
]

// SQL injection patterns to detect (more specific to avoid false positives)
const SQL_INJECTION_PATTERNS = [
  /(\b(union\s+select|select\s+.*\s+from|insert\s+into|update\s+.*\s+set|delete\s+from|drop\s+table|create\s+table|alter\s+table|exec\s+.*|execute\s+.*)\b)/gi,
  /(\b(or|and)\b\s+\d+\s*=\s*\d+)/gi,
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
  /(--|\/\*|\*\/)/g, // Removed semicolon to avoid false positives
  /(\bxp_cmdshell\b|\bsp_executesql\b)/gi
]

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /%2e%2e%2f/gi,
  /%2e%2e%5c/gi,
  /\.\.%2f/gi,
  /\.\.%5c/gi
]

/**
 * Sanitize input by removing potentially dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/"/g, '&quot;') // Escape quotes
    .replace(/'/g, '&#x27;') // Escape single quotes
    .replace(/\//g, '&#x2F;') // Escape forward slash
}

/**
 * Validate and sanitize email address
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []
  
  if (!email || typeof email !== 'string') {
    errors.push('Email is required')
    return { valid: false, errors }
  }
  
  // For email, only trim and lowercase - don't escape characters
  const sanitized = email.trim().toLowerCase()
  
  if (sanitized.length === 0) {
    errors.push('Email is required')
    return { valid: false, errors }
  }
  
  if (sanitized.length > 254) {
    errors.push('Email must be 254 characters or less')
    return { valid: false, errors }
  }
  
  if (!PATTERNS.EMAIL.test(sanitized)) {
    errors.push('Please enter a valid email address')
    return { valid: false, errors }
  }
  
  // Check for suspicious patterns
  if (XSS_PATTERNS.some(pattern => pattern.test(sanitized))) {
    errors.push('Email contains invalid characters')
    return { valid: false, errors }
  }
  
  return {
    valid: true,
    errors: [],
    sanitized
  }
}

/**
 * Validate and sanitize password with strength assessment
 */
export function validatePassword(password: string, email?: string): PasswordValidationResult {
  const errors: string[] = []
  let score = 0
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required')
    return { valid: false, errors, strength: 'weak', score: 0 }
  }
  
  // For password, only trim - don't sanitize/escape characters
  const sanitized = password.trim()
  
  if (sanitized.length === 0) {
    errors.push('Password is required')
    return { valid: false, errors, strength: 'weak', score: 0 }
  }
  
  // Length requirements
  if (sanitized.length < 8) {
    errors.push('Password must be at least 8 characters long')
  } else if (sanitized.length >= 12) {
    score += 20
  } else {
    score += 10
  }
  
  // Character requirements
  if (!/[A-Z]/.test(sanitized)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    score += 10
  }
  
  if (!/[a-z]/.test(sanitized)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    score += 10
  }
  
  if (!/\d/.test(sanitized)) {
    errors.push('Password must contain at least one number')
  } else {
    score += 10
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(sanitized)) {
    errors.push('Password must contain at least one special character')
  } else {
    score += 15
  }
  
  // Check for common passwords
  if (COMMON_PASSWORDS.has(sanitized.toLowerCase())) {
    errors.push('Password is too common. Please choose a more unique password')
    score -= 30
  }
  
  // Check for user information in password
  if (email) {
    const emailParts = email.split('@')[0].toLowerCase()
    if (sanitized.toLowerCase().includes(emailParts)) {
      errors.push('Password should not contain your email address')
      score -= 20
    }
  }
  
  // Check for sequential characters
  if (/(.)\1{2,}/.test(sanitized)) {
    errors.push('Password should not contain repeated characters')
    score -= 10
  }
  
  // Check for keyboard patterns
  const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', '123456', 'abcdef']
  if (keyboardPatterns.some(pattern => sanitized.toLowerCase().includes(pattern))) {
    errors.push('Password should not contain keyboard patterns')
    score -= 15
  }
  
  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak'
  if (score >= 80) strength = 'very-strong'
  else if (score >= 60) strength = 'strong'
  else if (score >= 40) strength = 'medium'
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized, // Add this line to include the sanitized password
    strength,
    score: Math.max(0, Math.min(100, score))
  }
}

/**
 * Validate and sanitize display name
 */
export function validateDisplayName(name: string): ValidationResult {
  const errors: string[] = []
  
  if (!name || typeof name !== 'string') {
    errors.push('Display name is required')
    return { valid: false, errors }
  }
  
  const sanitized = sanitizeInput(name)
  
  if (sanitized.length === 0) {
    errors.push('Display name is required')
    return { valid: false, errors }
  }
  
  if (sanitized.length < 2) {
    errors.push('Display name must be at least 2 characters long')
    return { valid: false, errors }
  }
  
  if (sanitized.length > 50) {
    errors.push('Display name must be 50 characters or less')
    return { valid: false, errors }
  }
  
  if (!PATTERNS.DISPLAY_NAME.test(sanitized)) {
    errors.push('Display name contains invalid characters')
    return { valid: false, errors }
  }
  
  // Check for suspicious patterns
  if (XSS_PATTERNS.some(pattern => pattern.test(sanitized))) {
    errors.push('Display name contains invalid characters')
    return { valid: false, errors }
  }
  
  return {
    valid: true,
    errors: [],
    sanitized
  }
}

/**
 * Validate and sanitize URL
 */
export function validateUrl(url: string): ValidationResult {
  const errors: string[] = []
  
  if (!url || typeof url !== 'string') {
    errors.push('URL is required')
    return { valid: false, errors }
  }
  
  const sanitized = url.trim()
  
  if (sanitized.length === 0) {
    errors.push('URL is required')
    return { valid: false, errors }
  }
  
  // More permissive URL validation
  const urlPattern = /^https?:\/\/[^\s]+$/
  if (!urlPattern.test(sanitized)) {
    errors.push('Please enter a valid URL')
    return { valid: false, errors }
  }
  
  // Check for suspicious patterns
  if (XSS_PATTERNS.some(pattern => pattern.test(sanitized))) {
    errors.push('URL contains invalid characters')
    return { valid: false, errors }
  }
  
  return {
    valid: true,
    errors: [],
    sanitized
  }
}

/**
 * Validate and sanitize text input (general purpose)
 */
export function validateText(text: string, options: {
  minLength?: number
  maxLength?: number
  required?: boolean
  allowHtml?: boolean
} = {}): ValidationResult {
  const { minLength = 0, maxLength = 1000, required = true, allowHtml = false } = options
  const errors: string[] = []
  
  if (!text || typeof text !== 'string') {
    if (required) {
      errors.push('Text is required')
    }
    return { valid: !required, errors }
  }
  
  const sanitized = allowHtml ? text.trim() : sanitizeInput(text)
  
  if (sanitized.length === 0) {
    if (required) {
      errors.push('Text is required')
    }
    return { valid: !required, errors }
  }
  
  if (minLength > 0 && sanitized.length < minLength) {
    errors.push(`Text must be at least ${minLength} characters long`)
    return { valid: false, errors }
  }
  
  if (maxLength > 0 && sanitized.length > maxLength) {
    errors.push(`Text must be ${maxLength} characters or less`)
    return { valid: false, errors }
  }
  
  // Check for suspicious patterns if HTML is not allowed
  if (!allowHtml) {
    if (XSS_PATTERNS.some(pattern => pattern.test(sanitized))) {
      errors.push('Text contains invalid characters')
      return { valid: false, errors }
    }
    
    if (SQL_INJECTION_PATTERNS.some(pattern => pattern.test(sanitized))) {
      errors.push('Text contains invalid characters')
      return { valid: false, errors }
    }
    
    if (PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(sanitized))) {
      errors.push('Text contains invalid characters')
      return { valid: false, errors }
    }
  }
  
  return {
    valid: true,
    errors: [],
    sanitized
  }
}

/**
 * Validate form data object
 */
export function validateFormData(data: Record<string, any>, schema: Record<string, any>): {
  valid: boolean
  errors: Record<string, string[]>
  sanitized: Record<string, any>
} {
  const errors: Record<string, string[]> = {}
  const sanitized: Record<string, any> = {}
  let isValid = true
  
  for (const [field, value] of Object.entries(data)) {
    const fieldSchema = schema[field]
    if (!fieldSchema) continue
    
    let result: ValidationResult
    
    switch (fieldSchema.type) {
      case 'email':
        result = validateEmail(value)
        break
      case 'password':
        result = validatePassword(value, data.email)
        break
      case 'displayName':
        result = validateDisplayName(value)
        break
      case 'url':
        result = validateUrl(value)
        break
      case 'text':
        result = validateText(value, fieldSchema.options)
        break
      default:
        result = { valid: true, errors: [], sanitized: value }
    }
    
    if (!result.valid) {
      errors[field] = result.errors
      isValid = false
    } else {
      sanitized[field] = result.sanitized
    }
  }
  
  return { valid: isValid, errors, sanitized }
}

/**
 * Check if input contains potentially malicious content
 * @param input - The input string to check
 * @param isPassword - Whether this is a password field (allows more special characters)
 */
export function detectMaliciousInput(input: string, isPassword: boolean = false): {
  malicious: boolean
  threats: string[]
} {
  const threats: string[] = []
  
  if (!input || typeof input !== 'string') {
    return { malicious: false, threats }
  }
  
  // Check for XSS patterns
  if (XSS_PATTERNS.some(pattern => pattern.test(input))) {
    threats.push('XSS')
  }
  
  // Check for SQL injection patterns
  if (SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input))) {
    threats.push('SQL_INJECTION')
  }
  
  // Check for path traversal patterns
  if (PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(input))) {
    threats.push('PATH_TRAVERSAL')
  }
  
  // Check for command injection patterns - more specific detection
  if (!isPassword) {
    const commandInjectionPatterns = [
      /(\b(cat|ls|pwd|whoami|id|uname|ps|top|kill|rm|cp|mv|chmod|chown)\b)/gi,
      /(\b(echo|printf|grep|sed|awk|find|grep|wget|curl|nc|telnet|ssh|scp)\b)/gi,
      /(\b(exec|system|eval|shell_exec|passthru|proc_open|popen)\b)/gi,
      /(\b(powershell|cmd|bat|vbs|js|jscript)\b)/gi
    ]
    
    if (commandInjectionPatterns.some(pattern => pattern.test(input))) {
      threats.push('COMMAND_INJECTION')
    }
  }
  
  return {
    malicious: threats.length > 0,
    threats
  }
}

/**
 * Get password strength indicator text
 */
export function getPasswordStrengthText(strength: 'weak' | 'medium' | 'strong' | 'very-strong'): string {
  switch (strength) {
    case 'very-strong':
      return 'Very Strong'
    case 'strong':
      return 'Strong'
    case 'medium':
      return 'Medium'
    case 'weak':
      return 'Weak'
    default:
      return 'Unknown'
  }
}

/**
 * Get password strength color for UI
 */
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong' | 'very-strong'): string {
  switch (strength) {
    case 'very-strong':
      return 'text-green-600'
    case 'strong':
      return 'text-blue-600'
    case 'medium':
      return 'text-yellow-600'
    case 'weak':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

// Backward compatibility exports
export { ValidationError, SecurityError } from './error-handler'

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate user agent string
 */
export function validateUserAgent(userAgent: string | null): boolean {
  if (!userAgent) {
    return false // Require user agent
  }
  
  // Block common bot user agents
  const blockedUserAgents = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python',
    'java',
    'perl',
    'ruby',
    'php',
    'go-http-client',
    'okhttp',
    'axios',
    'requests',
  ]
  
  const lowerUserAgent = userAgent.toLowerCase()
  return !blockedUserAgents.some(blocked => lowerUserAgent.includes(blocked))
}

/**
 * Validate request origin
 */
export function validateRequestOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  // Allow requests without origin/referer (direct API calls)
  if (!origin && !referer) {
    return true
  }
  
  // Validate origin if present
  if (origin) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://booksweeps.com',
      'https://www.booksweeps.com',
      // Add other allowed domains
    ]
    
    if (!allowedOrigins.includes(origin)) {
      return false
    }
  }
  
  return true
}

/**
 * Validate download request
 */
export function validateDownloadRequest(body: unknown): {
  delivery_method_id: string
  email: string
  name?: string
} {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Invalid request format')
  }
  
  const data = body as Record<string, unknown>
  
  // Validate delivery_method_id
  if (!data.delivery_method_id || typeof data.delivery_method_id !== 'string') {
    throw new ValidationError('Delivery method ID is required')
  }
  
  if (!isValidUUID(data.delivery_method_id)) {
    throw new ValidationError('Invalid delivery method ID format')
  }
  
  // Validate email
  if (!data.email || typeof data.email !== 'string') {
    throw new ValidationError('Email is required')
  }
  
  const emailValidation = validateEmail(data.email)
  if (!emailValidation.valid) {
    throw new ValidationError(emailValidation.errors[0])
  }
  
  // Validate name (optional)
  let name: string | undefined
  if (data.name) {
    if (typeof data.name !== 'string') {
      throw new ValidationError('Name must be a string')
    }
    
    const nameValidation = validateDisplayName(data.name)
    if (!nameValidation.valid) {
      throw new ValidationError(nameValidation.errors[0])
    }
    
    name = nameValidation.sanitized
  }
  
  return {
    delivery_method_id: data.delivery_method_id,
    email: emailValidation.sanitized!,
    name
  }
}
