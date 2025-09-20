import { NextResponse } from 'next/server';
import { generateAuthorSitemap } from '@/lib/seo';

export async function GET() {
  try {
    // In a real implementation, you'd fetch all author IDs from your API
    // For now, we'll use an empty array as a placeholder
    const authorIds: string[] = [];
    
    const sitemap = generateAuthorSitemap(authorIds);
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error generating author sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
