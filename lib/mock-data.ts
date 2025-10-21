import { BookItem, AuthorItem } from '@/types'

// Mock data for development and fallback scenarios
export const MOCK_DATA = {
  books: [
    {
      id: "1",
      type: "book" as const,
      title: "Ocean's Echo",
      author: "Elena Rodriguez",
      description: "A magical tale of love and adventure beneath the waves that explores the depths of human connection and the mysteries of the ocean.",
      cover: "/placeholder.svg?height=80&width=64",
      votes: 430,
      comments: 89,
      rating: 4.5,
      genres: ["Fantasy", "Romance", "Adventure"],
      hasGiveaway: false,
      publishDate: "Mar 2024",
      rank: 1,
    },
    {
      id: "2",
      type: "book" as const,
      title: "The Last Garden",
      author: "Maria Santos",
      description: "Hope blooms in the most unexpected places in this post-apocalyptic tale that reminds us of the resilience of the human spirit.",
      cover: "/placeholder.svg?height=80&width=64",
      votes: 308,
      comments: 156,
      rating: 4.7,
      genres: ["Post-Apocalyptic", "Dystopian", "Hope"],
      hasGiveaway: true,
      publishDate: "Feb 2024",
      rank: 2,
    },
  ] as BookItem[],
  authors: [
    {
      id: "3",
      type: "author" as const,
      name: "Elena Rodriguez",
      bio: "Fantasy romance author who transports readers to magical worlds filled with adventure and love. Known for her vivid world-building and compelling characters that stay with readers long after the final page.",
      avatar: "/placeholder.svg?height=64&width=64",
      votes: 418,
      books: 5,
      followers: 23500,
      joinedDate: "Jul 2018",
      rank: 3,
    },
    {
      id: "4",
      type: "author" as const,
      name: "Sarah Johnson",
      bio: "Bestselling author of contemporary fiction with over 3 million books sold worldwide. Her work has been translated into 15 languages and adapted for screen.",
      avatar: "/placeholder.svg?height=64&width=64",
      votes: 182,
      books: 8,
      followers: 45200,
      joinedDate: "Mar 2020",
      rank: 4,
    },
  ] as AuthorItem[],
  giveaways: [
    {
      id: "1",
      title: "Win 'Ocean's Echo' - Fantasy Romance",
      description: "Enter to win a signed copy of this magical tale of love and adventure beneath the waves.",
      book: {
        id: "1",
        title: "Ocean's Echo",
        author: "Elena Rodriguez",
        cover_image_url: "/placeholder.svg?height=80&width=64",
        genre: "Fantasy",
        description: "A magical tale of love and adventure beneath the waves."
      },
      author: {
        id: "1",
        name: "Elena Rodriguez",
        avatar_url: "/placeholder.svg?height=64&width=64",
        bio: "Fantasy romance author who transports readers to magical worlds."
      },
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      max_entries: 1000,
      entry_count: 156,
      number_of_winners: 5,
      prize_description: "Signed copy of Ocean's Echo",
      rules: "Open to US residents 18+. One entry per person.",
      status: 'active' as const,
      is_featured: true,
      created_at: "2024-01-01",
      updated_at: "2024-01-01"
    },
    {
      id: "2",
      title: "The Last Garden - Post-Apocalyptic Giveaway",
      description: "Win a copy of this hope-filled post-apocalyptic tale.",
      book: {
        id: "2",
        title: "The Last Garden",
        author: "Maria Santos",
        cover_image_url: "/placeholder.svg?height=80&width=64",
        genre: "Post-Apocalyptic",
        description: "Hope blooms in the most unexpected places."
      },
      author: {
        id: "2",
        name: "Maria Santos",
        avatar_url: "/placeholder.svg?height=64&width=64",
        bio: "Post-apocalyptic fiction writer who explores themes of hope."
      },
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      max_entries: 500,
      entry_count: 89,
      number_of_winners: 3,
      prize_description: "Digital copy of The Last Garden",
      rules: "Open worldwide 18+. One entry per person.",
      status: 'active' as const,
      is_featured: false,
      created_at: "2024-01-01",
      updated_at: "2024-01-01"
    }
  ]
}

// Fallback data for when API is unavailable
export const FALLBACK_DATA = MOCK_DATA
