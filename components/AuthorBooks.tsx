import Image from 'next/image';
import { PublicBook } from '@/types/author';

interface AuthorBooksProps {
  books: PublicBook[];
}

export function AuthorBooks({ books }: AuthorBooksProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h2 className="text-2xl font-bold mb-6">Books ({books.length})</h2>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <div key={book.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex gap-3">
              <div className="relative w-16 h-20 bg-gray-200 rounded flex-shrink-0">
                {book.cover_image_url ? (
                  <Image
                    src={book.cover_image_url}
                    alt={book.title}
                    fill
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No Cover
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600">
                  by {book.author}
                </p>
                {book.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {book.description}
                  </p>
                )}
                <div className="flex gap-2 mt-2 text-xs text-gray-400">
                  {book.page_count && (
                    <span>{book.page_count} pages</span>
                  )}
                  {book.language && (
                    <span>• {book.language}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
