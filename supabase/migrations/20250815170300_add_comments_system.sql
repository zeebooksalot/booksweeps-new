-- Add comments system
-- This migration adds a complete comments system with:
-- 1. Comments table for storing individual comments
-- 2. Comments count field in books table
-- 3. Function to increment comment counts
-- 4. Row Level Security policies

-- Add comments_count field to books table
ALTER TABLE "public"."books" 
ADD COLUMN "comments_count" integer DEFAULT 0;

-- Create comments table
CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "book_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."comments" OWNER TO "postgres";

-- Add foreign key constraints
ALTER TABLE "public"."comments" 
ADD CONSTRAINT "comments_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."comments" 
ADD CONSTRAINT "comments_book_id_fkey" 
FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX "comments_book_id_idx" ON "public"."comments" ("book_id");
CREATE INDEX "comments_user_id_idx" ON "public"."comments" ("user_id");
CREATE INDEX "comments_created_at_idx" ON "public"."comments" ("created_at");

-- Create function to increment book comments count
CREATE OR REPLACE FUNCTION "public"."increment_book_comments"("book_id_param" "uuid")
RETURNS void
LANGUAGE "plpgsql"
SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
BEGIN
  UPDATE books 
  SET comments_count = comments_count + 1
  WHERE id = book_id_param;
END;
$$;

-- Create function to decrement book comments count
CREATE OR REPLACE FUNCTION "public"."decrement_book_comments"("book_id_param" "uuid")
RETURNS void
LANGUAGE "plpgsql"
SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
BEGIN
  UPDATE books 
  SET comments_count = GREATEST(comments_count - 1, 0)
  WHERE id = book_id_param;
END;
$$;

-- Create trigger function to automatically update comment counts
CREATE OR REPLACE FUNCTION "public"."update_book_comment_count"()
RETURNS "trigger"
LANGUAGE "plpgsql"
SET "search_path" TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM increment_book_comments(NEW.book_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM decrement_book_comments(OLD.book_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger to automatically update comment counts
CREATE TRIGGER "update_book_comment_count_trigger"
  AFTER INSERT OR DELETE ON "public"."comments"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."update_book_comment_count"();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION "public"."update_comments_updated_at"()
RETURNS "trigger"
LANGUAGE "plpgsql"
SET "search_path" TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER "update_comments_updated_at_trigger"
  BEFORE UPDATE ON "public"."comments"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."update_comments_updated_at"();

-- Enable Row Level Security
ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for comments
-- Anyone can view comments
CREATE POLICY "Anyone can view comments" ON "public"."comments"
  FOR SELECT USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Authenticated users can insert comments" ON "public"."comments"
  FOR INSERT WITH CHECK (
    (SELECT auth.uid()) = user_id AND 
    (SELECT auth.uid()) IS NOT NULL
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON "public"."comments"
  FOR UPDATE USING (
    (SELECT auth.uid()) = user_id
  ) WITH CHECK (
    (SELECT auth.uid()) = user_id
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON "public"."comments"
  FOR DELETE USING (
    (SELECT auth.uid()) = user_id
  );

-- Add comments to the database types
COMMENT ON TABLE "public"."comments" IS 'Stores user comments on books';
COMMENT ON COLUMN "public"."comments"."user_id" IS 'ID of the user who made the comment';
COMMENT ON COLUMN "public"."comments"."book_id" IS 'ID of the book being commented on';
COMMENT ON COLUMN "public"."comments"."content" IS 'The comment text content';
COMMENT ON COLUMN "public"."books"."comments_count" IS 'Number of comments on this book';
