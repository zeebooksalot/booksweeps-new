"use client";

import React from 'react';

interface GiveawayDirectorySkeletonProps {
  viewMode: 'grid' | 'list';
}

export const GiveawayDirectorySkeleton = React.memo(function GiveawayDirectorySkeleton({ viewMode }: GiveawayDirectorySkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg p-6 shadow-sm border border-subtle animate-pulse flex items-center space-x-4">
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

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg p-6 shadow-sm border border-subtle animate-pulse">
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
});
