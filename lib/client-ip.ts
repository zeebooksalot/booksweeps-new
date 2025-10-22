import { headers } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Unified IP detection utility that handles both server-side and client-side scenarios
 * Supports various proxy/CDN configurations (Netlify, Cloudflare, Vercel, etc.)
 */

export interface IPDetectionResult {
  ip: string
  source: 'x-forwarded-for' | 'x-real-ip' | 'cf-connecting-ip' | 'fallback'
  isLocalhost: boolean
}

/**
 * Get client IP from NextRequest object (for API routes and middleware)
 * @param request - NextRequest object
 * @returns IPDetectionResult with IP and metadata
 */
export function getClientIPFromRequest(request: NextRequest): IPDetectionResult {
  // Check for forwarded headers (common with proxies/CDNs)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ip = forwarded.split(',')[0].trim()
    return {
      ip,
      source: 'x-forwarded-for',
      isLocalhost: ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')
    }
  }
  
  // Check for real IP header
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return {
      ip: realIP,
      source: 'x-real-ip',
      isLocalhost: realIP === '127.0.0.1' || realIP === '::1' || realIP.startsWith('192.168.') || realIP.startsWith('10.')
    }
  }
  
  // Check for CF-Connecting-IP (Cloudflare)
  const cfIP = request.headers.get('cf-connecting-ip')
  if (cfIP) {
    return {
      ip: cfIP,
      source: 'cf-connecting-ip',
      isLocalhost: cfIP === '127.0.0.1' || cfIP === '::1' || cfIP.startsWith('192.168.') || cfIP.startsWith('10.')
    }
  }
  
  // Fallback
  return {
    ip: 'unknown',
    source: 'fallback',
    isLocalhost: false
  }
}

/**
 * Get client IP from Next.js headers (for server components)
 * @returns Promise<IPDetectionResult> with IP and metadata
 */
export async function getClientIPFromHeaders(): Promise<IPDetectionResult> {
  try {
    const headersList = await headers()
    
    // Check various headers for IP address (in order of preference)
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIP = headersList.get('x-real-ip')
    const cfConnectingIP = headersList.get('cf-connecting-ip')
    
    if (forwardedFor) {
      const ip = forwardedFor.split(',')[0].trim()
      return {
        ip,
        source: 'x-forwarded-for',
        isLocalhost: ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')
      }
    }
    
    if (realIP) {
      return {
        ip: realIP,
        source: 'x-real-ip',
        isLocalhost: realIP === '127.0.0.1' || realIP === '::1' || realIP.startsWith('192.168.') || realIP.startsWith('10.')
      }
    }
    
    if (cfConnectingIP) {
      return {
        ip: cfConnectingIP,
        source: 'cf-connecting-ip',
        isLocalhost: cfConnectingIP === '127.0.0.1' || cfConnectingIP === '::1' || cfConnectingIP.startsWith('192.168.') || cfConnectingIP.startsWith('10.')
      }
    }
    
    // Fallback to localhost for development
    return {
      ip: '127.0.0.1',
      source: 'fallback',
      isLocalhost: true
    }
  } catch (error) {
    console.warn('Could not determine client IP:', error)
    return {
      ip: '127.0.0.1',
      source: 'fallback',
      isLocalhost: true
    }
  }
}

/**
 * Simple IP getter for backward compatibility
 * @param request - NextRequest object
 * @returns string IP address
 */
export function getClientIP(request: NextRequest): string {
  return getClientIPFromRequest(request).ip
}

/**
 * Simple async IP getter for backward compatibility
 * @returns Promise<string> IP address
 */
export async function getClientIPAsync(): Promise<string> {
  const result = await getClientIPFromHeaders()
  return result.ip
}

/**
 * Test function to verify IP address detection
 * This can be used for debugging and testing
 */
export function testIPDetection(): IPDetectionResult {
  // Mock request headers for testing
  const mockHeaders = new Map([
    ['x-forwarded-for', '192.168.1.100, 10.0.0.1'],
    ['x-real-ip', '203.0.113.1'],
    ['cf-connecting-ip', '198.51.100.1'],
    ['user-agent', 'Mozilla/5.0 (Test Browser)']
  ])

  // Create a mock request object
  const mockRequest = {
    headers: {
      get: (name: string) => mockHeaders.get(name) || null
    }
  } as NextRequest

  const result = getClientIPFromRequest(mockRequest)
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Test IP Detection:', {
      'x-forwarded-for': mockHeaders.get('x-forwarded-for'),
      'x-real-ip': mockHeaders.get('x-real-ip'),
      'cf-connecting-ip': mockHeaders.get('cf-connecting-ip'),
      'detected-ip': result.ip,
      'source': result.source,
      'is-localhost': result.isLocalhost
    })
  }

  return result
}