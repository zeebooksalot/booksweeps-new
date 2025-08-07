import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...')

  try {
    // Create sample users first
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert([
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          email: 'elena@example.com',
          first_name: 'Elena',
          last_name: 'Rodriguez',
          display_name: 'Elena Rodriguez',
          user_type: 'author',
          favorite_genres: ['Fantasy', 'Romance'],
          giveaway_reminders: true
        },
        {
          id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
          email: 'sarah@example.com',
          first_name: 'Sarah',
          last_name: 'Johnson',
          display_name: 'Sarah Johnson',
          user_type: 'author',
          favorite_genres: ['Literary Fiction', 'Contemporary'],
          giveaway_reminders: true
        },
        {
          id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
          email: 'maria@example.com',
          first_name: 'Maria',
          last_name: 'Santos',
          display_name: 'Maria Santos',
          user_type: 'author',
          favorite_genres: ['Post-Apocalyptic', 'Dystopian'],
          giveaway_reminders: true
        }
      ])
      .select()

    if (usersError) {
      console.error('Error inserting users:', usersError)
      process.exit(1)
    }

    console.log('✅ Users inserted')

    // Create sample pen names
    const { data: penNames, error: penNamesError } = await supabase
      .from('pen_names')
      .insert([
        {
          id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
          user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: 'Elena Rodriguez',
          bio: 'Fantasy romance author who transports readers to magical worlds filled with adventure and love.',
          website: 'https://elenarodriguez.com',
          social_links: {
            twitter: 'https://twitter.com/elenarodriguez',
            goodreads: 'https://goodreads.com/elenarodriguez'
          },
          is_primary: true,
          avatar_url: '/placeholder.svg?height=64&width=64',
          genre: 'Fantasy',
          status: 'active'
        },
        {
          id: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
          user_id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
          name: 'Sarah Johnson',
          bio: 'Bestselling author of contemporary fiction with over 3 million books sold worldwide.',
          website: 'https://sarahjohnson.com',
          social_links: {
            twitter: 'https://twitter.com/sarahjohnson',
            goodreads: 'https://goodreads.com/sarahjohnson'
          },
          is_primary: true,
          avatar_url: '/placeholder.svg?height=64&width=64',
          genre: 'Literary Fiction',
          status: 'active'
        },
        {
          id: 'f6g7h8i9-j0k1-2345-fghi-678901234567',
          user_id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
          name: 'Maria Santos',
          bio: 'Post-apocalyptic fiction writer who explores themes of hope and resilience in dark times.',
          website: 'https://mariasantos.com',
          social_links: {
            twitter: 'https://twitter.com/mariasantos',
            goodreads: 'https://goodreads.com/mariasantos'
          },
          is_primary: true,
          avatar_url: '/placeholder.svg?height=64&width=64',
          genre: 'Post-Apocalyptic',
          status: 'active'
        }
      ])
      .select()

    if (penNamesError) {
      console.error('Error inserting pen names:', penNamesError)
      process.exit(1)
    }

    console.log('✅ Pen names inserted')

    // Create sample books
    const { data: books, error: booksError } = await supabase
      .from('books')
      .insert([
        {
          id: 'g7h8i9j0-k1l2-3456-ghij-789012345678',
          user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          title: 'Ocean\'s Echo',
          author: 'Elena Rodriguez',
          description: 'A magical tale of love and adventure beneath the waves that explores the depths of human connection and the mysteries of the ocean.',
          cover_image_url: '/placeholder.svg?height=80&width=64',
          publisher: 'Fantasy Press',
          published_date: '2024-03-15',
          genre: 'Fantasy',
          page_count: 320,
          language: 'English',
          pen_name_id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
          status: 'active',
          source: 'manual'
        },
        {
          id: 'h8i9j0k1-l2m3-4567-hijk-890123456789',
          user_id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
          title: 'The Last Garden',
          author: 'Maria Santos',
          description: 'Hope blooms in the most unexpected places in this post-apocalyptic tale that reminds us of the resilience of the human spirit.',
          cover_image_url: '/placeholder.svg?height=80&width=64',
          publisher: 'Dystopian Books',
          published_date: '2024-02-20',
          genre: 'Post-Apocalyptic',
          page_count: 280,
          language: 'English',
          pen_name_id: 'f6g7h8i9-j0k1-2345-fghi-678901234567',
          status: 'active',
          source: 'manual'
        },
        {
          id: 'i9j0k1l2-m3n4-5678-ijkl-901234567890',
          user_id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
          title: 'The Midnight Library',
          author: 'Sarah Johnson',
          description: 'A thought-provoking novel about life\'s infinite possibilities and the choices we make, exploring themes of regret, hope, and second chances.',
          cover_image_url: '/placeholder.svg?height=80&width=64',
          publisher: 'Literary House',
          published_date: '2023-08-10',
          genre: 'Literary Fiction',
          page_count: 350,
          language: 'English',
          pen_name_id: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
          status: 'active',
          source: 'manual'
        }
      ])
      .select()

    if (booksError) {
      console.error('Error inserting books:', booksError)
      process.exit(1)
    }

    console.log('✅ Books inserted')

    // Create sample campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .insert([
        {
          id: 'j0k1l2m3-n4o5-6789-jklm-012345678901',
          user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          title: 'Ocean\'s Echo Giveaway',
          description: 'Enter to win a copy of Ocean\'s Echo, a magical tale of love and adventure beneath the waves.',
          book_id: 'g7h8i9j0-k1l2-3456-ghij-789012345678',
          status: 'active',
          campaign_type: 'giveaway',
          prize_description: 'One signed copy of Ocean\'s Echo',
          rules: 'Open to US residents 18+. One entry per person.',
          book_cover_url: '/placeholder.svg?height=80&width=64',
          book_genre: 'Fantasy',
          book_description: 'A magical tale of love and adventure beneath the waves.',
          author_name: 'Elena Rodriguez',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          max_entries: 1000,
          entry_count: 0,
          number_of_winners: 5,
          target_entries: 100,
          minimum_age: 18,
          gdpr_checkbox: true,
          is_featured: true,
          pen_name_id: 'd4e5f6g7-h8i9-0123-defg-456789012345'
        },
        {
          id: 'k1l2m3n4-o5p6-7890-klmn-123456789012',
          user_id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
          title: 'The Last Garden Giveaway',
          description: 'Win a copy of The Last Garden, a post-apocalyptic tale of hope and resilience.',
          book_id: 'h8i9j0k1-l2m3-4567-hijk-890123456789',
          status: 'active',
          campaign_type: 'giveaway',
          prize_description: 'One digital copy of The Last Garden',
          rules: 'Open worldwide 18+. One entry per person.',
          book_cover_url: '/placeholder.svg?height=80&width=64',
          book_genre: 'Post-Apocalyptic',
          book_description: 'Hope blooms in the most unexpected places.',
          author_name: 'Maria Santos',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
          max_entries: 500,
          entry_count: 0,
          number_of_winners: 3,
          target_entries: 50,
          minimum_age: 18,
          gdpr_checkbox: true,
          is_featured: false,
          pen_name_id: 'f6g7h8i9-j0k1-2345-fghi-678901234567'
        }
      ])
      .select()

    if (campaignsError) {
      console.error('Error inserting campaigns:', campaignsError)
      process.exit(1)
    }

    console.log('✅ Campaigns inserted')
    console.log('🎉 Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase().catch(console.error)