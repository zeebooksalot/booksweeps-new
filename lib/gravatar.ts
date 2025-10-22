import crypto from 'crypto'

/**
 * Generate a Gravatar URL for an email address
 * @param email - The email address
 * @param size - The size of the avatar (default: 200)
 * @param defaultImage - The default image type (default: 'identicon')
 * @returns The Gravatar URL
 */
export function getGravatarUrl(
  email: string, 
  size: number = 200, 
  defaultImage: 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'blank' = 'identicon'
): string {
  // Trim and convert to lowercase
  const trimmedEmail = email.trim().toLowerCase()
  
  // Create MD5 hash
  const hash = crypto.createHash('md5').update(trimmedEmail).digest('hex')
  
  // Build Gravatar URL
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`
}

/**
 * Generate initials from a name or email
 * @param name - The name or email
 * @returns The initials (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return 'U'
  
  // If it's an email, extract the name part
  if (name.includes('@')) {
    const namePart = name.split('@')[0]
    return namePart.substring(0, 2).toUpperCase()
  }
  
  // If it has spaces, use first letter of first and last word
  if (name.includes(' ')) {
    const words = name.split(' ').filter(word => word.length > 0)
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase()
    }
    return words[0].substring(0, 2).toUpperCase()
  }
  
  // Single word - use first two characters
  return name.substring(0, 2).toUpperCase()
}

/**
 * Generate a color-based fallback avatar
 * @param name - The name to generate color from
 * @returns CSS classes for background color
 */
export function getColorFallback(name: string): string {
  if (!name) return 'bg-gray-500'
  
  // Simple hash function to generate consistent colors
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Convert to positive number and get color index
  const colorIndex = Math.abs(hash) % 8
  
  const colors = [
    'bg-red-500',      // Red
    'bg-blue-500',     // Blue  
    'bg-green-500',    // Green
    'bg-yellow-500',   // Yellow
    'bg-purple-500',   // Purple
    'bg-pink-500',     // Pink
    'bg-indigo-500',   // Indigo
    'bg-teal-500',     // Teal
  ]
  
  return colors[colorIndex]
}
