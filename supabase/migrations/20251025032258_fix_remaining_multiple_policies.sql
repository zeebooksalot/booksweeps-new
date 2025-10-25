-- Fix Remaining Multiple Permissive Policies
-- Consolidates overlapping policies to eliminate multiple permissive policy warnings

-- ============================================================================
-- 1. FIX ANALYTICS_EVENTS - Remove overlapping SELECT policy
-- ============================================================================

-- Drop the overlapping "Users can view own analytics" policy since it's covered by the consolidated policy
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_events;

-- ============================================================================
-- 2. FIX GIVEAWAYS - Consolidate SELECT policies
-- ============================================================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "Anyone can view giveaways" ON giveaways;
DROP POLICY IF EXISTS "Service role and users can manage giveaways" ON giveaways;

-- Create a single consolidated policy that handles all cases
CREATE POLICY "Giveaways access policy" ON giveaways
  USING (
    -- Service role can do everything
    (SELECT auth.role()) = 'service_role' OR
    -- Authenticated users can manage their own giveaways
    ((SELECT auth.role()) = 'authenticated' AND (SELECT auth.uid())::text = (author_data->>'user_id')) OR
    -- Anyone can view active or ended giveaways
    (status = 'active' OR status = 'ended')
  );

-- ============================================================================
-- 3. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "Service role and authenticated users can manage analytics" ON analytics_events 
IS 'Single consolidated RLS policy - no multiple permissive policies';

COMMENT ON POLICY "Giveaways access policy" ON giveaways 
IS 'Single consolidated RLS policy - no multiple permissive policies';
