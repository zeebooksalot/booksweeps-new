import { Giveaway, GiveawayBook, GiveawayAuthor } from '@/types'

// Database types (what we store in JSONB)
interface DatabaseGiveaway {
  id: string
  title: string
  description: string
  book_data: any // JSONB
  author_data: any // JSONB
  start_date: string
  end_date: string
  max_entries: number
  entry_count: number
  number_of_winners: number
  prize_description: string
  rules: string
  status: 'active' | 'ended' | 'draft'
  is_featured: boolean
  created_at: string
  updated_at: string
}

// Transform database row to application format
export function mapDatabaseToGiveaway(dbGiveaway: DatabaseGiveaway): Giveaway {
  return {
    id: dbGiveaway.id,
    title: dbGiveaway.title,
    description: dbGiveaway.description,
    book: {
      id: dbGiveaway.book_data.id,
      title: dbGiveaway.book_data.title,
      author: dbGiveaway.book_data.author,
      cover_image_url: dbGiveaway.book_data.cover_image_url,
      genre: dbGiveaway.book_data.genre,
      description: dbGiveaway.book_data.description
    },
    author: {
      id: dbGiveaway.author_data.id,
      name: dbGiveaway.author_data.name,
      avatar_url: dbGiveaway.author_data.avatar_url,
      bio: dbGiveaway.author_data.bio
    },
    start_date: dbGiveaway.start_date,
    end_date: dbGiveaway.end_date,
    max_entries: dbGiveaway.max_entries,
    entry_count: dbGiveaway.entry_count,
    number_of_winners: dbGiveaway.number_of_winners,
    prize_description: dbGiveaway.prize_description,
    rules: dbGiveaway.rules,
    status: dbGiveaway.status,
    is_featured: dbGiveaway.is_featured,
    created_at: dbGiveaway.created_at,
    updated_at: dbGiveaway.updated_at
  }
}

// Transform application format to database format
export function mapGiveawayToDatabase(giveaway: Giveaway): Partial<DatabaseGiveaway> {
  return {
    id: giveaway.id,
    title: giveaway.title,
    description: giveaway.description,
    book_data: {
      id: giveaway.book.id,
      title: giveaway.book.title,
      author: giveaway.book.author,
      cover_image_url: giveaway.book.cover_image_url,
      genre: giveaway.book.genre,
      description: giveaway.book.description
    },
    author_data: {
      id: giveaway.author.id,
      name: giveaway.author.name,
      avatar_url: giveaway.author.avatar_url,
      bio: giveaway.author.bio
    },
    start_date: giveaway.start_date,
    end_date: giveaway.end_date,
    max_entries: giveaway.max_entries,
    entry_count: giveaway.entry_count,
    number_of_winners: giveaway.number_of_winners,
    prize_description: giveaway.prize_description,
    rules: giveaway.rules,
    status: giveaway.status,
    is_featured: giveaway.is_featured
  }
}

// Helper to create book data for database
export function createBookData(book: GiveawayBook): any {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    cover_image_url: book.cover_image_url,
    genre: book.genre,
    description: book.description
  }
}

// Helper to create author data for database
export function createAuthorData(author: GiveawayAuthor): any {
  return {
    id: author.id,
    name: author.name,
    avatar_url: author.avatar_url,
    bio: author.bio
  }
}
