'use client'

import Image from "next/image"
import { DownloadHistory, FavoriteAuthor, ReadingList } from "@/types/dashboard"

interface DashboardContentProps {
  activeTab: string
  downloads: DownloadHistory[]
  favorites: FavoriteAuthor[]
  readingList: ReadingList[]
}

export function DashboardContent({ activeTab, downloads, favorites, readingList }: DashboardContentProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Recent Activity
          </h2>
          
          {/* Recent Downloads */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              Recent Downloads
            </h3>
            {downloads.slice(0, 3).length > 0 ? (
              <div className="space-y-3">
                {downloads.slice(0, 3).map((download) => (
                  <div key={download.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Image 
                      src={download.cover_url} 
                      alt={download.title}
                      width={48}
                      height={64}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {download.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        by {download.author}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {download.format}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No downloads yet. Start exploring books!
              </p>
            )}
          </div>

          {/* Reading Progress */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              Reading Progress
            </h3>
            {readingList.filter(item => item.status === 'reading').length > 0 ? (
              <div className="space-y-3">
                {readingList
                  .filter(item => item.status === 'reading')
                  .slice(0, 2)
                  .map((book) => (
                    <div key={book.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Image 
                        src={book.cover_url} 
                        alt={book.title}
                        width={48}
                        height={64}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {book.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          by {book.author}
                        </div>
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        Reading
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No books in progress. Add some to your reading list!
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'downloads' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Your Downloads ({downloads.length})
          </h2>
          {downloads.length > 0 ? (
            <div className="grid gap-4">
              {downloads.map((download) => (
                <div key={download.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Image 
                    src={download.cover_url} 
                    alt={download.title}
                    width={64}
                    height={80}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {download.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      by {download.author}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Downloaded on {new Date(download.downloaded_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {download.format}
                    </div>
                    {download.file_size && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {download.file_size}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No downloads yet. Start exploring books to build your library!
            </p>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Favorite Authors ({favorites.length})
          </h2>
          {favorites.length > 0 ? (
            <div className="grid gap-4">
              {favorites.map((author) => (
                <div key={author.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Image 
                    src={author.avatar_url} 
                    alt={author.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {author.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {author.bio}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{author.books_count} books</span>
                      <span>{author.followers_count.toLocaleString()} followers</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No favorite authors yet. Start following authors you love!
            </p>
          )}
        </div>
      )}

      {activeTab === 'reading-list' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Reading List ({readingList.length})
          </h2>
          {readingList.length > 0 ? (
            <div className="grid gap-4">
              {readingList.map((book) => (
                <div key={book.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Image 
                    src={book.cover_url} 
                    alt={book.title}
                    width={64}
                    height={80}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {book.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      by {book.author}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Added on {new Date(book.added_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      book.status === 'reading' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      book.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {book.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Your reading list is empty. Add some books to get started!
            </p>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Settings
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Settings page coming soon...
          </p>
        </div>
      )}
    </div>
  )
}
