"use client";

import { useState, useEffect, useMemo } from 'react';
import { Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  GiveawayDirectoryHeader, 
  GiveawayDirectoryGrid, 
  GiveawayDirectoryPagination 
} from './GiveawayDirectory/';

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
        case 'ending-soon':
          const aEndDate = new Date(a.end_date);
          const bEndDate = new Date(b.end_date);
          return aEndDate.getTime() - bEndDate.getTime();
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
        throw new Error('Failed to load giveaways');
      }
      
      const data = await response.json();
      if (data.data && data.data.campaigns) {
        setGiveaways(data.data.campaigns);
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
    );
  }

  return (
    <div className="space-y-6">
      <GiveawayDirectoryHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        genreFilter={genreFilter}
        setGenreFilter={setGenreFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        availableGenres={availableGenres}
        isLoading={isLoading}
      />

      <GiveawayDirectoryGrid
        giveaways={paginatedGiveaways}
        viewMode={viewMode}
        isLoading={isLoading}
        currentPage={currentPage}
        giveawaysPerPage={giveawaysPerPage}
      />

      <GiveawayDirectoryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={filteredGiveaways.length}
        itemsPerPage={giveawaysPerPage}
        isLoading={isLoading}
      />
    </div>
  );
}