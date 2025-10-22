// Platform configuration
export const config = {
  // Platform URLs
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://staging.booksweeps.com',
  readerUrl: process.env.NEXT_PUBLIC_READER_URL || 'https://read.booksweeps.com',
  authorUrl: process.env.NEXT_PUBLIC_AUTHOR_URL || 'https://app.booksweeps.com',
  
  // Supabase configuration
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const

// Helper functions for platform URLs
export const getPlatformUrls = () => ({
  mainSite: config.siteUrl,
  reader: config.readerUrl,
  author: config.authorUrl,
})

export const getPlatformHosts = () => {
  const urls = getPlatformUrls()
  return {
    mainSite: new URL(urls.mainSite).hostname,
    reader: new URL(urls.reader).hostname,
    author: new URL(urls.author).hostname,
  }
}

export const getCurrentPlatform = (hostname: string) => {
  const hosts = getPlatformHosts()
  
  if (hostname === hosts.mainSite) return 'main'
  if (hostname === hosts.reader) return 'reader'
  if (hostname === hosts.author) return 'author'
  
  return 'unknown'
}

export const shouldRedirectUser = (userType: string, currentHost: string) => {
  const hosts = getPlatformHosts()
  
  // Readers shouldn't be on author platform - redirect them to reader site
  if (userType === 'reader' && currentHost === hosts.author) {
    return { shouldRedirect: true, targetUrl: `${config.readerUrl}/dashboard` }
  }
  
  // Author users on main site - let login page handle choice modal, don't auto-redirect
  if (userType === 'author' && currentHost === hosts.mainSite) {
    return { shouldRedirect: false } // Login page will show choice modal
  }
  
  // Users with both types can access all platforms
  if (userType === 'both') {
    return { shouldRedirect: false }
  }
  
  return { shouldRedirect: false }
}

// Validate environment variables for cross-domain auth
export const validateCrossDomainConfig = () => {
  const errors: string[] = []
  
  // Check required environment variables
  if (!process.env.NEXT_PUBLIC_AUTHOR_URL) {
    errors.push('NEXT_PUBLIC_AUTHOR_URL is not set - author site redirects may not work')
  }
  
  if (!process.env.NEXT_PUBLIC_READER_URL) {
    errors.push('NEXT_PUBLIC_READER_URL is not set - reader site redirects may not work')
  }
  
  // Validate URL formats
  try {
    if (process.env.NEXT_PUBLIC_AUTHOR_URL) {
      new URL(process.env.NEXT_PUBLIC_AUTHOR_URL)
    }
  } catch (error) {
    errors.push('NEXT_PUBLIC_AUTHOR_URL is not a valid URL')
  }
  
  try {
    if (process.env.NEXT_PUBLIC_READER_URL) {
      new URL(process.env.NEXT_PUBLIC_READER_URL)
    }
  } catch (error) {
    errors.push('NEXT_PUBLIC_READER_URL is not a valid URL')
  }
  
  return errors
}

// Type definitions
export type Platform = 'main' | 'reader' | 'author' | 'unknown'
export type UserType = 'reader' | 'author' | 'both'
