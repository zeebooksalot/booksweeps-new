"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PublicBook } from '@/types/author';
import Image from 'next/image';

interface AuthorFreeBooksProps {
  books: PublicBook[];
  authorName: string;
}

export function AuthorFreeBooks({ books, authorName }: AuthorFreeBooksProps) {
  // PublicBook does not expose pricing/free status; render provided books
  const freeBooks = books

  if (freeBooks.length === 0) return null

  return (
    <section id="free-books" className="bg-card rounded-xl p-8 border border-subtle">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-foreground font-serif">Free Books by {authorName}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {freeBooks.map((book) => (
          <div
            key={book.id}
            className="flex gap-6 p-6 rounded-xl border border-faint hover:border-subtle transition-all duration-200 bg-secondary cursor-pointer hover:shadow-md"
            onClick={() => {
              console.log(`Navigate to book: ${book.title}`);
            }}
          >
            <div className="flex-shrink-0 relative w-20 h-28">
              <Image
                src={book.cover_image_url || "/placeholder.svg"}
                alt={`${book.title} cover`}
                width={80}
                height={112}
                className="object-cover rounded-lg shadow-md"
                sizes="80px"
              />
              <Badge className="absolute -top-2 -right-2 text-xs bg-emerald-600 text-white hover:bg-emerald-700 px-2 py-1">
                FREE
              </Badge>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-foreground text-lg leading-tight">{book.title}</h3>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{new Date(book.created_at).getFullYear()}</span>
                {book.language && (
                  <>
                    <span className="text-border">•</span>
                    <span>{book.language}</span>
                  </>
                )}
                {book.page_count && (
                  <>
                    <span className="text-border">•</span>
                    <span>{book.page_count} pages</span>
                  </>
                )}
              </div>

              {book.description && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{book.description}</p>
              )}

              <div className="flex items-center pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-4 py-2 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log(`Downloading ${book.title}`);
                  }}
                >
                  Download Free
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}


