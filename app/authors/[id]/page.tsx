import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AuthorProfile } from '@/components/AuthorProfile';
import { getAuthorData } from '@/lib/authorApi';
import { generateSEOMeta, generateStructuredData } from '@/lib/seo';
import { PublicAuthor } from '@/types/author';

interface AuthorPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  try {
    const author = await getAuthorData(params.id);
    const seo = generateSEOMeta({
      title: `${author.name} - Author Profile`,
      description: author.bio || `Discover books and campaigns by ${author.name}`,
      image: author.avatar_url,
      url: `https://staging.booksweeps.com/authors/${author.id}`,
    });

    return {
      title: seo.title,
      description: seo.description,
      openGraph: seo.openGraph,
      twitter: seo.twitter,
    };
  } catch (error) {
    return {
      title: 'Author Not Found',
      description: 'The requested author could not be found.',
    };
  }
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  try {
    const author = await getAuthorData(params.id);
    const structuredData = generateStructuredData(author);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AuthorProfile author={author} />
      </>
    );
  } catch (error) {
    notFound();
  }
}
