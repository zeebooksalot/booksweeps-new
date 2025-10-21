"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, Calendar, Users, Gift, Clock, Grid3X3, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Giveaway {
  id: string;
  title: string;
  description: string;
  entry_count: number;
  max_entries: number;
  number_of_winners: number;
  end_date: string;
  is_featured: boolean;
  book: {
    title: string;
    author: string;
    cover_image_url: string;
    genre: string;
  };
  author: {
    name: string;
    bio: string;
  };
  created_at: string;
}

interface GiveawayDirectoryProps {
  initialGiveaways?: Giveaway[];
}

export function GiveawayDirectory({ initialGiveaways = [] }: GiveawayDirectoryProps) {
  const [giveaways, setGiveaways] = useState<Giveaway[]>(initialGiveaways);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [genreFilter, setGenreFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [giveawaysPerPage] = useState(12);

  // Get unique genres from giveaways
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    giveaways.forEach(giveaway => {
      if (giveaway.book?.genre) {
        genres.add(giveaway.book.genre);
      }
    });
    return Array.from(genres).sort();
  }, [giveaways]);

  // Filter and sort giveaways
  const filteredGiveaways = useMemo(() => {
    const filtered = giveaways.filter(giveaway => {
      const matchesSearch = giveaway.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (giveaway.book?.title && giveaway.book.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (giveaway.book?.author && giveaway.book.author.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGenre = genreFilter === 'all' || (giveaway.book?.genre && giveaway.book.genre === genreFilter);
      
      // Status filter logic
      let matchesStatus = true;
      if (statusFilter === 'active') {
        const endDate = new Date(giveaway.end_date);
        const now = new Date();
        matchesStatus = endDate > now;
      } else if (statusFilter === 'ending-soon') {
        const endDate = new Date(giveaway.end_date);
        const now = new Date();
        const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        matchesStatus = endDate > now && daysUntilEnd <= 7;
      } else if (statusFilter === 'ended') {
        const endDate = new Date(giveaway.end_date);
        const now = new Date();
        matchesStatus = endDate <= now;
      }
      
      return matchesSearch && matchesGenre && matchesStatus;
    });

    // Sort giveaways
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return (a.book?.author || '').localeCompare(b.book?.author || '');
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'ending':
          return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        case 'popularity':
        default:
          return b.entry_count - a.entry_count;
      }
    });

    return filtered;
  }, [giveaways, searchQuery, sortBy, genreFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredGiveaways.length / giveawaysPerPage);
  const startIndex = (currentPage - 1) * giveawaysPerPage;
  const endIndex = startIndex + giveawaysPerPage;
  const paginatedGiveaways = filteredGiveaways.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, genreFilter, statusFilter]);

  // Load giveaways on component mount
  useEffect(() => {
    if (giveaways.length === 0) {
      loadGiveaways();
    }
  }, []);

  const loadGiveaways = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/campaigns');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch giveaways: ${response.status}`);
      }
      const data = await response.json();
      setGiveaways(data.campaigns || []);
    } catch (error) {
      console.error('Failed to load giveaways:', error);
      setError(error instanceof Error ? error.message : 'Failed to load giveaways');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterGiveaway = (giveawayId: string) => {
    // TODO: Implement enter giveaway logic
    console.log('Enter giveaway:', giveawayId);
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  const getStatusBadge = (giveaway: Giveaway) => {
    if (giveaway.is_featured) {
      return <Badge className="bg-emerald-600 text-white">Featured</Badge>;
    }
    
    const endDate = new Date(giveaway.end_date);
    const now = new Date();
    const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (endDate < now) {
      return <Badge className="bg-gray-500 text-white">Ended</Badge>;
    } else if (daysUntilEnd <= 7) {
      return <Badge className="bg-orange-500 text-white">Ending Soon</Badge>;
    } else {
      return <Badge className="bg-blue-500 text-white">Active</Badge>;
    }
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
                placeholder="Search giveaways..."
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

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-48 bg-muted text-foreground">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Live</SelectItem>
              <SelectItem value="ending-soon">Ending Soon</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
              <SelectItem value="all">All</SelectItem>
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
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="ending">Ending Soon</SelectItem>
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
              Unable to Load Giveaways
            </h3>
            <p className="text-destructive mb-4">
              {error}
            </p>
            <Button onClick={loadGiveaways} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Giveaways Grid */}
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
      ) : filteredGiveaways.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {paginatedGiveaways.map((giveaway, index) => {
            const rank = startIndex + index + 1;
            return (
            <Link
              key={giveaway.id}
              href={`/giveaways/${giveaway.id}`}
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
                          src={giveaway.book?.cover_image_url || "/placeholder.svg"}
                          alt={giveaway.book?.title || giveaway.title}
                          className="w-24 h-32 object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute -top-2 -left-2 w-8 h-8 border-2 border-emerald-600 bg-background text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                          {rank}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground leading-tight">
                          {giveaway.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {giveaway.book?.title || 'Unknown Book'} by {giveaway.book?.author || 'Unknown Author'}
                        </p>
                        {giveaway.book?.genre && (
                          <Badge variant="secondary" className="mt-1">
                            {giveaway.book.genre}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-4 py-2"
                        onClick={(e) => {
                          e.preventDefault();
                          handleEnterGiveaway(giveaway.id);
                        }}
                      >
                        Enter
                      </Button>
                      {getStatusBadge(giveaway)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {giveaway.entry_count} entries
                      </span>
                      <span className="flex items-center">
                        <Gift className="h-4 w-4 mr-1" />
                        {giveaway.number_of_winners} winners
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {getTimeRemaining(giveaway.end_date)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                // List view layout
                <>
                  <div className="relative flex-shrink-0">
                    <img
                      src={giveaway.book?.cover_image_url || "/placeholder.svg"}
                      alt={giveaway.book?.title || giveaway.title}
                      className="w-24 h-32 object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute -top-2 -left-2 w-8 h-8 border-2 border-emerald-600 bg-background text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      {rank}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg leading-tight">
                          {giveaway.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {giveaway.book?.title || 'Unknown Book'} by {giveaway.book?.author || 'Unknown Author'}
                        </p>
                        {giveaway.book?.genre && (
                          <Badge variant="secondary" className="mt-1">
                            {giveaway.book.genre}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-4 py-2"
                          onClick={(e) => {
                            e.preventDefault();
                            handleEnterGiveaway(giveaway.id);
                          }}
                        >
                          Enter
                        </Button>
                        {getStatusBadge(giveaway)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {giveaway.entry_count} entries
                      </span>
                      <span className="flex items-center">
                        <Gift className="h-4 w-4 mr-1" />
                        {giveaway.number_of_winners} winners
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {getTimeRemaining(giveaway.end_date)}
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
          <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No giveaways found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search terms.' : 'No giveaways are available at the moment.'}
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
          {filteredGiveaways.length} giveaway{filteredGiveaways.length !== 1 ? 's' : ''} found
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
