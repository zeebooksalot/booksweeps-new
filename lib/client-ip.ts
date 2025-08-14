import { headers } from 'next/headers'

export async function getClientIP(): Promise<string> {
  try {
    const headersList = await headers()
    
    // Check various headers for IP address (in order of preference)
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIP = headersList.get('x-real-ip')
    const cfConnectingIP = headersList.get('cf-connecting-ip')
    
    if (forwardedFor) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return forwardedFor.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    if (cfConnectingIP) {
      return cfConnectingIP
    }
    
    // Fallback to localhost for development
    return '127.0.0.1'
  } catch (error) {
    console.warn('Could not determine client IP:', error)
    return '127.0.0.1'
  }
}
