// Configuration for author data caching and performance
export const AUTHOR_CONFIG = {
  // Cache settings for client-side caching
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  REVALIDATE_DURATION: 3600, // 1 hour
  
  // Rate limiting settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};
