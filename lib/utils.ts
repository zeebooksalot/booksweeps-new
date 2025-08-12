import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextRequest } from "next/server"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get real client IP address from request headers
 * Handles various proxy/CDN scenarios (Netlify, Cloudflare, etc.)
 */
export function getClientIP(req: NextRequest): string {
  // Check for forwarded headers (common with proxies/CDNs like Netlify)
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }
  
  // Check for real IP header
  const realIP = req.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Check for CF-Connecting-IP (Cloudflare)
  const cfIP = req.headers.get('cf-connecting-ip')
  if (cfIP) {
    return cfIP
  }
  
  // Fallback to connection remote address
  return 'unknown'
}

/**
 * Test function to verify IP address detection
 * This can be used for debugging and testing
 */
export function testIPDetection() {
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

  const detectedIP = getClientIP(mockRequest)
  if (process.env.NODE_ENV === 'development') {
    console.log('Test IP Detection:', {
      'x-forwarded-for': mockHeaders.get('x-forwarded-for'),
      'x-real-ip': mockHeaders.get('x-real-ip'),
      'cf-connecting-ip': mockHeaders.get('cf-connecting-ip'),
      'detected-ip': detectedIP
    })
  }

  return detectedIP
}
