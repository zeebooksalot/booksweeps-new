export function AuthorDirectorySkeleton() {
  return (
    <div className="space-y-6">
      {/* Search and Filters Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="w-full lg:w-48">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="w-full lg:w-48">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Results Count Skeleton */}
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>

      {/* Authors Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border animate-pulse">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
