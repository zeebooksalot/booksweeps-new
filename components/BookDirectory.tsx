"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, BookOpen, Calendar, ChevronUp, ChevronDown, Grid3X3, List, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReaderMagnetFeedItem } from '@/types/reader-magnets';

interface BookDirectoryProps {
  initialBooks?: ReaderMagnetFeedItem[];
}

export function BookDirectory({ initialBooks = [] }: BookDirectoryProps) {
  const [books, setBooks] = useState<ReaderMagnetFeedItem[]>(initialBooks);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [genreFilter, setGenreFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
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
      setBooks(data.reader_magnets || []);
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

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-card rounded-lg p-6 shadow-sm border border-subtle">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Genre Filter */}
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-full lg:w-48 bg-muted text-foreground">
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
            <SelectTrigger className="w-full lg:w-48 bg-muted text-foreground">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Most Popular</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="author">Author A-Z</SelectItem>
              <SelectItem value="recent">Recently Published</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex border border-border rounded-lg bg-muted h-10">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none border-0 h-full px-3"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none border-0 h-full px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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
      {!error && (isLoading ? (
        <div className={viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`bg-card rounded-lg p-6 shadow-sm border border-subtle animate-pulse ${viewMode === 'list' ? 'flex items-center space-x-4' : ''}`}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-20 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {paginatedBooks.map((book, index) => {
            const rank = startIndex + index + 1;
            return (
            <Link
              key={book.id}
              href={`/dl/${book.slug}`}
              className={`bg-card rounded-lg p-6 shadow-sm border border-faint hover:border-subtle transition-shadow ${
                viewMode === 'list' ? 'flex items-center space-x-6' : ''
              }`}
            >
              {viewMode === 'grid' ? (
                // Grid view layout
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="relative">
                        <img
                          src={book.cover || "/placeholder.svg"}
                          alt={book.title}
                          className="w-24 h-32 object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute -top-2 -left-2 w-8 h-8 border-2 border-emerald-600 bg-background text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                          {rank}
                        </div>
                        <Badge className="absolute -top-2 -right-2 text-xs bg-emerald-600 text-white hover:bg-emerald-700 px-2 py-1">
                          FREE
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground leading-tight">
                          {book.books?.title || book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          by {book.author}
                        </p>
                        {book.genres && book.genres.length > 0 && (
                          <Badge variant="secondary" className="mt-1">
                            {book.genres[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-border text-foreground hover:bg-accent hover:text-accent-foreground px-3 py-1"
                        onClick={(e) => {
                          e.preventDefault();
                          handleVote(book.id);
                        }}
                      >
                        <ChevronUp className="h-4 w-4" />
                        {book.votes}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-border text-foreground hover:bg-accent hover:text-accent-foreground px-3 py-1"
                        onClick={(e) => {
                          e.preventDefault();
                          handleVote(book.id);
                        }}
                      >
                        <ChevronDown className="h-4 w-4" />
                        {book.votes}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {book.publishDate}
                      </span>
                      <span className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {book.download_count} downloads
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                // List view layout
                <>
                  <div className="relative flex-shrink-0">
                    <img
                      src={book.cover || "/placeholder.svg"}
                      alt={book.title}
                      className="w-24 h-32 object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute -top-2 -left-2 w-8 h-8 border-2 border-emerald-600 bg-background text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      {rank}
                    </div>
                    <Badge className="absolute -top-2 -right-2 text-xs bg-emerald-600 text-white hover:bg-emerald-700 px-2 py-1">
                      FREE
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg leading-tight">
                          {book.books?.title || book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          by {book.author}
                        </p>
                        {book.genres && book.genres.length > 0 && (
                          <Badge variant="secondary" className="mt-1">
                            {book.genres[0]}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-3 py-1"
                          onClick={(e) => {
                            e.preventDefault();
                            handleVote(book.id);
                          }}
                        >
                          <ChevronUp className="h-4 w-4" />
                          {book.votes}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1"
                          onClick={(e) => {
                            e.preventDefault();
                            handleVote(book.id);
                          }}
                        >
                          <ChevronDown className="h-4 w-4" />
                          {book.votes}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {book.publishDate}
                      </span>
                      <span className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {book.download_count} downloads
                      </span>
                    </div>
                  </div>
                </>
              )}
            </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No books found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search terms.' : 'No books are available at the moment.'}
          </p>
          {searchQuery && (
            <Button onClick={() => setSearchQuery('')}>
              Clear search
            </Button>
          )}
        </div>
      ))}

      {/* Results Count */}
      <div className="flex items-center justify-between mt-8">
        <p className="text-muted-foreground">
          {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found
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
