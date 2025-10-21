"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PublicBook } from '@/types/author';
import { Download } from 'lucide-react';
import Image from 'next/image';

interface AuthorBooksProps {
  books: PublicBook[];
  authorName: string;
}

export function AuthorBooks({ books, authorName }: AuthorBooksProps) {
  // PublicBook does not include status/is_free; keep simple render using available fields

  return (
    <section className="bg-card rounded-xl p-8 border border-border/50">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-foreground font-serif">Books by {authorName}</h2>
        <Button variant="outline" size="sm">
          View All Books
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="flex gap-6 p-6 rounded-xl border border-border/30 hover:border-border/60 transition-all duration-200 bg-secondary/20 cursor-pointer hover:shadow-md"
            onClick={() => {
              // Mock navigation to book details
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
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-foreground text-lg leading-tight">{book.title}</h3>
              </div>

              <div className="flex items-center gap-4 mb-2 text-sm text-muted-foreground">
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

              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{book.description}</p>

              {/* No actions for generic PublicBook */}
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}
