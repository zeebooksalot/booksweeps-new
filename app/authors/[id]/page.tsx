'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { AuthorProfile } from '@/components/AuthorProfile';
import { Header } from '@/components/header';
import { getAuthorData } from '@/lib/authorApi';
import { generateStructuredData } from '@/lib/seo';
import { PublicAuthor } from '@/types/author';

export default function AuthorPage() {
  const params = useParams();
  const [author, setAuthor] = useState<PublicAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchAuthor() {
      try {
        const slug = params.id as string;
        const authorData = await getAuthorData(slug);
        setAuthor(authorData);
      } catch (err) {
        setError('Author not found');
        console.error('Error fetching author:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAuthor();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="pt-20 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading author...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !author) {
    notFound();
  }

  const structuredData = generateStructuredData(author);

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="pt-20">
        <AuthorProfile author={author} />
      </div>
    </div>
  );
}
