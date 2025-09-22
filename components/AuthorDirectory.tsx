"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, Users, BookOpen, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PublicAuthor } from '@/types/author';

interface AuthorDirectoryProps {
  initialAuthors?: PublicAuthor[];
}

export function AuthorDirectory({ initialAuthors = [] }: AuthorDirectoryProps) {
  const [authors, setAuthors] = useState<PublicAuthor[]>(initialAuthors);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [genreFilter, setGenreFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
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
    let filtered = authors.filter(author => {
      const matchesSearch = author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           author.bio?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = genreFilter === 'all' || author.genre === genreFilter;
      return matchesSearch && matchesGenre;
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
  }, [authors, searchQuery, sortBy, genreFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAuthors.length / authorsPerPage);
  const startIndex = (currentPage - 1) * authorsPerPage;
  const endIndex = startIndex + authorsPerPage;
  const paginatedAuthors = filteredAuthors.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, genreFilter]);

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch authors: ${response.status}`);
      }
      const data = await response.json();
      setAuthors(data.authors);
    } catch (error) {
      console.error('Failed to load authors:', error);
      setError(error instanceof Error ? error.message : 'Failed to load authors');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Genre Filter */}
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {availableGenres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="books">Most Books</SelectItem>
              <SelectItem value="recent">Recently Joined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          {filteredAuthors.length} author{filteredAuthors.length !== 1 ? 's' : ''} found
          {totalPages > 1 && (
            <span className="ml-2">
              (Page {currentPage} of {totalPages})
            </span>
          )}
        </p>
        {searchQuery && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery('')}
          >
            Clear search
          </Button>
        )}
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Unable to Load Authors
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {error}
            </p>
            <Button onClick={loadAuthors} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Authors Grid */}
      {!error && (isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredAuthors.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedAuthors.map((author) => (
            <Link
              key={author.id}
              href={`/authors/${author.slug}`}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={author.avatar_url || '/placeholder-author.jpg'}
                    alt={author.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {author.name}
                  </h3>
                  {author.genre && (
                    <Badge variant="secondary" className="mt-1">
                      {author.genre}
                    </Badge>
                  )}
                </div>
              </div>

              {author.bio && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {author.bio}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {author.books.length} books
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {(author.followers || 0).toLocaleString()} followers
                  </span>
                </div>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(author.created_at).getFullYear()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No authors found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery ? 'Try adjusting your search terms.' : 'No authors are available at the moment.'}
          </p>
          {searchQuery && (
            <Button onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          )}
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
