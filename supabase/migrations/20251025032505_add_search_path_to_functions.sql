-- Add search_path security to functions mentioned in linter output
-- This migration adds SET search_path = 'public' to fix security warnings

-- ============================================================================
-- 1. FUNCTIONS FROM LINTER OUTPUT - Add search_path security
-- ============================================================================

-- Add search_path to update_book_metadata_updated_at
ALTER FUNCTION public.update_book_metadata_updated_at() SET search_path = 'public';

-- Add search_path to generate_slug
ALTER FUNCTION public.generate_slug(TEXT) SET search_path = 'public';

-- Add search_path to set_pen_name_slug
ALTER FUNCTION public.set_pen_name_slug() SET search_path = 'public';

-- Add search_path to update_giveaway_entry_count
ALTER FUNCTION public.update_giveaway_entry_count() SET search_path = 'public';

-- Add search_path to soft_delete_user
ALTER FUNCTION public.soft_delete_user(UUID) SET search_path = 'public';

-- Add search_path to recover_user
ALTER FUNCTION public.recover_user(UUID) SET search_path = 'public';

-- Add search_path to permanently_delete_expired_users
ALTER FUNCTION public.permanently_delete_expired_users() SET search_path = 'public';

-- Add search_path to cleanup_expired_accounts
ALTER FUNCTION public.cleanup_expired_accounts() SET search_path = 'public';

-- Add search_path to manual_cleanup_expired_accounts
ALTER FUNCTION public.manual_cleanup_expired_accounts() SET search_path = 'public';

-- Add search_path to update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';

-- Add search_path to update_reader_library_timestamp
ALTER FUNCTION public.update_reader_library_timestamp() SET search_path = 'public';

-- ============================================================================
-- 2. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION public.update_book_metadata_updated_at() IS 'Trigger function with secure search_path';
COMMENT ON FUNCTION public.generate_slug(TEXT) IS 'Utility function with secure search_path';
COMMENT ON FUNCTION public.set_pen_name_slug() IS 'Trigger function with secure search_path';
COMMENT ON FUNCTION public.update_giveaway_entry_count() IS 'Trigger function with secure search_path';
COMMENT ON FUNCTION public.soft_delete_user(UUID) IS 'User management function with secure search_path';
COMMENT ON FUNCTION public.recover_user(UUID) IS 'User management function with secure search_path';
COMMENT ON FUNCTION public.permanently_delete_expired_users() IS 'Cleanup function with secure search_path';
COMMENT ON FUNCTION public.cleanup_expired_accounts() IS 'Cleanup function with secure search_path';
COMMENT ON FUNCTION public.manual_cleanup_expired_accounts() IS 'Manual cleanup function with secure search_path';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function with secure search_path';
COMMENT ON FUNCTION public.update_reader_library_timestamp() IS 'Trigger function with secure search_path';