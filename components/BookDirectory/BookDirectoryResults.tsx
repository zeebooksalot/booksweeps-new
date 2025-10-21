"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

interface BookDirectoryResultsProps {
  totalBooks: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  onClearSearch: () => void;
}

export const BookDirectoryResults = React.memo(function BookDirectoryResults({
  totalBooks,
  currentPage,
  totalPages,
  searchQuery,
  onClearSearch
}: BookDirectoryResultsProps) {
  return (
    <div className="flex items-center justify-between mt-8">
      <p className="text-muted-foreground">
        {totalBooks} book{totalBooks !== 1 ? 's' : ''} found
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
          onClick={onClearSearch}
        >
          Clear search
        </Button>
      )}
    </div>
  );
});
