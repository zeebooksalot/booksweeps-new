import { PublicAuthor } from '@/types/author';

interface SEOMeta {
  title: string;
  description: string;
  image?: string;
  url: string;
}

export function generateSEOMeta({ title, description, image, url }: SEOMeta) {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: image ? [{ url: image }] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export function generateStructuredData(author: PublicAuthor) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    description: author.bio,
    url: `https://staging.booksweeps.com/authors/${author.slug}`,
    image: author.avatar_url,
    sameAs: Object.values(author.social_links || {}).filter(Boolean),
    knowsAbout: author.genre,
    ...(author.website && { url: author.website }),
  };
}

// Sitemap generation for author pages
export function generateAuthorSitemap(authorSlugs: string[]) {
  const baseUrl = 'https://staging.booksweeps.com';
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${authorSlugs.map(slug => `
  <url>
    <loc>${baseUrl}/authors/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;
}
