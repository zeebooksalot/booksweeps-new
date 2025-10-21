import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateGiveawaysSitemap } from '@/lib/seo';

export async function GET() {
  try {
    // Create Supabase client with service role for public access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all active giveaways from campaigns table
    const { data: giveaways, error } = await supabase
      .from('campaigns')
      .select('id')
      .eq('status', 'active')
      .not('id', 'is', null);

    if (error) {
      console.error('Database error fetching giveaways:', error);
      return new NextResponse('Error fetching giveaways data', { status: 500 });
    }

    // Extract IDs from the data
    const giveawayIds = giveaways?.map(giveaway => giveaway.id).filter(Boolean) || [];
    
    console.log(`Generating sitemap for ${giveawayIds.length} giveaways`);
    
    const sitemap = generateGiveawaysSitemap(giveawayIds);
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'text/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating giveaways sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
