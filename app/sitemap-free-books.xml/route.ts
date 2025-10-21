import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateFreeBooksSitemap } from '@/lib/seo';

export async function GET() {
  try {
    // Create Supabase client with service role for public access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all active reader magnets from book_delivery_methods table
    const { data: freeBooks, error } = await supabase
      .from('book_delivery_methods')
      .select('slug')
      .eq('is_active', true)
      .eq('delivery_method', 'ebook')
      .not('slug', 'is', null);

    if (error) {
      console.error('Database error fetching free books:', error);
      return new NextResponse('Error fetching free books data', { status: 500 });
    }

    // Extract slugs from the data
    const freeBookSlugs = freeBooks?.map(book => book.slug).filter(Boolean) || [];
    
    console.log(`Generating sitemap for ${freeBookSlugs.length} free books`);
    
    const sitemap = generateFreeBooksSitemap(freeBookSlugs);
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'text/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating free books sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
