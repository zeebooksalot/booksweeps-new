"use client";

import { useState, useEffect, useMemo } from 'react';
import { PublicAuthor } from '@/types/author';
import { AuthorDirectoryHeader, AuthorDirectoryGrid, AuthorDirectoryPagination } from './AuthorDirectory/';

interface AuthorDirectoryProps {
  initialAuthors?: PublicAuthor[];
}

export function AuthorDirectory({ initialAuthors = [] }: AuthorDirectoryProps) {
  const [authors, setAuthors] = useState<PublicAuthor[]>(initialAuthors);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [genreFilter, setGenreFilter] = useState('all');
  const [contentFilter, setContentFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [authorsPerPage] = useState(12);

  // Get unique genres from authors
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    authors.forEach(author => {
      if (author.genre) {
        genres.add(author.genre);
      }
    });
    return Array.from(genres).sort();
  }, [authors]);

  // Filter and sort authors
  const filteredAuthors = useMemo(() => {
    const filtered = authors.filter(author => {
      const matchesSearch = author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           author.bio?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = genreFilter === 'all' || author.genre === genreFilter;
      
      // Content filter logic
      let matchesContent = true;
      if (contentFilter === 'giveaways') {
        matchesContent = author.campaigns && author.campaigns.length > 0;
      } else if (contentFilter === 'free-books') {
        matchesContent = author.books && author.books.length > 0;
      } else if (contentFilter === 'both') {
        matchesContent = author.campaigns && author.campaigns.length > 0 && 
                        author.books && author.books.length > 0;
      }
      
      return matchesSearch && matchesGenre && matchesContent;
    });

    // Sort authors
    filtered.sort((a, b) => {
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

    return filtered;
  }, [authors, searchQuery, sortBy, genreFilter, contentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAuthors.length / authorsPerPage);
  const startIndex = (currentPage - 1) * authorsPerPage;
  const endIndex = startIndex + authorsPerPage;
  const paginatedAuthors = filteredAuthors.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, genreFilter, contentFilter]);

  // Load authors on component mount
  useEffect(() => {
    if (authors.length === 0) {
      loadAuthors();
    }
  }, []);

  const loadAuthors = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/authors');
      if (!response.ok) {
        throw new Error('Failed to load authors');
      }
      
      const data = await response.json();
      if (data.data && data.data.authors) {
        setAuthors(data.data.authors);
      } else {
        throw new Error('Invalid data structure received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Authors</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAuthors}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Author Directory</h1>
          <p className="mt-2 text-gray-600">
            Discover talented authors and their amazing books
          </p>
        </div>

        <AuthorDirectoryHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
          contentFilter={contentFilter}
          setContentFilter={setContentFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          availableGenres={availableGenres}
          isLoading={isLoading}
        />

        <div className="mt-8">
          <AuthorDirectoryGrid
            authors={paginatedAuthors}
            viewMode={viewMode}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-8">
          <AuthorDirectoryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}