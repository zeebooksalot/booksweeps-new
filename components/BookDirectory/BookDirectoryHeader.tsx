"use client";

import React from 'react';
import { Search, Grid3X3, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BookDirectoryHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  genreFilter: string;
  setGenreFilter: (genre: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  availableGenres: string[];
  isLoading: boolean;
}

export const BookDirectoryHeader = React.memo(function BookDirectoryHeader({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  genreFilter,
  setGenreFilter,
  viewMode,
  setViewMode,
  availableGenres,
  isLoading
}: BookDirectoryHeaderProps) {
  return (
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
        <Select value={genreFilter} onValueChange={setGenreFilter} disabled={isLoading}>
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
        <Select value={sortBy} onValueChange={setSortBy} disabled={isLoading}>
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
  );
});
