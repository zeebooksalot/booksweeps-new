import { PublicAuthor } from '@/types/author';
import { AUTHOR_CONFIG } from '@/lib/authorConfig';

// Simple in-memory cache for client-side caching
const cache = new Map<string, { data: PublicAuthor; timestamp: number }>();

export async function getAuthorData(authorSlug: string): Promise<PublicAuthor> {
  // Check cache first (only for client-side)
  if (typeof window !== 'undefined') {
    const cached = cache.get(authorSlug);
    if (cached && Date.now() - cached.timestamp < AUTHOR_CONFIG.CACHE_DURATION) {
      return cached.data;
    }
  }

  // Determine the base URL for the API call
  const baseUrl = typeof window !== 'undefined' 
    ? '' // Client-side: use relative URL
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Server-side: use absolute URL

  // Fetch from the local API
  const response = await fetch(`${baseUrl}/api/authors/${authorSlug}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    // Add caching for better performance
    next: { revalidate: AUTHOR_CONFIG.REVALIDATE_DURATION },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Author not found');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw new Error(`Failed to fetch author data: ${response.status}`);
  }

  const result = await response.json();
  const data = result.author; // Extract author from the response
  
  // Cache the result (only for client-side)
  if (typeof window !== 'undefined') {
    cache.set(authorSlug, { data, timestamp: Date.now() });
  }
  
  return data;
}

export async function getAllAuthorSlugs(): Promise<string[]> {
  // This would need to be implemented on the author platform
  // For now, we'll use fallback generation
  return [];
}

// Clear cache function for development/testing
export function clearAuthorCache(authorSlug?: string) {
  if (authorSlug) {
    cache.delete(authorSlug);
  } else {
    cache.clear();
  }
}
