-- Fix function search path security with correct function signatures
-- This migration adds SET search_path = 'public' to functions with their actual signatures

-- ============================================================================
-- 1. FUNCTIONS WITH CORRECT SIGNATURES - Add search_path security
-- ============================================================================

-- Add search_path to get_library_stats (no parameters, returns json)
ALTER FUNCTION public.get_library_stats() SET search_path = 'public';

-- Add search_path to get_reader_library (no parameters, returns table)
ALTER FUNCTION public.get_reader_library() SET search_path = 'public';

-- Add search_path to update_reading_status (with correct parameter signature)
ALTER FUNCTION public.update_reading_status(uuid, numeric, integer, integer, jsonb) SET search_path = 'public';

-- ============================================================================
-- 2. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION public.get_library_stats() IS 'Analytics function with secure search_path';
COMMENT ON FUNCTION public.get_reader_library() IS 'User function with secure search_path';
COMMENT ON FUNCTION public.update_reading_status(uuid, numeric, integer, integer, jsonb) IS 'User function with secure search_path';
