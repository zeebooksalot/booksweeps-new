// Configuration for author platform integration
export const AUTHOR_CONFIG = {
  // Base URL for the author platform API
  API_BASE_URL: process.env.NEXT_PUBLIC_AUTHOR_API_URL || 
    'https://app.booksweeps.com/functions/v1/public-author',
  
  // Known author IDs - these should be real author IDs from the author platform
  // In production, this could be fetched from a separate endpoint or database
  KNOWN_AUTHOR_IDS: [] as string[],
  
  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  REVALIDATE_DURATION: 3600, // 1 hour
  
  // Rate limiting settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Function to get all author IDs
export function getAllAuthorIds(): string[] {
  return AUTHOR_CONFIG.KNOWN_AUTHOR_IDS;
}

// Function to add a new author ID
export function addAuthorId(authorId: string): void {
  if (!AUTHOR_CONFIG.KNOWN_AUTHOR_IDS.includes(authorId)) {
    AUTHOR_CONFIG.KNOWN_AUTHOR_IDS.push(authorId);
  }
}
