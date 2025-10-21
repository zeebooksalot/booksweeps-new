"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Calendar, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReaderMagnetFeedItem } from '@/types/reader-magnets';

interface BookDirectoryGridProps {
  books: ReaderMagnetFeedItem[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  onVote: (bookId: string) => void;
  startIndex: number;
}

export const BookDirectoryGrid = React.memo(function BookDirectoryGrid({ 
  books, 
  viewMode, 
  isLoading, 
  onVote, 
  startIndex 
}: BookDirectoryGridProps) {
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
            <div className="h-3 bg-muted rounded w-full mb-2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No books found
        </h3>
        <p className="text-muted-foreground mb-4">
          No books are available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
      {books.map((book, index) => {
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
                    <div className="relative w-24 h-32 flex-shrink-0">
                      <div className="relative w-full h-full">
                        <Image
                          src={book.cover || "/placeholder.svg"}
                          alt={book.title}
                          fill
                          className="object-cover rounded-lg shadow-md"
                          sizes="96px"
                        />
                        <div className="absolute -top-2 -left-2 w-8 h-8 border-2 border-emerald-600 bg-background text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10">
                          {rank}
                        </div>
                        <Badge className="absolute -top-2 -right-2 text-xs bg-emerald-600 text-white hover:bg-emerald-700 px-2 py-1 z-10">
                          FREE
                        </Badge>
                      </div>
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
                        onVote(book.id);
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
                        onVote(book.id);
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
                <div className="relative flex-shrink-0 w-16 h-20">
                  <div className="relative w-full h-full">
                    <Image
                      src={book.cover || "/placeholder.svg"}
                      alt={book.title}
                      fill
                      className="object-cover rounded-lg shadow-md"
                      sizes="64px"
                    />
                    <div className="absolute -top-2 -left-2 w-6 h-6 border-2 border-emerald-600 bg-background text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10">
                      {rank}
                    </div>
                    <Badge className="absolute -top-1 -right-1 text-xs bg-emerald-600 text-white hover:bg-emerald-700 px-1 py-0.5 z-10">
                      FREE
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground leading-tight truncate">
                        {book.books?.title || book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        by {book.author}
                      </p>
                      {book.genres && book.genres.length > 0 && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {book.genres[0]}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-border text-foreground hover:bg-accent hover:text-accent-foreground px-2 py-1"
                        onClick={(e) => {
                          e.preventDefault();
                          onVote(book.id);
                        }}
                      >
                        <ChevronUp className="h-3 w-3" />
                        {book.votes}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-border text-foreground hover:bg-accent hover:text-accent-foreground px-2 py-1"
                        onClick={(e) => {
                          e.preventDefault();
                          onVote(book.id);
                        }}
                      >
                        <ChevronDown className="h-3 w-3" />
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
  );
});
