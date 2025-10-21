import { z } from 'zod'

// Common validation schemas
export const UUIDSchema = z.string().uuid()
export const EmailSchema = z.string().email()
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10)
})

// Book-related schemas
export const CreateBookSchema = z.object({
  user_id: UUIDSchema,
  title: z.string().min(1).max(500),
  author: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  cover_image_url: z.string().url().optional(),
  publisher: z.string().max(200).optional(),
  published_date: z.string().optional(),
  genre: z.string().max(100).optional(),
  page_count: z.number().int().min(1).optional(),
  language: z.string().max(50).default('English'),
  isbn: z.string().max(20).optional(),
  asin: z.string().max(20).optional(),
  pen_name_id: UUIDSchema.optional(),
  series_id: UUIDSchema.optional(),
  series_order: z.number().int().min(1).optional()
})

export const UpdateBookSchema = CreateBookSchema.partial().omit({ user_id: true })

// Author/Pen Name schemas
export const CreatePenNameSchema = z.object({
  user_id: UUIDSchema,
  name: z.string().min(1).max(200),
  bio: z.string().max(2000).optional(),
  genre: z.string().max(100).optional(),
  website: z.string().url().optional(),
  avatar_url: z.string().url().optional(),
  social_links: z.record(z.string()).optional()
})

export const UpdatePenNameSchema = CreatePenNameSchema.partial().omit({ user_id: true })

// Comment schemas
export const CreateCommentSchema = z.object({
  user_id: UUIDSchema,
  book_id: UUIDSchema,
  content: z.string().min(1).max(2000)
})

export const CommentQuerySchema = z.object({
  book_id: UUIDSchema,
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10)
})

// Vote schemas
export const CreateVoteSchema = z.object({
  user_id: UUIDSchema,
  vote_type: z.enum(['upvote', 'downvote']),
  book_id: UUIDSchema.optional(),
  pen_name_id: UUIDSchema.optional()
}).refine(
  (data) => data.book_id || data.pen_name_id,
  {
    message: "Either book_id or pen_name_id must be provided"
  }
)

export const DeleteVoteSchema = z.object({
  user_id: UUIDSchema,
  book_id: UUIDSchema.optional(),
  pen_name_id: UUIDSchema.optional()
}).refine(
  (data) => data.book_id || data.pen_name_id,
  {
    message: "Either book_id or pen_name_id must be provided"
  }
)

// Entry schemas
export const CreateEntrySchema = z.object({
  campaign_id: UUIDSchema,
  email: EmailSchema,
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  entry_method: z.string().min(1).max(100),
  entry_data: z.record(z.any()).optional(),
  marketing_opt_in: z.boolean().default(false),
  referral_code: z.string().max(50).optional(),
  referred_by: z.string().max(100).optional()
})

export const EntryQuerySchema = z.object({
  campaign_id: UUIDSchema,
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10)
})

// Campaign schemas
export const CreateCampaignSchema = z.object({
  user_id: UUIDSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  book_id: UUIDSchema.optional(),
  pen_name_id: UUIDSchema.optional(),
  campaign_type: z.string().min(1).max(100),
  prize_description: z.string().max(1000).optional(),
  rules: z.string().max(2000).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  max_entries: z.number().int().min(1).optional(),
  number_of_winners: z.number().int().min(1).optional(),
  target_entries: z.number().int().min(1).optional(),
  duration: z.number().int().min(1).optional(),
  entry_methods: z.array(z.string()).optional(),
  selected_books: z.array(UUIDSchema).optional(),
  gdpr_checkbox: z.boolean().optional(),
  custom_thank_you_page: z.string().max(2000).optional(),
  social_media_config: z.record(z.any()).optional()
})

export const CampaignQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  user_id: UUIDSchema.optional(),
  status: z.string().optional(),
  search: z.string().optional()
})

// Reader magnet schemas
export const CreateReaderMagnetSchema = z.object({
  user_id: UUIDSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  cover_image_url: z.string().url().optional(),
  genre: z.string().max(100).optional(),
  author_name: z.string().min(1).max(200),
  file_url: z.string().url(),
  download_limit: z.number().int().min(1).optional()
})

export const ReaderMagnetQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  user_id: UUIDSchema.optional(),
  genre: z.string().optional(),
  search: z.string().optional()
})

// Author query schemas
export const AuthorQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(12),
  search: z.string().optional(),
  genre: z.string().optional(),
  sortBy: z.enum(['name', 'books', 'recent', 'popularity']).default('popularity')
})

// Book query schemas
export const BookQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  genre: z.string().optional(),
  search: z.string().optional(),
  user_id: UUIDSchema.optional(),
  sortBy: z.string().default('created_at')
})

// Common field validation schemas
export const RequiredFieldsSchema = z.object({
  user_id: UUIDSchema,
  title: z.string().min(1),
  description: z.string().min(1)
})

// Search and filter schemas
export const SearchSchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(['books', 'authors', 'campaigns']).optional(),
  genre: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10)
})

// File upload schemas
export const FileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimetype: z.string().min(1).max(100),
  size: z.number().int().min(1).max(10 * 1024 * 1024), // 10MB max
  content: z.string().min(1) // base64 encoded
})

// Rate limiting schemas
export const RateLimitSchema = z.object({
  identifier: z.string().min(1),
  action: z.string().min(1),
  limit: z.number().int().min(1),
  window: z.number().int().min(1) // in seconds
})

// Export commonly used validation functions
export function validateUUID(uuid: string): string {
  return UUIDSchema.parse(uuid)
}

export function validateEmail(email: string): string {
  return EmailSchema.parse(email)
}

export function validatePagination(page: number, limit: number) {
  return PaginationSchema.parse({ page, limit })
}
