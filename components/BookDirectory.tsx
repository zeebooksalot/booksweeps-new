"use client";

import { useState, useEffect, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReaderMagnetFeedItem } from '@/types/reader-magnets';
import { 
  BookDirectoryHeader, 
  BookDirectoryGrid, 
  BookDirectoryPagination, 
  BookDirectoryResults 
} from './BookDirectory/';

interface BookDirectoryProps {
  initialBooks?: ReaderMagnetFeedItem[];
}

export function BookDirectory({ initialBooks = [] }: BookDirectoryProps) {
  const [books, setBooks] = useState<ReaderMagnetFeedItem[]>(initialBooks);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [genreFilter, setGenreFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(12);

  // Get unique genres from books
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    books.forEach(book => {
      if (book.genres && book.genres.length > 0) {
        book.genres.forEach(genre => genres.add(genre));
      }
    });
    return Array.from(genres).sort();
  }, [books]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    const filtered = books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = genreFilter === 'all' || (book.genres && book.genres.includes(genreFilter));
      return matchesSearch && matchesGenre;
    });

    // Sort books
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'recent':
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
        case 'popularity':
        default:
          return b.votes - a.votes;
      }
    });

    return filtered;
  }, [books, searchQuery, sortBy, genreFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, genreFilter]);

  // Load books on component mount
  useEffect(() => {
    if (books.length === 0) {
      loadBooks();
    }
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reader-magnets');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch books: ${response.status}`);
      }
      const data = await response.json();
      setBooks(data.data?.reader_magnets || []);
    } catch (error) {
      console.error('Failed to load books:', error);
      setError(error instanceof Error ? error.message : 'Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = (bookId: string) => {
    // TODO: Implement voting logic
    console.log('Vote for book:', bookId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <BookDirectoryHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        genreFilter={genreFilter}
        setGenreFilter={setGenreFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        availableGenres={availableGenres}
        isLoading={isLoading}
      />

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Unable to Load Books
            </h3>
            <p className="text-destructive mb-4">
              {error}
            </p>
            <Button onClick={loadBooks} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Books Grid */}
      {!error && (
        <BookDirectoryGrid
          books={paginatedBooks}
          viewMode={viewMode}
          isLoading={isLoading}
          onVote={handleVote}
          startIndex={startIndex}
        />
      )}

      {/* Results Count */}
      {!error && !isLoading && (
        <BookDirectoryResults
          totalBooks={filteredBooks.length}
          currentPage={currentPage}
          totalPages={totalPages}
          searchQuery={searchQuery}
          onClearSearch={handleClearSearch}
        />
      )}

      {/* Pagination */}
      {!error && totalPages > 1 && (
        <BookDirectoryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}