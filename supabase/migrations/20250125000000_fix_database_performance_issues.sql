-- Fix Database Performance Issues
-- Addresses auth RLS initialization plan, multiple permissive policies, and duplicate indexes

-- ============================================================================
-- 1. FIX AUTH RLS INITIALIZATION PLAN ISSUES
-- ============================================================================

-- Drop existing policies that have auth function performance issues
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_events;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Service role can manage book metadata" ON book_metadata;
DROP POLICY IF EXISTS "Authenticated users can create giveaways" ON giveaways;
DROP POLICY IF EXISTS "Service role can manage giveaways" ON giveaways;
DROP POLICY IF EXISTS "Users can update their own giveaways" ON giveaways;
DROP POLICY IF EXISTS "Service role can manage entries" ON giveaway_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON giveaway_entries;
DROP POLICY IF EXISTS "Users can view their own entries" ON giveaway_entries;

-- Recreate analytics_events policies with optimized auth functions
CREATE POLICY "Users can view own analytics" ON analytics_events
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid()) = user_id) OR (user_id IS NULL));

-- Recreate users policies with optimized auth functions
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE TO authenticated 
  USING (((SELECT auth.uid()) = id) AND (deleted_at IS NULL)) 
  WITH CHECK (((SELECT auth.uid()) = id) AND (deleted_at IS NULL));

CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT TO authenticated 
  USING (((SELECT auth.uid()) = id) AND (deleted_at IS NULL));

-- Recreate book_metadata policies with optimized auth functions
CREATE POLICY "Service role can manage book metadata" ON book_metadata
  USING ((SELECT auth.role()) = 'service_role');

-- Recreate giveaways policies with optimized auth functions
CREATE POLICY "Service role can manage giveaways" ON giveaways
  USING ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Authenticated users can create giveaways" ON giveaways
  FOR INSERT WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Users can update their own giveaways" ON giveaways
  FOR UPDATE USING ((SELECT auth.uid())::text = (author_data->>'user_id'));

-- Recreate giveaway_entries policies with optimized auth functions
CREATE POLICY "Service role can manage entries" ON giveaway_entries
  USING ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Users can delete their own entries" ON giveaway_entries
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can view their own entries" ON giveaway_entries
  FOR SELECT USING (((SELECT auth.uid()) = user_id) OR (user_id IS NULL));

-- ============================================================================
-- 2. CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- ============================================================================

-- For analytics_events: Keep the existing "Authenticated users can insert analytics" policy
-- (No changes needed as it's already optimized)

-- For giveaway_entries: Keep the existing "Anyone can create entries" policy
-- (No changes needed as it's already optimized)

-- ============================================================================
-- 3. REMOVE DUPLICATE INDEX
-- ============================================================================

-- Remove duplicate unique constraint on book_positions table
-- Keep book_positions_book_id_unique, drop book_positions_book_id_key
ALTER TABLE book_positions DROP CONSTRAINT IF EXISTS book_positions_book_id_key;

-- ============================================================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Users can view own analytics" ON analytics_events 
IS 'Optimized RLS policy with SELECT subqueries for better performance';

COMMENT ON POLICY "Users can update their own profile" ON users 
IS 'Optimized RLS policy with SELECT subqueries for better performance';

COMMENT ON POLICY "Users can view their own profile" ON users 
IS 'Optimized RLS policy with SELECT subqueries for better performance';

COMMENT ON POLICY "Service role can manage book metadata" ON book_metadata 
IS 'Optimized RLS policy with SELECT subqueries for better performance';

COMMENT ON POLICY "Service role can manage giveaways" ON giveaways 
IS 'Optimized RLS policy with SELECT subqueries for better performance';

COMMENT ON POLICY "Authenticated users can create giveaways" ON giveaways 
IS 'Optimized RLS policy with SELECT subqueries for better performance';

COMMENT ON POLICY "Users can update their own giveaways" ON giveaways 
IS 'Optimized RLS policy with SELECT subqueries for better performance';

COMMENT ON POLICY "Service role can manage entries" ON giveaway_entries 
IS 'Optimized RLS policy with SELECT subqueries for better performance';

COMMENT ON POLICY "Users can delete their own entries" ON giveaway_entries 
IS 'Optimized RLS policy with SELECT subqueries for better performance';

COMMENT ON POLICY "Users can view their own entries" ON giveaway_entries 
IS 'Optimized RLS policy with SELECT subqueries for better performance';