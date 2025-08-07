# BookSweeps Database Schema Documentation

## Overview
This document provides comprehensive documentation of the BookSweeps database schema, including tables, relationships, constraints, indexes, and key functions.

## Table of Contents
- [Users & Authentication](#users--authentication)
- [Books & Content](#books--content)
- [Campaigns & Giveaways](#campaigns--giveaways)
- [Reader Features](#reader-features)
- [User Management](#user-management)
- [Key Functions](#key-functions)
- [Indexes & Performance](#indexes--performance)
- [Row Level Security](#row-level-security)

---

## Users & Authentication

### `users` Table
The core user table that supports dual accounts (author/reader/both).

```sql
CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text" DEFAULT ''::"text",
    "last_name" "text" DEFAULT ''::"text",
    "display_name" "text" DEFAULT ''::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_type" "text" DEFAULT 'author'::"text",
    "auth_source" "text",
    "favorite_genres" "text"[] DEFAULT '{}'::"text"[],
    "reading_preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "giveaway_reminders" boolean DEFAULT true,
    CONSTRAINT "users_auth_source_check" CHECK (("auth_source" = ANY (ARRAY['crm'::"text", 'talk'::"text"]))),
    CONSTRAINT "users_user_type_check" CHECK (("user_type" = ANY (ARRAY['author'::"text", 'reader'::"text", 'both'::"text"])))
);
```

**User Types:**
- `'author'` - Author accounts with publishing capabilities
- `'reader'` - Reader accounts for consuming content
- `'both'` - Dual accounts with both author and reader functionality

**Key Fields:**
- `user_type` - Determines account capabilities and UI access
- `favorite_genres` - Array of preferred book genres (for readers)
- `reading_preferences` - JSON field for reader preferences
- `giveaway_reminders` - Email notification settings

### `user_settings` Table
User preferences and configuration settings.

```sql
CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "theme" "text" DEFAULT 'light'::"text",
    "font" "text" DEFAULT 'default'::"text",
    "sidebar_collapsed" boolean DEFAULT false,
    "keyboard_shortcuts_enabled" boolean DEFAULT true,
    "email_notifications" boolean DEFAULT true,
    "marketing_emails" boolean DEFAULT true,
    "weekly_reports" boolean DEFAULT false,
    "language" "text" DEFAULT 'en'::"text",
    "timezone" "text" DEFAULT 'UTC'::"text",
    "usage_analytics" boolean DEFAULT true,
    "auto_save_drafts" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    -- Email service integrations
    "mailerlite_group_id" "text",
    "mailerlite_enabled" boolean DEFAULT false,
    "mailchimp_list_id" "text",
    "mailchimp_enabled" boolean DEFAULT false,
    "convertkit_form_id" "text",
    "convertkit_enabled" boolean DEFAULT false,
    "klaviyo_list_id" "text",
    "klaviyo_enabled" boolean DEFAULT false,
    "authorletters_list_id" "text",
    "authorletters_enabled" boolean DEFAULT false,
    -- Encrypted API keys
    "mailerlite_api_key_encrypted" "jsonb",
    "mailchimp_api_key_encrypted" "jsonb",
    "convertkit_api_key_encrypted" "jsonb",
    "klaviyo_api_key_encrypted" "jsonb",
    "authorletters_api_key_encrypted" "jsonb"
);
```

### `user_entitlements` Table
User plan limits and feature access.

```sql
CREATE TABLE IF NOT EXISTS "public"."user_entitlements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "plan_name" "text" DEFAULT 'free'::"text",
    "max_campaigns" integer DEFAULT 1,
    "max_books" integer DEFAULT 3,
    "max_pen_names" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
```

---

## Books & Content

### `books` Table
Book information and metadata.

```sql
CREATE TABLE IF NOT EXISTS "public"."books" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "isbn" "text",
    "title" "text" NOT NULL,
    "author" "text" NOT NULL,
    "description" "text",
    "cover_image_url" "text",
    "publisher" "text",
    "published_date" "date",
    "genre" "text",
    "page_count" integer,
    "language" "text" DEFAULT 'English'::"text",
    "source" "text" DEFAULT 'manual'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "pen_name_id" "uuid",
    "asin" "text",
    "status" "text" DEFAULT 'active'::"text",
    "series_id" "uuid",
    "series_order" integer,
    "upvotes_count" integer DEFAULT 0,
    "downvotes_count" integer DEFAULT 0
);
```

### `pen_names` Table
Author pen names and profiles.

```sql
CREATE TABLE IF NOT EXISTS "public"."pen_names" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "bio" "text",
    "website" "text",
    "social_links" "jsonb" DEFAULT '{}'::"jsonb",
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text",
    "avatar_url" "text",
    "genre" "text",
    "upvotes_count" integer DEFAULT 0,
    "downvotes_count" integer DEFAULT 0
);
```

### `series` Table
Book series information.

```sql
CREATE TABLE IF NOT EXISTS "public"."series" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
```

### `book_files` Table
Book file attachments and downloads.

```sql
CREATE TABLE IF NOT EXISTS "public"."book_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "book_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size" bigint,
    "file_type" "text" DEFAULT 'book'::"text",
    "download_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
```

### `book_delivery_methods` Table
Book delivery and download methods.

```sql
CREATE TABLE IF NOT EXISTS "public"."book_delivery_methods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "book_id" "uuid" NOT NULL,
    "method_type" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
```

---

## Campaigns & Giveaways

### `campaigns` Table
Giveaway and promotional campaigns.

```sql
CREATE TABLE IF NOT EXISTS "public"."campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "book_id" "uuid",
    "status" "text" DEFAULT 'draft'::"text",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "max_entries" integer,
    "entry_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "pen_name_id" "uuid",
    "campaign_type" "text" DEFAULT 'giveaway'::"text",
    "prize_description" "text",
    "rules" "text",
    "book_cover_url" "text",
    "book_genre" "text",
    "book_description" "text",
    "author_name" "text",
    "winner_selection_date" timestamp with time zone,
    "winner_announcement_date" timestamp with time zone,
    "is_featured" boolean DEFAULT false,
    "social_sharing_message" "text",
    "thank_you_message" "text",
    "minimum_age" integer DEFAULT 18,
    "eligibility_countries" "text"[],
    "campaign_genre" "text",
    "prize_value" numeric,
    "prize_format" "text",
    "number_of_winners" integer DEFAULT 1,
    "target_entries" integer DEFAULT 100,
    "duration" integer,
    "entry_methods" "text"[],
    "selected_books" "text"[],
    "gdpr_checkbox" boolean DEFAULT false,
    "custom_thank_you_page" "text",
    "social_media_config" "jsonb" DEFAULT '{}'::"jsonb"
);
```

### `entry_methods` Table
Available entry methods for campaigns.

```sql
CREATE TABLE IF NOT EXISTS "public"."entry_methods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
```

### `campaign_entry_methods` Table
Junction table linking campaigns to entry methods.

```sql
CREATE TABLE IF NOT EXISTS "public"."campaign_entry_methods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "entry_method_id" "uuid" NOT NULL,
    "is_required" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
```

### `reader_entries` Table
Reader entries for campaigns.

```sql
CREATE TABLE IF NOT EXISTS "public"."reader_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "entry_method" "text" NOT NULL,
    "entry_data" "jsonb" DEFAULT '{}'::"jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "verified" boolean DEFAULT false,
    "status" "text" DEFAULT 'pending'::"text",
    "marketing_opt_in" boolean DEFAULT false,
    "referral_code" "text",
    "referred_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid"
);
```

---

## Reader Features

### `reader_library` Table
Reader's personal book library.

```sql
CREATE TABLE IF NOT EXISTS "public"."reader_library" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reader_id" "uuid" NOT NULL,
    "book_id" "uuid" NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'added'::"text"
);
```

### `reader_preferences` Table
Reader-specific preferences and settings.

```sql
CREATE TABLE IF NOT EXISTS "public"."reader_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "favorite_genres" "text"[] DEFAULT '{}'::"text"[],
    "reading_preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "email_notifications" boolean DEFAULT true,
    "giveaway_reminders" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
```

### `reading_progress` Table
Reader's reading progress tracking.

```sql
CREATE TABLE IF NOT EXISTS "public"."reading_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "book_id" "uuid" NOT NULL,
    "current_page" integer DEFAULT 0,
    "total_pages" integer,
    "progress_percentage" numeric DEFAULT 0,
    "status" "text" DEFAULT 'reading'::"text",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "finished_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
```

### `reader_deliveries` Table
Book delivery tracking for readers.

```sql
CREATE TABLE IF NOT EXISTS "public"."reader_deliveries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reader_id" "uuid" NOT NULL,
    "book_id" "uuid" NOT NULL,
    "delivery_method_id" "uuid" NOT NULL,
    "delivery_status" "text" DEFAULT 'pending'::"text",
    "delivered_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);
```

### `reader_download_logs` Table
Download tracking for analytics.

```sql
CREATE TABLE IF NOT EXISTS "public"."reader_download_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reader_id" "uuid",
    "book_id" "uuid" NOT NULL,
    "file_id" "uuid",
    "download_date" timestamp with time zone DEFAULT "now"(),
    "ip_address" "inet",
    "user_agent" "text",
    "referrer" "text"
);
```

---

## User Management

### `votes` Table
User voting system for books and pen names.

```sql
CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "book_id" "uuid",
    "pen_name_id" "uuid",
    "vote_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "votes_vote_type_check" CHECK (("vote_type" = ANY (ARRAY['upvote'::"text", 'downvote'::"text"])))
);
```

---

## Key Functions

### User Management Functions

#### `update_user_type(target_user_id, new_user_type)`
Updates a user's type (author/reader/both).

#### `update_reader_preferences(target_user_id, preferences)`
Updates reader-specific preferences.

#### `get_user_dashboard_data(target_user_id)`
Returns comprehensive dashboard data for a user.

#### `get_user_settings(target_user_id)`
Retrieves user settings and configuration.

#### `update_user_settings(target_user_id, settings_data)`
Updates user settings.

### Campaign Functions

#### `check_campaign_max_entries(campaign_id)`
Checks if a campaign can accept more entries.

#### `get_campaign_stats(campaign_id)`
Returns campaign statistics and analytics.

#### `is_campaign_accepting_entries(campaign_id)`
Checks if a campaign is currently accepting entries.

### Book Management Functions

#### `get_pen_names_with_counts(target_user_id)`
Returns pen names with book and campaign counts.

#### `get_pen_name_book_count(pen_name_id)`
Returns the number of books for a pen name.

#### `get_pen_name_campaign_count(pen_name_id)`
Returns the number of campaigns for a pen name.

### Voting Functions

#### `increment_book_upvotes(book_id_param)`
Increments book upvote count.

#### `decrement_book_upvotes(book_id_param)`
Decrements book upvote count.

#### `increment_pen_name_upvotes(pen_name_id_param)`
Increments pen name upvote count.

#### `decrement_pen_name_upvotes(pen_name_id_param)`
Decrements pen name upvote count.

### Utility Functions

#### `generate_delivery_slug(title, book_id)`
Generates unique delivery slugs.

#### `generate_storage_path(user_id, book_id, file_name, file_type)`
Generates storage paths for file uploads.

#### `update_updated_at_column()`
Trigger function to update the updated_at timestamp.

---

## Indexes & Performance

### Primary Indexes
- `users_pkey` - Primary key on users.id
- `books_pkey` - Primary key on books.id
- `campaigns_pkey` - Primary key on campaigns.id
- `pen_names_pkey` - Primary key on pen_names.id

### Performance Indexes
- `users_user_type_idx` - B-tree index on user_type
- `users_favorite_genres_idx` - GIN index on favorite_genres (for readers/both)
- `users_auth_source_idx` - B-tree index on auth_source
- `books_user_id_idx` - B-tree index on user_id
- `campaigns_user_id_idx` - B-tree index on user_id
- `pen_names_user_id_idx` - B-tree index on user_id

### Unique Constraints
- `users_email_key` - Unique email addresses
- `book_delivery_methods_slug_key` - Unique delivery slugs
- `reader_entries_campaign_id_user_id_entry_method_key` - Unique entries per user per campaign

---

## Row Level Security

### User Access Policies
- Users can view their own profile
- Users can update their own profile
- Users can view their own books, campaigns, pen names
- Users can insert/update/delete their own content
- Users can view their own settings and entitlements

### Reader-Specific Policies
- Readers can add books to their library
- Readers can update their reading progress
- Readers can insert their preferences
- Readers can view their own deliveries

### Campaign Policies
- Users and campaign owners can view entries
- Users can insert their own entries
- Users can view their own campaign entries

---

## Foreign Key Relationships

### Core Relationships
- `users.id` → `auth.users.id` (CASCADE DELETE)
- `books.user_id` → `auth.users.id` (CASCADE DELETE)
- `campaigns.user_id` → `auth.users.id` (CASCADE DELETE)
- `pen_names.user_id` → `auth.users.id` (CASCADE DELETE)

### Content Relationships
- `books.pen_name_id` → `pen_names.id`
- `books.series_id` → `series.id`
- `book_files.book_id` → `books.id`
- `book_delivery_methods.book_id` → `books.id`

### Campaign Relationships
- `campaigns.book_id` → `books.id`
- `campaigns.pen_name_id` → `pen_names.id`
- `reader_entries.campaign_id` → `campaigns.id`
- `reader_entries.user_id` → `users.id`

### Reader Relationships
- `reader_library.reader_id` → `users.id`
- `reader_preferences.user_id` → `users.id`
- `reading_progress.user_id` → `users.id`
- `reader_deliveries.reader_id` → `users.id`

---

## Triggers

### Automatic Timestamps
- `update_users_updated_at` - Updates updated_at on user changes
- `update_books_updated_at` - Updates updated_at on book changes
- `update_campaigns_updated_at` - Updates updated_at on campaign changes
- `update_pen_names_updated_at` - Updates updated_at on pen name changes

### Business Logic Triggers
- `create_user_entitlements_trigger` - Creates default entitlements for new users
- `create_user_settings_trigger` - Creates default settings for new users
- `update_campaign_entry_count` - Updates entry count when entries are added/removed
- `increment_download_count` - Increments download count for files
- `ensure_single_primary_pen_name` - Ensures only one primary pen name per user

---

## Data Types & Constraints

### User Types
- `'author'` - Author accounts
- `'reader'` - Reader accounts
- `'both'` - Dual accounts

### Auth Sources
- `'crm'` - CRM integration
- `'talk'` - Talk integration

### Vote Types
- `'upvote'` - Positive vote
- `'downvote'` - Negative vote

### Campaign Status
- `'draft'` - Campaign in draft
- `'active'` - Active campaign
- `'paused'` - Paused campaign
- `'ended'` - Ended campaign

### Book Status
- `'active'` - Active book
- `'draft'` - Draft book
- `'archived'` - Archived book

---

## Notes

1. **Dual Account Support**: The `user_type` field with `'both'` option enables seamless switching between author and reader functionality.

2. **Cross-Domain Authentication**: The schema supports cross-domain authentication through Supabase Auth integration.

3. **Scalability**: Indexes and constraints are optimized for performance with large datasets.

4. **Security**: Row Level Security (RLS) ensures users can only access their own data.

5. **Flexibility**: JSON fields allow for extensible data structures without schema changes.

6. **Analytics**: Built-in tracking for downloads, votes, and user engagement.

This schema provides a robust foundation for the BookSweeps platform, supporting both author and reader functionality with proper security and performance considerations. 