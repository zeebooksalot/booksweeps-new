"use client";

import React from 'react';
import Link from 'next/link';
import { Users, BookOpen, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PublicAuthor } from '@/types/author';

interface AuthorDirectoryGridProps {
  authors: PublicAuthor[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
}

export const AuthorDirectoryGrid = React.memo(function AuthorDirectoryGrid({ authors, viewMode, isLoading }: AuthorDirectoryGridProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (authors.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No authors found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {authors.map((author) => (
          <div key={author.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {getInitials(author.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {author.name}
                  </h3>
                  <Badge variant="secondary" className="ml-2">
                    {author.genre || 'General'}
                  </Badge>
                </div>
                
                {author.bio && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {author.bio}
                  </p>
                )}
                
                <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {author.books?.length || 0} books
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {author.followers || 0} followers
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(author.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <Link href={`/authors/${author.id}`}>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {authors.map((author) => (
        <div key={author.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="text-center">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarFallback className="text-xl">
                {getInitials(author.name)}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {author.name}
            </h3>
            
            {author.bio && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {author.bio}
              </p>
            )}
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <BookOpen className="h-4 w-4 mr-1" />
                {author.books?.length || 0} books
              </div>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                {author.followers || 0} followers
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Badge variant="secondary" className="w-fit mx-auto">
                {author.genre || 'General'}
              </Badge>
              
              <Link href={`/authors/${author.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
