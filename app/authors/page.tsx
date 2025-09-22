'use client';

import { Suspense, useState } from 'react';
import { AuthorDirectory } from '@/components/AuthorDirectory';
import { AuthorDirectorySkeleton } from '@/components/AuthorDirectorySkeleton';
import { Header } from '@/components/Header';

export default function AuthorsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Discover Authors
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Explore our community of talented authors and discover your next favorite writer.
            </p>
          </div>

          <Suspense fallback={<AuthorDirectorySkeleton />}>
            <AuthorDirectory />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
