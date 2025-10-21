"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GiveawayDirectoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  isLoading: boolean;
}

export const GiveawayDirectoryPagination = React.memo(function GiveawayDirectoryPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  isLoading
}: GiveawayDirectoryPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between mt-8">
        <p className="text-muted-foreground">
          Showing {totalItems} giveaway{totalItems !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="flex items-center justify-between mt-8">
      <p className="text-muted-foreground">
        Showing {startItem}-{endItem} of {totalItems} giveaway{totalItems !== 1 ? 's' : ''}
      </p>
      
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`dots-${index}`} className="px-3 py-2 text-muted-foreground">
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading}
                className="min-w-[40px]"
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="flex items-center"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
});
