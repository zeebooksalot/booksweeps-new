import { Suspense } from 'react';
import { Metadata } from 'next';
import { AuthorDirectory } from '@/components/AuthorDirectory';
import { AuthorDirectorySkeleton } from '@/components/AuthorDirectorySkeleton';

export const metadata: Metadata = {
  title: 'Authors - Discover Amazing Authors',
  description: 'Browse and discover amazing authors on BookSweeps. Find your favorite writers and discover new ones.',
  openGraph: {
    title: 'Authors - Discover Amazing Authors',
    description: 'Browse and discover amazing authors on BookSweeps. Find your favorite writers and discover new ones.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Authors - Discover Amazing Authors',
    description: 'Browse and discover amazing authors on BookSweeps. Find your favorite writers and discover new ones.',
  },
};

export default function AuthorsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
  );
}
