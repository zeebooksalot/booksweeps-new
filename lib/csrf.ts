// Use Web Crypto API for Edge Runtime compatibility
function generateRandomBytes(length: number): string {
  const array = new Uint8Array(length)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for environments without Web Crypto API
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export interface CsrfToken {
  token: string
  expiresAt: number
}

// In-memory store for CSRF tokens (in production, use Redis or database)
// TODO: For production, consider using Redis or database storage for better scalability
// and persistence across server restarts
const csrfTokenStore = new Map<string, CsrfToken>()

/**
 * Generate a CSRF token for a user session
 */
export function generateCsrfToken(userId: string): string {
  const token = generateRandomBytes(32)
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  
  csrfTokenStore.set(userId, {
    token,
    expiresAt
  })
  
  return token
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(token: string | null, userId: string | null): boolean {
  if (!token || !userId) {
    return false
  }
  
  const storedToken = csrfTokenStore.get(userId)
  if (!storedToken) {
    return false
  }
  
  // Check if token has expired
  if (Date.now() > storedToken.expiresAt) {
    csrfTokenStore.delete(userId)
    return false
  }
  
  // Compare tokens using constant-time comparison
  return constantTimeCompare(token, storedToken.token)
}

/**
 * Validate CSRF token from request headers
 */
export function validateCsrfFromRequest(request: Request, userId: string | null): boolean {
  const csrfToken = request.headers.get('X-CSRF-Token')
  return validateCsrfToken(csrfToken, userId)
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Clean up expired CSRF tokens
 */
export function cleanupExpiredTokens(): void {
  const now = Date.now()
  for (const [userId, token] of csrfTokenStore.entries()) {
    if (now > token.expiresAt) {
      csrfTokenStore.delete(userId)
    }
  }
}

/**
 * Remove a CSRF token (e.g., on logout)
 */
export function removeCsrfToken(userId: string): void {
  csrfTokenStore.delete(userId)
}

/**
 * Get CSRF token for a user (for testing/debugging)
 */
export function getCsrfToken(userId: string): CsrfToken | undefined {
  return csrfTokenStore.get(userId)
}

// Clean up expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000)
