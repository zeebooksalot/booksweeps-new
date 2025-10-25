-- Consolidate Multiple Permissive Policies
-- Fixes remaining multiple permissive policy issues for better performance

-- ============================================================================
-- 1. CONSOLIDATE ANALYTICS_EVENTS POLICIES
-- ============================================================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "Authenticated users can insert analytics" ON analytics_events;
DROP POLICY IF EXISTS "Service role can manage analytics" ON analytics_events;

-- Create consolidated policies
CREATE POLICY "Service role and authenticated users can manage analytics" ON analytics_events
  USING (
    (SELECT auth.role()) = 'service_role' OR
    (SELECT auth.role()) = 'authenticated'
  );

-- ============================================================================
-- 2. CONSOLIDATE BOOK_METADATA POLICIES
-- ============================================================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "Book metadata is viewable by everyone" ON book_metadata;
DROP POLICY IF EXISTS "Service role can manage book metadata" ON book_metadata;

-- Create consolidated policy
CREATE POLICY "Service role can manage, everyone can view book metadata" ON book_metadata
  USING (
    (SELECT auth.role()) = 'service_role' OR true
  );

-- ============================================================================
-- 3. CONSOLIDATE GIVEAWAY_ENTRIES POLICIES
-- ============================================================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "Anyone can create entries" ON giveaway_entries;
DROP POLICY IF EXISTS "Service role can manage entries" ON giveaway_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON giveaway_entries;
DROP POLICY IF EXISTS "Users can view their own entries" ON giveaway_entries;

-- Create consolidated policies
CREATE POLICY "Service role and users can manage entries" ON giveaway_entries
  USING (
    (SELECT auth.role()) = 'service_role' OR
    (SELECT auth.uid()) = user_id OR user_id IS NULL
  );

-- ============================================================================
-- 4. CONSOLIDATE GIVEAWAYS POLICIES
-- ============================================================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "Anyone can view active giveaways" ON giveaways;
DROP POLICY IF EXISTS "Anyone can view ended giveaways" ON giveaways;
DROP POLICY IF EXISTS "Service role can manage giveaways" ON giveaways;
DROP POLICY IF EXISTS "Authenticated users can create giveaways" ON giveaways;
DROP POLICY IF EXISTS "Users can update their own giveaways" ON giveaways;

-- Create consolidated policies
CREATE POLICY "Service role and users can manage giveaways" ON giveaways
  USING (
    (SELECT auth.role()) = 'service_role' OR
    ((SELECT auth.role()) = 'authenticated' AND (SELECT auth.uid())::text = (author_data->>'user_id'))
  );

CREATE POLICY "Anyone can view giveaways" ON giveaways
  FOR SELECT USING (
    status = 'active' OR status = 'ended'
  );

-- ============================================================================
-- 5. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Service role and authenticated users can manage analytics" ON analytics_events 
IS 'Consolidated RLS policy to reduce multiple permissive policy overhead';

COMMENT ON POLICY "Service role can manage, everyone can view book metadata" ON book_metadata 
IS 'Consolidated RLS policy to reduce multiple permissive policy overhead';

COMMENT ON POLICY "Service role and users can manage entries" ON giveaway_entries 
IS 'Consolidated RLS policy to reduce multiple permissive policy overhead';

COMMENT ON POLICY "Service role and users can manage giveaways" ON giveaways 
IS 'Consolidated RLS policy to reduce multiple permissive policy overhead';

COMMENT ON POLICY "Anyone can view giveaways" ON giveaways 
IS 'Consolidated RLS policy to reduce multiple permissive policy overhead';
