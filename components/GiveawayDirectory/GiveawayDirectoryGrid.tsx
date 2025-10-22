"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Users, Gift, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Giveaway } from '@/types'

interface GiveawayDirectoryGridProps {
  giveaways: Giveaway[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  currentPage: number;
  giveawaysPerPage: number;
}

export const GiveawayDirectoryGrid = React.memo(function GiveawayDirectoryGrid({ 
  giveaways, 
  viewMode, 
  isLoading, 
  currentPage, 
  giveawaysPerPage 
}: GiveawayDirectoryGridProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Ended';
    if (diffDays === 0) return 'Ends today';
    if (diffDays === 1) return 'Ends tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    return `${diffDays} days left`;
  };

  const getRank = (index: number) => {
    return currentPage === 1 ? index + 1 : (currentPage - 1) * giveawaysPerPage + index + 1;
  };

  if (isLoading) {
    return (
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
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (giveaways.length === 0) {
    return (
      <div className="text-center py-12">
        <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No giveaways found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {giveaways.map((giveaway, index) => {
          const rank = getRank(index);
          return (
            <Link
              key={giveaway.id}
              href={`/book-giveaways/${giveaway.id}`}
              className="block bg-card rounded-lg p-6 shadow-sm border border-subtle hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                  <div className="relative w-16 h-20 flex-shrink-0">
                    <div className="relative w-full h-full">
                      <Image
                        src={giveaway.book?.cover_image_url || '/placeholder-book.jpg'}
                        alt={giveaway.book?.title || 'Book cover'}
                        fill
                        className="object-cover rounded-lg shadow-sm"
                        sizes="64px"
                      />
                      <div className="absolute -top-2 -left-2 w-8 h-8 border-2 border-emerald-600 bg-background text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10">
                        {rank}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground leading-tight">
                      {giveaway.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {giveaway.book?.title} by {giveaway.book?.author}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {giveaway.book?.genre}
                      </Badge>
                      {giveaway.is_featured && (
                        <Badge variant="default" className="text-xs bg-emerald-600">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    Enter Giveaway
                  </Button>
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
                    {giveaway.number_of_winners} winner{giveaway.number_of_winners > 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {getTimeRemaining(giveaway.end_date)}
                  </span>
                </div>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Ends {formatDate(giveaway.end_date)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {giveaways.map((giveaway, index) => {
        const rank = getRank(index);
        return (
          <Link
            key={giveaway.id}
            href={`/book-giveaways/${giveaway.id}`}
            className="block bg-card rounded-lg p-6 shadow-sm border border-subtle hover:shadow-md transition-shadow"
          >
            <div className="relative flex-shrink-0 w-full h-48">
              <div className="relative w-full h-full">
                <Image
                  src={giveaway.book?.cover_image_url || '/placeholder-book.jpg'}
                  alt={giveaway.book?.title || 'Book cover'}
                  fill
                  className="object-cover rounded-lg shadow-sm"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute -top-2 -left-2 w-8 h-8 border-2 border-emerald-600 bg-background text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10">
                  {rank}
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground text-lg leading-tight">
                    {giveaway.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {giveaway.book?.title} by {giveaway.book?.author}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    Enter Giveaway
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {giveaway.entry_count} entries
                </span>
                <span className="flex items-center">
                  <Gift className="h-4 w-4 mr-1" />
                  {giveaway.number_of_winners} winner{giveaway.number_of_winners > 1 ? 's' : ''}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {getTimeRemaining(giveaway.end_date)}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
});
