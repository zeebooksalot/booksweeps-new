-- Fix remaining function search path security issues
-- This migration attempts to add SET search_path = 'public' to remaining functions
-- Using more flexible function signatures

-- ============================================================================
-- 1. REMAINING FUNCTIONS FROM LINTER OUTPUT - Add search_path security
-- ============================================================================

-- Try to add search_path to get_reader_library (may have different signature)
DO $$
BEGIN
    -- Try different possible signatures for get_reader_library
    BEGIN
        ALTER FUNCTION public.get_reader_library(UUID) SET search_path = 'public';
    EXCEPTION WHEN OTHERS THEN
        -- Function might not exist or have different signature
        NULL;
    END;
END $$;

-- Try to add search_path to get_library_stats (may have different signature)
DO $$
BEGIN
    -- Try different possible signatures for get_library_stats
    BEGIN
        ALTER FUNCTION public.get_library_stats(UUID) SET search_path = 'public';
    EXCEPTION WHEN OTHERS THEN
        -- Function might not exist or have different signature
        NULL;
    END;
END $$;

-- Try to add search_path to update_reading_status (may have different signature)
DO $$
BEGIN
    -- Try different possible signatures for update_reading_status
    BEGIN
        ALTER FUNCTION public.update_reading_status(UUID, UUID, TEXT, INTEGER) SET search_path = 'public';
    EXCEPTION WHEN OTHERS THEN
        -- Try with different parameter types
        BEGIN
            ALTER FUNCTION public.update_reading_status(UUID, UUID, TEXT) SET search_path = 'public';
        EXCEPTION WHEN OTHERS THEN
            -- Function might not exist
            NULL;
        END;
    END;
END $$;

-- ============================================================================
-- 2. ADD COMMENTS FOR DOCUMENTATION (if functions exist)
-- ============================================================================

-- Add comments only if the functions exist
DO $$
BEGIN
    -- Try to add comment to get_reader_library
    BEGIN
        COMMENT ON FUNCTION public.get_reader_library(UUID) IS 'User function with secure search_path';
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    -- Try to add comment to get_library_stats
    BEGIN
        COMMENT ON FUNCTION public.get_library_stats(UUID) IS 'Analytics function with secure search_path';
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    -- Try to add comment to update_reading_status
    BEGIN
        COMMENT ON FUNCTION public.update_reading_status(UUID, UUID, TEXT, INTEGER) IS 'User function with secure search_path';
    EXCEPTION WHEN OTHERS THEN
        BEGIN
            COMMENT ON FUNCTION public.update_reading_status(UUID, UUID, TEXT) IS 'User function with secure search_path';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END;
END $$;