import { headers } from 'next/headers'

export async function getReferringURL(): Promise<string | undefined> {
  try {
    const headersList = await headers()
    
    // Check various headers for referring URL
    const referer = headersList.get('referer')
    const referrer = headersList.get('referrer')
    
    if (referer) {
      return referer
    }
    
    if (referrer) {
      return referrer
    }
    
    return undefined
  } catch (error) {
    console.warn('Could not determine referring URL:', error)
    return undefined
  }
}
