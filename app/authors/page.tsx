'use client';

import { Suspense, useState } from 'react';
import { AuthorDirectory } from '@/components/AuthorDirectory';
import { AuthorDirectorySkeleton } from '@/components/AuthorDirectory/AuthorDirectorySkeleton';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';

export default function AuthorsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="mx-auto max-w-6xl px-4 lg:px-0 pt-24">
        {/* Hero Section */}
        <div className="bg-card rounded-xl p-8 border border-subtle mb-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-4 font-serif leading-[1.5em]">
              Join to access free books <br />
              & giveaways from authors.
              </h1>
              <p className="text-lg text-muted-foreground">
                Explore our community of talented authors and discover your next favorite writer.
              </p>
            </div>
            <div className="w-full lg:w-72">
              <form className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-base font-semibold">
                  Sign Up Free
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="py-8 pb-24">
          <Suspense fallback={<AuthorDirectorySkeleton />}>
            <AuthorDirectory />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
