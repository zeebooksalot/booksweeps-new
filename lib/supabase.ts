import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Create the client component client for client-side usage
// This automatically handles both cookies and localStorage
export const supabase = createClientComponentClient()

// Updated Database types to match your schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          display_name: string | null
          created_at: string
          updated_at: string
          user_type: string
          auth_source: string | null
          favorite_genres: string[]
          reading_preferences: Record<string, unknown>
          giveaway_reminders: boolean
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
          user_type?: string
          auth_source?: string | null
          favorite_genres?: string[]
          reading_preferences?: Record<string, unknown>
          giveaway_reminders?: boolean
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
          user_type?: string
          auth_source?: string | null
          favorite_genres?: string[]
          reading_preferences?: Record<string, unknown>
          giveaway_reminders?: boolean
        }
      }
      books: {
        Row: {
          id: string
          user_id: string
          isbn: string | null
          title: string
          author: string
          description: string | null
          cover_image_url: string | null
          publisher: string | null
          published_date: string | null
          genre: string | null
          page_count: number | null
          language: string
          source: string
          created_at: string
          updated_at: string
          pen_name_id: string | null
          asin: string | null
          status: string
          series_id: string | null
          series_order: number | null
          upvotes_count: number
          downvotes_count: number
        }
        Insert: {
          id?: string
          user_id: string
          isbn?: string | null
          title: string
          author: string
          description?: string | null
          cover_image_url?: string | null
          publisher?: string | null
          published_date?: string | null
          genre?: string | null
          page_count?: number | null
          language?: string
          source?: string
          created_at?: string
          updated_at?: string
          pen_name_id?: string | null
          asin?: string | null
          status?: string
          series_id?: string | null
          series_order?: number | null
          upvotes_count?: number
          downvotes_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          isbn?: string | null
          title?: string
          author?: string
          description?: string | null
          cover_image_url?: string | null
          publisher?: string | null
          published_date?: string | null
          genre?: string | null
          page_count?: number | null
          language?: string
          source?: string
          created_at?: string
          updated_at?: string
          pen_name_id?: string | null
          asin?: string | null
          status?: string
          series_id?: string | null
          series_order?: number | null
          upvotes_count?: number
          downvotes_count?: number
        }
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          book_id: string | null
          status: string
          start_date: string | null
          end_date: string | null
          max_entries: number | null
          entry_count: number
          created_at: string
          updated_at: string
          pen_name_id: string | null
          campaign_type: string
          prize_description: string | null
          rules: string | null
          book_cover_url: string | null
          book_genre: string | null
          book_description: string | null
          author_name: string | null
          winner_selection_date: string | null
          winner_announcement_date: string | null
          is_featured: boolean
          social_sharing_message: string | null
          thank_you_message: string | null
          minimum_age: number
          eligibility_countries: string[] | null
          campaign_genre: string | null
          prize_value: number | null
          prize_format: string | null
          number_of_winners: number
          target_entries: number
          duration: number | null
          entry_methods: string[] | null
          selected_books: string[] | null
          gdpr_checkbox: boolean
          custom_thank_you_page: string | null
          social_media_config: Record<string, unknown>
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          book_id?: string | null
          status?: string
          start_date?: string | null
          end_date?: string | null
          max_entries?: number | null
          entry_count?: number
          created_at?: string
          updated_at?: string
          pen_name_id?: string | null
          campaign_type?: string
          prize_description?: string | null
          rules?: string | null
          book_cover_url?: string | null
          book_genre?: string | null
          book_description?: string | null
          author_name?: string | null
          winner_selection_date?: string | null
          winner_announcement_date?: string | null
          is_featured?: boolean
          social_sharing_message?: string | null
          thank_you_message?: string | null
          minimum_age?: number
          eligibility_countries?: string[] | null
          campaign_genre?: string | null
          prize_value?: number | null
          prize_format?: string | null
          number_of_winners?: number
          target_entries?: number
          duration?: number | null
          entry_methods?: string[] | null
          selected_books?: string[] | null
          gdpr_checkbox?: boolean
          custom_thank_you_page?: string | null
          social_media_config?: Record<string, unknown>
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          book_id?: string | null
          status?: string
          start_date?: string | null
          end_date?: string | null
          max_entries?: number | null
          entry_count?: number
          created_at?: string
          updated_at?: string
          pen_name_id?: string | null
          campaign_type?: string
          prize_description?: string | null
          rules?: string | null
          book_cover_url?: string | null
          book_genre?: string | null
          book_description?: string | null
          author_name?: string | null
          winner_selection_date?: string | null
          winner_announcement_date?: string | null
          is_featured?: boolean
          social_sharing_message?: string | null
          thank_you_message?: string | null
          minimum_age?: number
          eligibility_countries?: string[] | null
          campaign_genre?: string | null
          prize_value?: number | null
          prize_format?: string | null
          number_of_winners?: number
          target_entries?: number
          duration?: number | null
          entry_methods?: string[] | null
          selected_books?: string[] | null
          gdpr_checkbox?: boolean
          custom_thank_you_page?: string | null
          social_media_config?: Record<string, unknown>
        }
      }
      pen_names: {
        Row: {
          id: string
          user_id: string
          name: string
          bio: string | null
          website: string | null
          social_links: Record<string, unknown>
          is_primary: boolean
          created_at: string
          updated_at: string
          status: string
          avatar_url: string | null
          genre: string | null
          upvotes_count: number
          downvotes_count: number
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          bio?: string | null
          website?: string | null
          social_links?: Record<string, unknown>
          is_primary?: boolean
          created_at?: string
          updated_at?: string
          status?: string
          avatar_url?: string | null
          genre?: string | null
          upvotes_count?: number
          downvotes_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          bio?: string | null
          website?: string | null
          social_links?: Record<string, unknown>
          is_primary?: boolean
          created_at?: string
          updated_at?: string
          status?: string
          avatar_url?: string | null
          genre?: string | null
          upvotes_count?: number
          downvotes_count?: number
        }
      }
      reader_entries: {
        Row: {
          id: string
          campaign_id: string
          email: string
          first_name: string | null
          last_name: string | null
          entry_method: string
          entry_data: Record<string, unknown>
          ip_address: string | null
          user_agent: string | null
          verified: boolean
          status: string
          marketing_opt_in: boolean
          referral_code: string | null
          referred_by: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          campaign_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          entry_method: string
          entry_data?: Record<string, unknown>
          ip_address?: string | null
          user_agent?: string | null
          verified?: boolean
          status?: string
          marketing_opt_in?: boolean
          referral_code?: string | null
          referred_by?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          campaign_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          entry_method?: string
          entry_data?: Record<string, unknown>
          ip_address?: string | null
          user_agent?: string | null
          verified?: boolean
          status?: string
          marketing_opt_in?: boolean
          referral_code?: string | null
          referred_by?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          book_id: string | null
          pen_name_id: string | null
          vote_type: 'upvote' | 'downvote'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id?: string | null
          pen_name_id?: string | null
          vote_type: 'upvote' | 'downvote'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string | null
          pen_name_id?: string | null
          vote_type?: 'upvote' | 'downvote'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Update books and pen_names types to include vote counts
export interface BookWithVotes {
  id: string
  user_id: string
  title: string
  author: string
  description: string | null
  cover_image_url: string | null
  genre: string | null
  upvotes_count: number
  downvotes_count: number
  // ... other fields
}

export interface PenNameWithVotes {
  id: string
  user_id: string
  name: string
  bio: string | null
  avatar_url: string | null
  upvotes_count: number
  downvotes_count: number
  // ... other fields
}
