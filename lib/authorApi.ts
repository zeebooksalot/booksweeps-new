import { PublicAuthor } from '@/types/author';
import { AUTHOR_CONFIG } from '@/lib/authorConfig';

// Simple in-memory cache for client-side caching
const cache = new Map<string, { data: PublicAuthor; timestamp: number }>();

export async function getAuthorData(authorId: string): Promise<PublicAuthor> {
  // Check cache first
  const cached = cache.get(authorId);
  if (cached && Date.now() - cached.timestamp < AUTHOR_CONFIG.CACHE_DURATION) {
    return cached.data;
  }

  // Fetch from the local API
  const response = await fetch(`/api/authors/${authorId}`, {
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
  
  // Cache the result
  cache.set(authorId, { data, timestamp: Date.now() });
  
  return data;
}

export async function getAllAuthorIds(): Promise<string[]> {
  // This would need to be implemented on the author platform
  // For now, we'll use fallback generation
  return [];
}

// Clear cache function for development/testing
export function clearAuthorCache(authorId?: string) {
  if (authorId) {
    cache.delete(authorId);
  } else {
    cache.clear();
  }
}
