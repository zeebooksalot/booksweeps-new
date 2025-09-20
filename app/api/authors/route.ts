import { NextRequest, NextResponse } from 'next/server';
import { PublicAuthor } from '@/types/author';
import { AUTHOR_CONFIG, getAllAuthorIds } from '@/lib/authorConfig';

// Function to fetch all authors from the real API
async function fetchAllAuthors(): Promise<PublicAuthor[]> {
  const knownAuthorIds = getAllAuthorIds();
  
  if (knownAuthorIds.length === 0) {
    throw new Error('No author IDs configured. Please add author IDs to lib/authorConfig.ts');
  }
  
  const authorPromises = knownAuthorIds.map(async (id) => {
    const response = await fetch(`${AUTHOR_CONFIG.API_BASE_URL}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Author ${id} not found`);
        return null;
      }
      throw new Error(`Failed to fetch author ${id}: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  });
  
  const authors = await Promise.all(authorPromises);
  const validAuthors = authors.filter((author): author is PublicAuthor => author !== null);
  
  if (validAuthors.length === 0) {
    throw new Error('No valid authors found. Please check your author IDs and API connectivity.');
  }
  
  return validAuthors;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || '';
    const sortBy = searchParams.get('sortBy') || 'popularity';

    // Fetch authors from real API only
    const authors = await fetchAllAuthors();

    // Filter authors
    let filteredAuthors = authors.filter(author => {
      const matchesSearch = !search || 
        author.name.toLowerCase().includes(search.toLowerCase()) ||
        author.bio?.toLowerCase().includes(search.toLowerCase());
      const matchesGenre = !genre || genre === 'all' || author.genre === genre;
      return matchesSearch && matchesGenre;
    });

    // Sort authors
    filteredAuthors.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'books':
          return b.books.length - a.books.length;
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'popularity':
        default:
          return (b.followers || 0) - (a.followers || 0);
      }
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAuthors = filteredAuthors.slice(startIndex, endIndex);

    const response = {
      authors: paginatedAuthors,
      pagination: {
        page,
        limit,
        total: filteredAuthors.length,
        totalPages: Math.ceil(filteredAuthors.length / limit),
        hasNext: endIndex < filteredAuthors.length,
        hasPrev: page > 1
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching authors:', error);
    
    // Return specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('No author IDs configured')) {
        return NextResponse.json(
          { error: 'Author configuration error. Please contact support.' },
          { status: 500 }
        );
      }
      if (error.message.includes('No valid authors found')) {
        return NextResponse.json(
          { error: 'No authors available. Please try again later.' },
          { status: 503 }
        );
      }
      if (error.message.includes('Failed to fetch author')) {
        return NextResponse.json(
          { error: 'Author platform temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch authors. Please try again later.' },
      { status: 500 }
    );
  }
}