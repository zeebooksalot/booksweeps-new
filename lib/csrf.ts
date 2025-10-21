import { createHash, randomBytes } from 'crypto'
import { NextRequest } from 'next/server'

export interface CsrfConfig {
  secret: string
  tokenLength: number
  tokenExpiry: number // in milliseconds
  cookieName: string
  headerName: string
  sameSite: 'strict' | 'lax' | 'none'
  secure: boolean
}

export interface CsrfToken {
  token: string
  expiresAt: number
}

const DEFAULT_CONFIG: CsrfConfig = {
  secret: process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  tokenLength: 32,
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production'
}

// In-memory store for CSRF tokens (in production, use Redis or database)
const csrfTokenStore = new Map<string, { token: string; expires: number }>()

class CsrfProtection {
  private config: CsrfConfig
  private tokenStore = new Map<string, { token: string; expires: number }>()
  
  constructor(config: Partial<CsrfConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    // Clean up expired tokens every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000)
  }
  
  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.tokenStore.entries()) {
      if (entry.expires < now) {
        this.tokenStore.delete(key)
      }
    }
  }
  
  private createToken(): string {
    return randomBytes(this.config.tokenLength).toString('hex')
  }
  
  private createHmac(token: string, sessionId: string): string {
    const hmac = createHash('sha256')
    hmac.update(token + sessionId + this.config.secret)
    return hmac.digest('hex')
  }
  
  private getSessionId(request: NextRequest): string {
    // Try to get session ID from various sources
    const sessionCookie = request.cookies.get('session-id')
    if (sessionCookie) {
      return sessionCookie.value
    }
    
    // Fallback to IP + User-Agent hash
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    return createHash('sha256')
      .update(ip + userAgent)
      .digest('hex')
      .substring(0, 16)
  }
  
  generateToken(request: NextRequest): { token: string; cookie: string } {
    const sessionId = this.getSessionId(request)
    const token = this.createToken()
    const hmac = this.createHmac(token, sessionId)
    const fullToken = `${token}.${hmac}`
    
    // Store token with expiry
    this.tokenStore.set(sessionId, {
      token: fullToken,
      expires: Date.now() + this.config.tokenExpiry
    })
    
    // Create cookie
    const cookie = `${this.config.cookieName}=${fullToken}; HttpOnly; SameSite=${this.config.sameSite}; Path=/; Max-Age=${Math.floor(this.config.tokenExpiry / 1000)}${this.config.secure ? '; Secure' : ''}`
    
    return { token: fullToken, cookie }
  }
  
  validateToken(request: NextRequest): { valid: boolean; reason?: string } {
    const sessionId = this.getSessionId(request)
    
    // Get token from header or cookie
    const headerToken = request.headers.get(this.config.headerName)
    const cookieToken = request.cookies.get(this.config.cookieName)?.value
    
    const token = headerToken || cookieToken
    
    if (!token) {
      return { valid: false, reason: 'No CSRF token provided' }
    }
    
    // Check if token exists in store
    const stored = this.tokenStore.get(sessionId)
    if (!stored) {
      return { valid: false, reason: 'No valid session found' }
    }
    
    if (stored.expires < Date.now()) {
      this.tokenStore.delete(sessionId)
      return { valid: false, reason: 'CSRF token expired' }
    }
    
    // Validate token format
    const [tokenPart, hmacPart] = token.split('.')
    if (!tokenPart || !hmacPart) {
      return { valid: false, reason: 'Invalid token format' }
    }
    
    // Validate HMAC
    const expectedHmac = this.createHmac(tokenPart, sessionId)
    if (hmacPart !== expectedHmac) {
      return { valid: false, reason: 'Invalid token signature' }
    }
    
    // Check if token matches stored token
    if (stored.token !== token) {
      return { valid: false, reason: 'Token mismatch' }
    }
    
    return { valid: true }
  }
  
  // Middleware function for API routes
  withCsrfProtection(handler: (req: NextRequest) => Promise<Response>) {
    return async (request: NextRequest): Promise<Response> => {
      // Skip CSRF for GET requests and safe methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        return await handler(request)
      }
      
      // Validate CSRF token
      const validation = this.validateToken(request)
      if (!validation.valid) {
        return new Response(
          JSON.stringify({
            error: 'CSRF validation failed',
            message: validation.reason
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      }
      
      return await handler(request)
    }
  }
  
  // Get current token for a request
  getCurrentToken(request: NextRequest): string | null {
    const sessionId = this.getSessionId(request)
    const stored = this.tokenStore.get(sessionId)
    
    if (stored && stored.expires > Date.now()) {
      return stored.token
    }
    
    return null
  }
  
  // Invalidate token for a session
  invalidateToken(request: NextRequest): void {
    const sessionId = this.getSessionId(request)
    this.tokenStore.delete(sessionId)
  }
  
  // Get statistics
  getStats(): { activeTokens: number; totalTokens: number } {
    const now = Date.now()
    const activeTokens = Array.from(this.tokenStore.values())
      .filter(entry => entry.expires > now).length
    
    return {
      activeTokens,
      totalTokens: this.tokenStore.size
    }
  }
}

// Create CSRF protection instance
export const csrfProtection = new CsrfProtection({
  secret: process.env.CSRF_SECRET,
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
  secure: process.env.NODE_ENV === 'production'
})

// Legacy functions for backward compatibility
export function generateCsrfToken(userId: string): string {
  const token = randomBytes(32).toString('hex')
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  
  csrfTokenStore.set(userId, {
    token,
    expires: expiresAt
  })
  
  return token
}

export function validateCsrfToken(token: string | null, userId: string | null): boolean {
  if (!token || !userId) {
    return false
  }
  
  const storedToken = csrfTokenStore.get(userId)
  if (!storedToken) {
    return false
  }
  
  // Check if token has expired
  if (Date.now() > storedToken.expires) {
    csrfTokenStore.delete(userId)
    return false
  }
  
  // Compare tokens using constant-time comparison
  return constantTimeCompare(token, storedToken.token)
}

export function validateCsrfFromRequest(request: Request, userId: string | null): boolean {
  const csrfToken = request.headers.get('X-CSRF-Token')
  return validateCsrfToken(csrfToken, userId)
}

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

export function cleanupExpiredTokens(): void {
  const now = Date.now()
  for (const [userId, token] of csrfTokenStore.entries()) {
    if (now > token.expires) {
      csrfTokenStore.delete(userId)
    }
  }
}

export function removeCsrfToken(userId: string): void {
  csrfTokenStore.delete(userId)
}

export function getCsrfToken(userId: string): CsrfToken | undefined {
  const stored = csrfTokenStore.get(userId)
  if (stored) {
    return {
      token: stored.token,
      expiresAt: stored.expires
    }
  }
  return undefined
}

// Helper function to generate CSRF token for API routes
export function generateCsrfTokenForRequest(request: NextRequest): { token: string; cookie: string } {
  return csrfProtection.generateToken(request)
}

// Helper function to validate CSRF token
export function validateCsrfTokenForRequest(request: NextRequest): { valid: boolean; reason?: string } {
  return csrfProtection.validateToken(request)
}

// Middleware wrapper for API routes
export function withCsrfProtection(handler: (req: NextRequest) => Promise<Response>) {
  return csrfProtection.withCsrfProtection(handler)
}

// CSRF token endpoint
export async function handleCsrfTokenRequest(request: NextRequest): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }
  
  const { token, cookie } = generateCsrfTokenForRequest(request)
  
  return new Response(
    JSON.stringify({ token }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie
      }
    }
  )
}

// Clean up expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000)
