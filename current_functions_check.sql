

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."aggregate_daily_analytics"("target_date" "date" DEFAULT (CURRENT_DATE - 1)) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    events_count integer := 0;
    users_count integer := 0;
    sessions_count integer := 0;
    books_opened_count integer := 0;
    unique_books_count integer := 0;
    books_completed_count integer := 0;
    bookmarks_count integer := 0;
    annotations_count integer := 0;
    top_books_data jsonb := '[]'::jsonb;
    top_completed_data jsonb := '[]'::jsonb;
    result jsonb;
    validated_date date;
BEGIN
    -- Input validation
    IF target_date IS NULL THEN
        RAISE EXCEPTION 'target_date cannot be NULL';
    END IF;
    
    IF target_date > CURRENT_DATE THEN
        RAISE EXCEPTION 'target_date cannot be in the future';
    END IF;
    
    IF target_date < CURRENT_DATE - INTERVAL '2 years' THEN
        RAISE EXCEPTION 'target_date cannot be more than 2 years ago';
    END IF;
    
    validated_date := target_date;
    
    -- Basic metrics with bounds checking
    SELECT 
        LEAST(COUNT(*), 1000000)::integer,
        LEAST(COUNT(DISTINCT user_id), 100000)::integer,
        LEAST(COUNT(DISTINCT session_id), 100000)::integer
    INTO events_count, users_count, sessions_count
    FROM analytics_events 
    WHERE DATE(created_at) = validated_date;
    
    -- Book opening metrics with validation
    SELECT 
        LEAST(COUNT(*), 100000)::integer,
        LEAST(COUNT(DISTINCT properties->>'bookId'), 10000)::integer
    INTO books_opened_count, unique_books_count
    FROM analytics_events 
    WHERE DATE(created_at) = validated_date 
    AND event_name = 'book_open'
    AND properties ? 'bookId'
    AND length(properties->>'bookId') BETWEEN 1 AND 100;
    
    -- Book completion count with validation
    SELECT LEAST(COUNT(*), 10000)::integer INTO books_completed_count
    FROM analytics_events 
    WHERE DATE(created_at) = validated_date 
    AND event_name = 'book_completed';
    
    -- Bookmark and annotation counts
    SELECT 
        LEAST(COUNT(CASE WHEN event_name = 'bookmark_added' THEN 1 END), 100000)::integer,
        LEAST(COUNT(CASE WHEN event_name = 'annotation_added' THEN 1 END), 100000)::integer
    INTO bookmarks_count, annotations_count
    FROM analytics_events 
    WHERE DATE(created_at) = validated_date
    AND event_name IN ('bookmark_added', 'annotation_added');
    
    -- Top books with sanitization
    SELECT jsonb_agg(
        jsonb_build_object(
            'bookId', SUBSTRING(book_id, 1, 100),
            'bookTitle', SUBSTRING(COALESCE(book_title, 'Unknown'), 1, 200),
            'openCount', open_count
        ) ORDER BY open_count DESC
    ) INTO top_books_data
    FROM (
        SELECT 
            properties->>'bookId' as book_id,
            properties->>'bookTitle' as book_title,
            COUNT(*)::integer as open_count
        FROM analytics_events 
        WHERE DATE(created_at) = validated_date 
        AND event_name = 'book_open'
        AND properties ? 'bookId'
        AND length(properties->>'bookId') BETWEEN 1 AND 100
        GROUP BY properties->>'bookId', properties->>'bookTitle'
        ORDER BY open_count DESC
        LIMIT 10
    ) top_books;
    
    -- Insert with conflict resolution
    INSERT INTO daily_analytics_summaries (
        summary_date, 
        total_events, 
        unique_users, 
        total_sessions,
        books_opened,
        unique_books_read,
        books_completed,
        bookmarks_added,
        annotations_added,
        top_books,
        top_completed_books
    ) VALUES (
        validated_date, 
        events_count, 
        users_count, 
        sessions_count,
        books_opened_count,
        unique_books_count,
        books_completed_count,
        bookmarks_count,
        annotations_count,
        COALESCE(top_books_data, '[]'::jsonb),
        COALESCE(top_completed_data, '[]'::jsonb)
    ) ON CONFLICT (summary_date) 
    DO UPDATE SET 
        total_events = EXCLUDED.total_events,
        unique_users = EXCLUDED.unique_users,
        total_sessions = EXCLUDED.total_sessions,
        books_opened = EXCLUDED.books_opened,
        unique_books_read = EXCLUDED.unique_books_read,
        books_completed = EXCLUDED.books_completed,
        bookmarks_added = EXCLUDED.bookmarks_added,
        annotations_added = EXCLUDED.annotations_added,
        top_books = EXCLUDED.top_books,
        top_completed_books = EXCLUDED.top_completed_books,
        updated_at = NOW();
    
    result := jsonb_build_object(
        'date', validated_date,
        'totalEvents', events_count,
        'uniqueUsers', users_count,
        'booksOpened', books_opened_count,
        'uniqueBooksRead', unique_books_count
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."aggregate_daily_analytics"("target_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_campaign_max_entries"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  campaign_max_entries integer;
  current_entry_count integer;
BEGIN
  SELECT max_entries, entry_count INTO campaign_max_entries, current_entry_count
  FROM campaigns 
  WHERE id = NEW.campaign_id;
  
  IF campaign_max_entries IS NOT NULL AND current_entry_count >= campaign_max_entries THEN
    RAISE EXCEPTION 'Campaign has reached maximum entries limit of %', campaign_max_entries;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_campaign_max_entries"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_campaign_max_entries"("campaign_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  max_entries integer;
  current_entries integer;
BEGIN
  SELECT c.max_entries, c.entry_count
  INTO max_entries, current_entries
  FROM campaigns c
  WHERE c.id = campaign_id;
  
  -- If max_entries is NULL, no limit
  IF max_entries IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if we can accept more entries
  RETURN current_entries < max_entries;
END;
$$;


ALTER FUNCTION "public"."check_campaign_max_entries"("campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_critical_errors"("hours_back" integer DEFAULT 1) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'criticalErrors', COALESCE(errors.critical_count, 0),
        'highErrors', COALESCE(errors.high_count, 0),
        'errorRate', COALESCE(errors.error_rate, 0),
        'recentErrors', COALESCE(errors.recent_errors, '[]'::jsonb),
        'checkTime', NOW(),
        'timeWindow', hours_back || ' hours'
    ) INTO result
    FROM (
        SELECT 
            COUNT(*) FILTER (WHERE severity = 'critical') as critical_count,
            COUNT(*) FILTER (WHERE severity = 'high') as high_count,
            CASE 
                WHEN COUNT(*) > 0 THEN (COUNT(*)::float / 
                    (SELECT COUNT(*) FROM analytics_events 
                     WHERE created_at >= NOW() - (hours_back || ' hours')::interval)) * 100
                ELSE 0 
            END as error_rate,
            jsonb_agg(
                jsonb_build_object(
                    'message', message,
                    'severity', severity,
                    'category', category,
                    'timestamp', created_at,
                    'url', url
                ) ORDER BY created_at DESC
            ) FILTER (WHERE created_at >= NOW() - (hours_back || ' hours')::interval) as recent_errors
        FROM error_reports
        WHERE created_at >= NOW() - (hours_back || ' hours')::interval
    ) errors;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."check_critical_errors"("hours_back" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_critical_errors"("hours_back" integer) IS 'Check for critical errors in the specified time window';



CREATE OR REPLACE FUNCTION "public"."check_user_limits"("target_user_id" "uuid", "check_campaigns" integer DEFAULT 0, "check_books" integer DEFAULT 0, "check_pen_names" integer DEFAULT 0) RETURNS TABLE("can_create_campaign" boolean, "can_create_book" boolean, "can_create_pen_name" boolean, "current_campaigns" integer, "current_books" integer, "current_pen_names" integer, "max_campaigns" integer, "max_books" integer, "max_pen_names" integer, "plan_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  entitlements RECORD;
  current_counts RECORD;
BEGIN
  -- Get user entitlements
  SELECT * INTO entitlements
  FROM public.user_entitlements
  WHERE user_id = target_user_id;
  
  -- If no entitlements found, create default ones
  IF NOT FOUND THEN
    INSERT INTO public.user_entitlements (user_id, plan_name)
    VALUES (target_user_id, 'free')
    ON CONFLICT (user_id) DO NOTHING;
    
    SELECT * INTO entitlements
    FROM public.user_entitlements
    WHERE user_id = target_user_id;
  END IF;
  
  -- Get current counts
  SELECT 
    COALESCE((SELECT COUNT(*) FROM public.campaigns WHERE user_id = target_user_id), 0) as campaign_count,
    COALESCE((SELECT COUNT(*) FROM public.books WHERE user_id = target_user_id), 0) as book_count,
    COALESCE((SELECT COUNT(*) FROM public.pen_names WHERE user_id = target_user_id), 0) as pen_name_count
  INTO current_counts;
  
  RETURN QUERY SELECT
    (entitlements.max_campaigns_allowed = -1 OR current_counts.campaign_count + check_campaigns <= entitlements.max_campaigns_allowed) as can_create_campaign,
    (entitlements.max_books_allowed = -1 OR current_counts.book_count + check_books <= entitlements.max_books_allowed) as can_create_book,
    (entitlements.max_pen_names_allowed = -1 OR current_counts.pen_name_count + check_pen_names <= entitlements.max_pen_names_allowed) as can_create_pen_name,
    current_counts.campaign_count::integer,
    current_counts.book_count::integer,
    current_counts.pen_name_count::integer,
    entitlements.max_campaigns_allowed,
    entitlements.max_books_allowed,
    entitlements.max_pen_names_allowed,
    entitlements.plan_name;
END;
$$;


ALTER FUNCTION "public"."check_user_limits"("target_user_id" "uuid", "check_campaigns" integer, "check_books" integer, "check_pen_names" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_accounts"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Run the permanent deletion function
  SELECT "public"."permanently_delete_expired_users"() INTO deleted_count;
  
  -- Log the cleanup (optional - you can remove this if you don't want logging)
  IF deleted_count > 0 THEN
    RAISE NOTICE 'Cleaned up % expired accounts', deleted_count;
  END IF;
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_accounts"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cleanup_expired_accounts"() IS 'Cleanup function with secure search_path';



CREATE OR REPLACE FUNCTION "public"."cleanup_old_analytics"("analytics_retention_days" integer DEFAULT 90, "error_retention_days" integer DEFAULT 30, "session_retention_days" integer DEFAULT 60) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
DECLARE
    analytics_deleted integer := 0;
    errors_deleted integer := 0;
    sessions_deleted integer := 0;
    result jsonb;
BEGIN
    -- Cleanup old analytics events
    DELETE FROM analytics_events 
    WHERE created_at < NOW() - (analytics_retention_days || ' days')::interval;
    GET DIAGNOSTICS analytics_deleted = ROW_COUNT;

    -- Cleanup old error reports
    DELETE FROM error_reports 
    WHERE created_at < NOW() - (error_retention_days || ' days')::interval;
    GET DIAGNOSTICS errors_deleted = ROW_COUNT;

    -- Cleanup old user sessions
    DELETE FROM user_sessions 
    WHERE start_time < NOW() - (session_retention_days || ' days')::interval;
    GET DIAGNOSTICS sessions_deleted = ROW_COUNT;

    -- Return cleanup summary
    SELECT jsonb_build_object(
        'analyticsEventsDeleted', analytics_deleted,
        'errorReportsDeleted', errors_deleted,
        'userSessionsDeleted', sessions_deleted,
        'cleanupDate', NOW(),
        'retentionDays', jsonb_build_object(
            'analytics', analytics_retention_days,
            'errors', error_retention_days,
            'sessions', session_retention_days
        )
    ) INTO result;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."cleanup_old_analytics"("analytics_retention_days" integer, "error_retention_days" integer, "session_retention_days" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cleanup_old_analytics"("analytics_retention_days" integer, "error_retention_days" integer, "session_retention_days" integer) IS 'Cleanup old analytics data based on retention policies';



CREATE OR REPLACE FUNCTION "public"."cleanup_old_failed_attempts"() RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
  DELETE FROM failed_login_attempts 
  WHERE timestamp < NOW() - INTERVAL '24 hours';
END;
$$;


ALTER FUNCTION "public"."cleanup_old_failed_attempts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_orphaned_user_records"() RETURNS TABLE("operation" "text", "count" integer)
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Clean up orphaned votes
  DELETE FROM public.votes 
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'Removed orphaned votes'::text, deleted_count;
  
  -- Clean up orphaned reader_library
  DELETE FROM public.reader_library 
  WHERE reader_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'Removed orphaned reader_library'::text, deleted_count;
  
  -- Clean up orphaned reader_preferences
  DELETE FROM public.reader_preferences 
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'Removed orphaned reader_preferences'::text, deleted_count;
  
  -- Clean up orphaned reading_progress
  DELETE FROM public.reading_progress 
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'Removed orphaned reading_progress'::text, deleted_count;
  
  -- Clean up orphaned user_settings
  DELETE FROM public.user_settings 
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'Removed orphaned user_settings'::text, deleted_count;
  
  -- Clean up orphaned user_sessions
  DELETE FROM public.user_sessions 
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'Removed orphaned user_sessions'::text, deleted_count;
  
  -- Clean up orphaned user_entitlements
  DELETE FROM public.user_entitlements 
  WHERE user_id NOT IN (SELECT id FROM auth.users);
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'Removed orphaned user_entitlements'::text, deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_orphaned_user_records"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cleanup_orphaned_user_records"() IS 'Removes orphaned records that reference non-existent users in auth.users';



CREATE OR REPLACE FUNCTION "public"."create_default_user_entitlements"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  default_plan text := 'free';
  default_campaigns integer := 5;
  default_books integer := 10;
  default_pen_names integer := 3;
BEGIN
  -- Different defaults based on user type
  IF NEW.user_type = 'reader' THEN
    default_plan := 'reader_free';
    default_campaigns := 0;  -- Readers don't create campaigns
    default_books := 0;      -- Readers don't manage books  
    default_pen_names := 0;  -- Readers don't have pen names
  ELSIF NEW.user_type = 'both' THEN
    default_plan := 'author_free'; -- Give them author permissions
  END IF;

  INSERT INTO public.user_entitlements (
    user_id, 
    plan_name, 
    max_campaigns_allowed, 
    max_books_allowed, 
    max_pen_names_allowed
  )
  VALUES (
    NEW.id, 
    default_plan, 
    default_campaigns, 
    default_books, 
    default_pen_names
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_default_user_entitlements"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_user_settings"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_default_user_settings"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_book_comments"("book_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE books 
  SET comments_count = GREATEST(comments_count - 1, 0)
  WHERE id = book_id_param;
END;
$$;


ALTER FUNCTION "public"."decrement_book_comments"("book_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_book_downvotes"("book_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.books 
  SET downvotes_count = downvotes_count + 1 
  WHERE id = book_id_param;
END;
$$;


ALTER FUNCTION "public"."decrement_book_downvotes"("book_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."decrement_book_downvotes"("book_id_param" "uuid") IS 'Decrements book downvotes count with secure search path';



CREATE OR REPLACE FUNCTION "public"."decrement_book_upvotes"("book_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.books 
  SET upvotes_count = upvotes_count + 1 
  WHERE id = book_id_param;
END;
$$;


ALTER FUNCTION "public"."decrement_book_upvotes"("book_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."decrement_book_upvotes"("book_id_param" "uuid") IS 'Decrements book upvotes count with secure search path';



CREATE OR REPLACE FUNCTION "public"."decrement_pen_name_downvotes"("pen_name_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE pen_names 
  SET downvotes_count = downvotes_count + 1 
  WHERE id = pen_name_id_param;
END;
$$;


ALTER FUNCTION "public"."decrement_pen_name_downvotes"("pen_name_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."decrement_pen_name_downvotes"("pen_name_id_param" "uuid") IS 'Decrements pen name downvotes count with secure search path';



CREATE OR REPLACE FUNCTION "public"."decrement_pen_name_upvotes"("pen_name_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE pen_names 
  SET upvotes_count = upvotes_count + 1 
  WHERE id = pen_name_id_param;
END;
$$;


ALTER FUNCTION "public"."decrement_pen_name_upvotes"("pen_name_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."decrement_pen_name_upvotes"("pen_name_id_param" "uuid") IS 'Decrements pen name upvotes count with secure search path';



CREATE OR REPLACE FUNCTION "public"."ensure_single_primary_pen_name"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE public.pen_names 
    SET is_primary = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_single_primary_pen_name"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_delivery_slug"("title" "text", "book_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert title to slug
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Add book ID suffix for uniqueness
  base_slug := base_slug || '-' || substr(book_id::text, 1, 8);
  
  final_slug := base_slug;
  
  -- Check if slug exists and append counter if needed
  WHILE EXISTS (SELECT 1 FROM book_delivery_methods WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;


ALTER FUNCTION "public"."generate_delivery_slug"("title" "text", "book_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_slug"("input_text" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          trim(input_text),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$;


ALTER FUNCTION "public"."generate_slug"("input_text" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_slug"("input_text" "text") IS 'Utility function with secure search_path';



CREATE OR REPLACE FUNCTION "public"."generate_storage_path"("user_id" "uuid", "book_id" "uuid", "file_name" "text", "file_type" "text" DEFAULT 'book'::"text") RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN 'books/' || user_id::text || '/' || book_id::text || '/' || file_type || '/' || file_name;
END;
$$;


ALTER FUNCTION "public"."generate_storage_path"("user_id" "uuid", "book_id" "uuid", "file_name" "text", "file_type" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_storage_path"("user_id" "uuid", "book_id" "uuid", "file_name" "text", "file_type" "text") IS 'Generates storage path with secure search path';



CREATE OR REPLACE FUNCTION "public"."get_analytics_storage_stats"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'analyticsEvents', jsonb_build_object(
            'totalRows', COALESCE(analytics.total_rows, 0),
            'oldestRecord', analytics.oldest_record,
            'newestRecord', analytics.newest_record,
            'estimatedSize', analytics.estimated_size
        ),
        'errorReports', jsonb_build_object(
            'totalRows', COALESCE(errors.total_rows, 0),
            'oldestRecord', errors.oldest_record,
            'newestRecord', errors.newest_record,
            'estimatedSize', errors.estimated_size
        ),
        'userSessions', jsonb_build_object(
            'totalRows', COALESCE(sessions.total_rows, 0),
            'oldestRecord', sessions.oldest_record,
            'newestRecord', sessions.newest_record,
            'estimatedSize', sessions.estimated_size
        ),
        'storageSummary', jsonb_build_object(
            'totalEstimatedSize', COALESCE(analytics.estimated_size, 0) + 
                                 COALESCE(errors.estimated_size, 0) + 
                                 COALESCE(sessions.estimated_size, 0),
            'lastUpdated', NOW()
        )
    ) INTO result
    FROM (
        SELECT 
            COUNT(*) as total_rows,
            MIN(created_at) as oldest_record,
            MAX(created_at) as newest_record,
            pg_total_relation_size('analytics_events') as estimated_size
        FROM analytics_events
    ) analytics,
    (
        SELECT 
            COUNT(*) as total_rows,
            MIN(created_at) as oldest_record,
            MAX(created_at) as newest_record,
            pg_total_relation_size('error_reports') as estimated_size
        FROM error_reports
    ) errors,
    (
        SELECT 
            COUNT(*) as total_rows,
            MIN(start_time) as oldest_record,
            MAX(start_time) as newest_record,
            pg_total_relation_size('user_sessions') as estimated_size
        FROM user_sessions
    ) sessions;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_analytics_storage_stats"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_analytics_storage_stats"() IS 'Get storage statistics for analytics tables';



CREATE OR REPLACE FUNCTION "public"."get_analytics_summary"("time_range" "text" DEFAULT '7d'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
DECLARE
    start_date timestamp with time zone;
    result jsonb;
BEGIN
    -- Calculate start date based on time range
    CASE time_range
        WHEN '1d' THEN start_date := NOW() - INTERVAL '1 day';
        WHEN '7d' THEN start_date := NOW() - INTERVAL '7 days';
        WHEN '30d' THEN start_date := NOW() - INTERVAL '30 days';
        ELSE start_date := NOW() - INTERVAL '7 days';
    END CASE;

    -- Get aggregated analytics data
    SELECT jsonb_build_object(
        'totalEvents', COALESCE(events.total_events, 0),
        'uniqueUsers', COALESCE(users.unique_users, 0),
        'totalSessions', COALESCE(sessions.total_sessions, 0),
        'avgSessionDuration', COALESCE(sessions.avg_duration, 0),
        'topEvents', COALESCE(events.top_events, '[]'::jsonb),
        'eventsByCategory', COALESCE(events.by_category, '[]'::jsonb),
        'timeRange', time_range,
        'startDate', start_date,
        'endDate', NOW()
    ) INTO result
    FROM (
        -- Events summary
        SELECT 
            COUNT(*) as total_events,
            jsonb_agg(
                jsonb_build_object(
                    'name', event_name,
                    'count', event_count
                ) ORDER BY event_count DESC
            ) FILTER (WHERE event_count > 0) as top_events,
            jsonb_agg(
                jsonb_build_object(
                    'category', event_category,
                    'count', category_count
                ) ORDER BY category_count DESC
            ) FILTER (WHERE category_count > 0) as by_category
        FROM (
            SELECT 
                event_name,
                COUNT(*) as event_count
            FROM analytics_events 
            WHERE created_at >= start_date
            GROUP BY event_name
            ORDER BY event_count DESC
            LIMIT 10
        ) event_counts
        CROSS JOIN (
            SELECT 
                event_category,
                COUNT(*) as category_count
            FROM analytics_events 
            WHERE created_at >= start_date
            GROUP BY event_category
        ) category_counts
    ) events,
    (
        -- Unique users
        SELECT COUNT(DISTINCT user_id) as unique_users
        FROM analytics_events 
        WHERE created_at >= start_date AND user_id IS NOT NULL
    ) users,
    (
        -- Sessions summary
        SELECT 
            COUNT(*) as total_sessions,
            AVG(EXTRACT(EPOCH FROM (last_activity - start_time))) * 1000 as avg_duration
        FROM user_sessions 
        WHERE start_time >= start_date
    ) sessions;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_analytics_summary"("time_range" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_analytics_summary"("time_range" "text") IS 'Get aggregated analytics summary for dashboard display';



CREATE OR REPLACE FUNCTION "public"."get_campaign_stats"("campaign_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_entries', COALESCE(c.entry_count, 0),
    'max_entries', c.max_entries,
    'days_remaining', 
      CASE 
        WHEN c.end_date IS NULL THEN NULL
        ELSE EXTRACT(days FROM c.end_date - now())::integer
      END,
    'status', c.status,
    'start_date', c.start_date,
    'end_date', c.end_date,
    'is_accepting_entries', public.is_campaign_accepting_entries(campaign_id)
  )
  INTO result
  FROM campaigns c
  WHERE c.id = campaign_id;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_campaign_stats"("campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_library_stats"() RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_stats JSON;
BEGIN
    v_user_id := auth.uid();
    
    WITH book_data AS (
        SELECT 
            rl.book_id,
            rl.reading_status,
            b.genre,
            COALESCE(rp.percentage_complete, 0) as progress
        FROM public.reader_library rl
        LEFT JOIN public.books b ON rl.book_id = b.id
        LEFT JOIN public.reading_progress rp 
            ON rl.reader_id = rp.user_id 
            AND rl.book_id = rp.book_id
        WHERE rl.reader_id = v_user_id
    )
    SELECT json_build_object(
        'total_books', COUNT(DISTINCT book_id),
        'completed_books', COUNT(DISTINCT book_id) FILTER (WHERE reading_status = 'completed'),
        'currently_reading', COUNT(DISTINCT book_id) FILTER (WHERE reading_status = 'reading'),
        'unread_books', COUNT(DISTINCT book_id) FILTER (WHERE reading_status = 'unread'),
        'average_progress', ROUND(AVG(progress)::NUMERIC, 1),
        'favorite_genre', MODE() WITHIN GROUP (ORDER BY genre),
        'books_by_genre', json_object_agg(
            genre, 
            COUNT(DISTINCT book_id)
        ) FILTER (WHERE genre IS NOT NULL)
    ) INTO v_stats
    FROM book_data;
    
    RETURN v_stats;
END;
$$;


ALTER FUNCTION "public"."get_library_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_pen_name_book_count"("pen_name_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM books b
    WHERE b.pen_name_id = get_pen_name_book_count.pen_name_id
  );
END;
$$;


ALTER FUNCTION "public"."get_pen_name_book_count"("pen_name_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_pen_name_campaign_count"("pen_name_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM campaigns c
    JOIN books b ON c.book_id = b.id
    WHERE b.pen_name_id = get_pen_name_campaign_count.pen_name_id
  );
END;
$$;


ALTER FUNCTION "public"."get_pen_name_campaign_count"("pen_name_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_pen_names_with_counts"("target_user_id" "uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "name" "text", "bio" "text", "website" "text", "social_links" "jsonb", "is_primary" boolean, "status" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "book_count" bigint, "campaign_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.name,
    p.bio,
    p.website,
    p.social_links,
    p.is_primary,
    p.status,
    p.created_at,
    p.updated_at,
    (SELECT COUNT(*) FROM books b WHERE b.pen_name_id = p.id) AS book_count,
    (SELECT COUNT(*) FROM campaigns c WHERE c.pen_name_id = p.id) AS campaign_count
  FROM 
    pen_names p
  WHERE 
    p.user_id = target_user_id
  ORDER BY 
    p.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_pen_names_with_counts"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_pen_names_with_counts_by_status"("target_user_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "bio" "text", "is_primary" boolean, "books_count" bigint, "campaigns_count" bigint, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pn.id,
    pn.name,
    pn.bio,
    pn.is_primary,
    COALESCE(b.books_count, 0) as books_count,
    COALESCE(c.campaigns_count, 0) as campaigns_count,
    pn.created_at
  FROM pen_names pn
  LEFT JOIN (
    SELECT pen_name_id, COUNT(*) as books_count
    FROM books
    GROUP BY pen_name_id
  ) b ON pn.id = b.pen_name_id
  LEFT JOIN (
    SELECT b.pen_name_id, COUNT(*) as campaigns_count
    FROM campaigns camp
    JOIN books b ON camp.book_id = b.id
    GROUP BY b.pen_name_id
  ) c ON pn.id = c.pen_name_id
  WHERE pn.user_id = target_user_id
  ORDER BY pn.is_primary DESC, pn.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_pen_names_with_counts_by_status"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_pen_names_with_counts_by_status"("target_user_id" "uuid", "target_status" "text") RETURNS TABLE("id" "uuid", "user_id" "uuid", "name" "text", "genre" "text", "bio" "text", "website" "text", "avatar_url" "text", "social_links" "jsonb", "is_primary" boolean, "status" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "book_count" bigint, "campaign_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.name,
    p.genre,
    p.bio,
    p.website,
    p.avatar_url,
    p.social_links,
    p.is_primary,
    p.status,
    p.created_at,
    p.updated_at,
    (SELECT COUNT(*) FROM books b WHERE b.pen_name_id = p.id) AS book_count,
    (SELECT COUNT(*) FROM campaigns c WHERE c.pen_name_id = p.id) AS campaign_count
  FROM 
    pen_names p
  WHERE 
    p.user_id = target_user_id AND
    p.status = target_status
  ORDER BY 
    p.is_primary DESC, p.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_pen_names_with_counts_by_status"("target_user_id" "uuid", "target_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_performance_metrics"("time_range" "text" DEFAULT '7d'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
DECLARE
    start_date timestamp with time zone;
    result jsonb;
BEGIN
    -- Calculate start date based on time range
    CASE time_range
        WHEN '1d' THEN start_date := NOW() - INTERVAL '1 day';
        WHEN '7d' THEN start_date := NOW() - INTERVAL '7 days';
        WHEN '30d' THEN start_date := NOW() - INTERVAL '30 days';
        ELSE start_date := NOW() - INTERVAL '7 days';
    END CASE;

    -- Get performance metrics from analytics events
    SELECT jsonb_build_object(
        'avgPageLoadTime', COALESCE(perf.avg_page_load, 0),
        'avgApiResponseTime', COALESCE(perf.avg_api_response, 0),
        'slowResources', COALESCE(perf.slow_resources, 0),
        'coreWebVitals', COALESCE(perf.core_web_vitals, '{}'::jsonb),
        'performanceIssues', COALESCE(perf.performance_issues, '[]'::jsonb),
        'timeRange', time_range
    ) INTO result
    FROM (
        SELECT 
            AVG(CASE WHEN event_name = 'page_load' AND properties->>'loadTime' IS NOT NULL 
                THEN (properties->>'loadTime')::numeric ELSE NULL END) as avg_page_load,
            AVG(CASE WHEN event_name = 'api_call' AND properties->>'responseTime' IS NOT NULL 
                THEN (properties->>'responseTime')::numeric ELSE NULL END) as avg_api_response,
            COUNT(*) FILTER (WHERE event_name = 'slow_resource') as slow_resources,
            jsonb_build_object(
                'lcp', AVG(CASE WHEN event_name = 'core_web_vitals' AND properties->>'lcp' IS NOT NULL 
                    THEN (properties->>'lcp')::numeric ELSE NULL END),
                'fid', AVG(CASE WHEN event_name = 'core_web_vitals' AND properties->>'fid' IS NOT NULL 
                    THEN (properties->>'fid')::numeric ELSE NULL END),
                'cls', AVG(CASE WHEN event_name = 'core_web_vitals' AND properties->>'cls' IS NOT NULL 
                    THEN (properties->>'cls')::numeric ELSE NULL END)
            ) as core_web_vitals,
            jsonb_agg(
                jsonb_build_object(
                    'issue', event_name,
                    'count', issue_count,
                    'avgImpact', avg_impact
                ) ORDER BY issue_count DESC
            ) FILTER (WHERE issue_count > 0) as performance_issues
        FROM (
            SELECT 
                event_name,
                COUNT(*) as issue_count,
                AVG(CASE WHEN properties->>'impact' IS NOT NULL 
                    THEN (properties->>'impact')::numeric ELSE 0 END) as avg_impact
            FROM analytics_events 
            WHERE created_at >= start_date 
            AND event_category = 'performance'
            GROUP BY event_name
        ) perf_issues
        CROSS JOIN analytics_events
        WHERE analytics_events.created_at >= start_date 
        AND analytics_events.event_category = 'performance'
    ) perf;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_performance_metrics"("time_range" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_performance_metrics"("time_range" "text") IS 'Get performance metrics and Core Web Vitals data';



CREATE OR REPLACE FUNCTION "public"."get_reader_library"() RETURNS TABLE("id" "uuid", "book_id" "uuid", "title" "text", "author" "text", "cover_image_url" "text", "genre" character varying, "acquired_from" character varying, "acquired_at" timestamp with time zone, "last_accessed_at" timestamp with time zone, "reading_status" character varying, "reading_progress" numeric, "current_position" integer, "total_positions" integer, "notes" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rl.id,
        rl.book_id,
        b.title,
        b.author,
        b.cover_image_url,
        b.genre,  -- Genre comes from books table!
        rl.acquired_from,
        rl.acquired_at,
        rl.last_accessed_at,
        rl.reading_status,
        COALESCE(rp.percentage_complete, 0) as reading_progress,
        rp.position as current_position,
        rp.total_positions,
        rl.notes
    FROM 
        public.reader_library rl
        LEFT JOIN public.books b ON rl.book_id = b.id
        LEFT JOIN public.reading_progress rp 
            ON rl.reader_id = rp.user_id 
            AND rl.book_id = rp.book_id
    WHERE 
        rl.reader_id = auth.uid()
    ORDER BY 
        rl.last_accessed_at DESC NULLS LAST;
END;
$$;


ALTER FUNCTION "public"."get_reader_library"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_reading_analytics"("time_range" "text" DEFAULT '7d'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
DECLARE
    start_date timestamp with time zone;
    result jsonb;
BEGIN
    -- Calculate start date based on time range
    CASE time_range
        WHEN '1d' THEN start_date := NOW() - INTERVAL '1 day';
        WHEN '7d' THEN start_date := NOW() - INTERVAL '7 days';
        WHEN '30d' THEN start_date := NOW() - INTERVAL '30 days';
        ELSE start_date := NOW() - INTERVAL '7 days';
    END CASE;

    -- Get reading-specific analytics with simplified queries
    SELECT jsonb_build_object(
        'sessionsStarted', COALESCE(sessions_started, 0),
        'sessionsCompleted', COALESCE(sessions_completed, 0),
        'averageReadingTime', COALESCE(avg_reading_time, 0),
        'totalPagesRead', COALESCE(total_pages, 0),
        'completionRate', COALESCE(completion_rate, 0),
        'popularBooks', COALESCE(popular_books, '[]'::jsonb),
        'readingSpeed', COALESCE(avg_speed, 0),
        'readingSessions', COALESCE(session_details, '[]'::jsonb)
    ) INTO result
    FROM (
        -- Basic reading metrics
        SELECT 
            (SELECT COUNT(DISTINCT session_id) FROM analytics_events 
             WHERE created_at >= start_date AND event_category = 'reading' AND event_name = 'reading_start') as sessions_started,
            
            (SELECT COUNT(DISTINCT session_id) FROM analytics_events 
             WHERE created_at >= start_date AND event_category = 'reading' AND event_name = 'reading_end') as sessions_completed,
            
            (SELECT AVG((properties->>'totalTimeSpent')::numeric) FROM analytics_events 
             WHERE created_at >= start_date AND event_category = 'reading' AND event_name = 'reading_end' 
             AND properties->>'totalTimeSpent' IS NOT NULL) as avg_reading_time,
            
            (SELECT SUM((properties->>'pagesRead')::numeric) FROM analytics_events 
             WHERE created_at >= start_date AND event_category = 'reading' AND event_name = 'reading_progress' 
             AND properties->>'pagesRead' IS NOT NULL) as total_pages,
            
            (SELECT AVG((properties->>'readingSpeed')::numeric) FROM analytics_events 
             WHERE created_at >= start_date AND event_category = 'reading' AND event_name = 'reading_progress' 
             AND properties->>'readingSpeed' IS NOT NULL) as avg_speed,
            
            -- Completion rate calculation
            CASE 
                WHEN (SELECT COUNT(DISTINCT session_id) FROM analytics_events 
                      WHERE created_at >= start_date AND event_category = 'reading' AND event_name = 'reading_start') > 0
                THEN (
                    (SELECT COUNT(DISTINCT session_id) FROM analytics_events 
                     WHERE created_at >= start_date AND event_category = 'reading' AND event_name = 'reading_end')::float /
                    (SELECT COUNT(DISTINCT session_id) FROM analytics_events 
                     WHERE created_at >= start_date AND event_category = 'reading' AND event_name = 'reading_start')::float
                ) * 100
                ELSE 0 
            END as completion_rate,
            
            -- Popular books (simplified)
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'bookId', book_id,
                    'title', book_title,
                    'sessions', session_count,
                    'avgTime', avg_time
                ) ORDER BY session_count DESC
            ) FROM (
                SELECT 
                    properties->>'bookId' as book_id,
                    properties->>'bookTitle' as book_title,
                    COUNT(DISTINCT session_id) as session_count,
                    AVG(CASE WHEN event_name = 'reading_end' AND properties->>'totalTimeSpent' IS NOT NULL 
                        THEN (properties->>'totalTimeSpent')::numeric ELSE NULL END) as avg_time
                FROM analytics_events 
                WHERE created_at >= start_date 
                AND event_category = 'reading'
                AND properties->>'bookId' IS NOT NULL
                GROUP BY properties->>'bookId', properties->>'bookTitle'
                ORDER BY session_count DESC
                LIMIT 10
            ) book_stats) as popular_books,
            
            -- Session details (simplified)
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'sessionId', session_id,
                    'startTime', start_time,
                    'endTime', end_time,
                    'duration', duration,
                    'pagesRead', pages_read
                ) ORDER BY start_time DESC
            ) FROM (
                SELECT 
                    session_id,
                    MIN(created_at) as start_time,
                    MAX(created_at) as end_time,
                    EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) * 1000 as duration,
                    SUM(CASE WHEN properties->>'pagesRead' IS NOT NULL 
                        THEN (properties->>'pagesRead')::numeric ELSE 0 END) as pages_read
                FROM analytics_events 
                WHERE created_at >= start_date 
                AND event_category = 'reading'
                AND session_id IS NOT NULL
                GROUP BY session_id
                ORDER BY start_time DESC
                LIMIT 20
            ) session_stats) as session_details
    ) reading_metrics;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_reading_analytics"("time_range" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_reading_analytics"("time_range" "text") IS 'Get reading-specific analytics and metrics';



CREATE OR REPLACE FUNCTION "public"."get_user_campaign_entries"("target_user_id" "uuid") RETURNS TABLE("campaign_id" "uuid", "campaign_title" "text", "book_title" "text", "entry_date" timestamp with time zone, "campaign_status" "text")
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as campaign_id,
    c.title as campaign_title,
    b.title as book_title,
    re.created_at as entry_date,
    c.status as campaign_status
  FROM public.reader_entries re
  JOIN public.campaigns c ON re.campaign_id = c.id
  LEFT JOIN public.books b ON c.book_id = b.id
  WHERE re.user_id = target_user_id
  ORDER BY re.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_campaign_entries"("target_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_campaign_entries"("target_user_id" "uuid") IS 'Fixed: Uses correct reader_entries table reference';



CREATE OR REPLACE FUNCTION "public"."get_user_campaign_entries"("campaign_uuid" "uuid", "wp_user_id" bigint) RETURNS TABLE("entry_method" "text", "entry_data" "jsonb", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    re.entry_method,
    re.entry_data,
    re.created_at
  FROM public.reader_entries re
  WHERE re.campaign_id = campaign_uuid 
    AND re.user_id = wp_user_id
    AND re.status = 'valid'
  ORDER BY re.created_at ASC;
END;
$$;


ALTER FUNCTION "public"."get_user_campaign_entries"("campaign_uuid" "uuid", "wp_user_id" bigint) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_campaign_entries"("campaign_uuid" "uuid", "wp_user_id" bigint) IS 'Fixed: Uses correct user_id column reference';



CREATE OR REPLACE FUNCTION "public"."get_user_dashboard_data"("target_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'books_count', (SELECT COUNT(*) FROM books WHERE user_id = target_user_id),
    'campaigns_count', (SELECT COUNT(*) FROM campaigns WHERE user_id = target_user_id),
    'pen_names_count', (SELECT COUNT(*) FROM pen_names WHERE user_id = target_user_id),
    'active_campaigns', (SELECT COUNT(*) FROM campaigns WHERE user_id = target_user_id AND status = 'active')
  ) INTO result;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_user_dashboard_data"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_engagement_insights"("time_range" "text" DEFAULT '7d'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
DECLARE
    start_date timestamp with time zone;
    result jsonb;
BEGIN
    -- Calculate start date based on time range
    CASE time_range
        WHEN '1d' THEN start_date := NOW() - INTERVAL '1 day';
        WHEN '7d' THEN start_date := NOW() - INTERVAL '7 days';
        WHEN '30d' THEN start_date := NOW() - INTERVAL '30 days';
        ELSE start_date := NOW() - INTERVAL '7 days';
    END CASE;

    -- Get user engagement metrics
    SELECT jsonb_build_object(
        'activeUsers', COALESCE(engagement.active_users, 0),
        'returningUsers', COALESCE(engagement.returning_users, 0),
        'newUsers', COALESCE(engagement.new_users, 0),
        'avgEventsPerUser', COALESCE(engagement.avg_events_per_user, 0),
        'userRetentionRate', COALESCE(engagement.retention_rate, 0),
        'topUserActions', COALESCE(engagement.top_actions, '[]'::jsonb),
        'userJourneyStages', COALESCE(engagement.journey_stages, '[]'::jsonb)
    ) INTO result
    FROM (
        SELECT 
            COUNT(DISTINCT user_id) as active_users,
            COUNT(DISTINCT CASE WHEN user_visit_count > 1 THEN user_id END) as returning_users,
            COUNT(DISTINCT CASE WHEN user_visit_count = 1 THEN user_id END) as new_users,
            AVG(events_per_user) as avg_events_per_user,
            CASE 
                WHEN COUNT(DISTINCT user_id) > 0 
                THEN (COUNT(DISTINCT CASE WHEN user_visit_count > 1 THEN user_id END)::float / COUNT(DISTINCT user_id)::float) * 100
                ELSE 0 
            END as retention_rate,
            jsonb_agg(
                jsonb_build_object(
                    'action', event_name,
                    'count', action_count
                ) ORDER BY action_count DESC
            ) FILTER (WHERE action_count > 0) as top_actions,
            jsonb_agg(
                jsonb_build_object(
                    'stage', journey_stage,
                    'users', stage_users
                ) ORDER BY stage_users DESC
            ) FILTER (WHERE stage_users > 0) as journey_stages
        FROM (
            SELECT 
                user_id,
                COUNT(*) as events_per_user,
                COUNT(DISTINCT DATE(created_at)) as user_visit_count
            FROM analytics_events 
            WHERE created_at >= start_date AND user_id IS NOT NULL
            GROUP BY user_id
        ) user_stats
        CROSS JOIN (
            SELECT 
                event_name,
                COUNT(*) as action_count
            FROM analytics_events 
            WHERE created_at >= start_date
            GROUP BY event_name
            ORDER BY action_count DESC
            LIMIT 10
        ) action_counts
        CROSS JOIN (
            SELECT 
                CASE 
                    WHEN event_name IN ('login', 'signup') THEN 'onboarding'
                    WHEN event_name IN ('book_open', 'reading_start') THEN 'reading'
                    WHEN event_name IN ('book_close', 'reading_end') THEN 'completion'
                    WHEN event_name IN ('download', 'share') THEN 'engagement'
                    ELSE 'other'
                END as journey_stage,
                COUNT(DISTINCT user_id) as stage_users
            FROM analytics_events 
            WHERE created_at >= start_date AND user_id IS NOT NULL
            GROUP BY journey_stage
        ) journey_data
    ) engagement;

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_user_engagement_insights"("time_range" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_engagement_insights"("time_range" "text") IS 'Get user engagement metrics and insights';



CREATE OR REPLACE FUNCTION "public"."get_user_settings"("target_user_id" "uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "theme" "text", "font" "text", "sidebar_collapsed" boolean, "keyboard_shortcuts_enabled" boolean, "email_notifications" boolean, "marketing_emails" boolean, "weekly_reports" boolean, "language" "text", "timezone" "text", "usage_analytics" boolean, "auto_save_drafts" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "mailerlite_group_id" "text", "mailerlite_enabled" boolean, "mailchimp_list_id" "text", "mailchimp_enabled" boolean, "convertkit_form_id" "text", "convertkit_enabled" boolean, "klaviyo_list_id" "text", "klaviyo_enabled" boolean, "mailerlite_api_key_encrypted" "jsonb", "mailchimp_api_key_encrypted" "jsonb", "convertkit_api_key_encrypted" "jsonb", "klaviyo_api_key_encrypted" "jsonb", "authorletters_list_id" "text", "authorletters_enabled" boolean, "authorletters_api_key_encrypted" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    us.user_id,
    us.theme,
    us.font,
    us.sidebar_collapsed,
    us.keyboard_shortcuts_enabled,
    us.email_notifications,
    us.marketing_emails,
    us.weekly_reports,
    us.language,
    us.timezone,
    us.usage_analytics,
    us.auto_save_drafts,
    us.created_at,
    us.updated_at,
    us.mailerlite_group_id,
    us.mailerlite_enabled,
    us.mailchimp_list_id,
    us.mailchimp_enabled,
    us.convertkit_form_id,
    us.convertkit_enabled,
    us.klaviyo_list_id,
    us.klaviyo_enabled,
    us.mailerlite_api_key_encrypted,
    us.mailchimp_api_key_encrypted,
    us.convertkit_api_key_encrypted,
    us.klaviyo_api_key_encrypted,
    us.authorletters_list_id,
    us.authorletters_enabled,
    us.authorletters_api_key_encrypted
  FROM user_settings us
  WHERE us.user_id = target_user_id;
END;
$$;


ALTER FUNCTION "public"."get_user_settings"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.users (
    id, email, first_name, last_name, display_name, created_at, updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    NOW(), NOW()
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_book_comments"("book_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE books 
  SET comments_count = comments_count + 1
  WHERE id = book_id_param;
END;
$$;


ALTER FUNCTION "public"."increment_book_comments"("book_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_book_downvotes"("book_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.books 
  SET downvotes_count = downvotes_count + 1 
  WHERE id = book_id_param;
END;
$$;


ALTER FUNCTION "public"."increment_book_downvotes"("book_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."increment_book_downvotes"("book_id_param" "uuid") IS 'Increments book downvotes count with secure search path';



CREATE OR REPLACE FUNCTION "public"."increment_book_upvotes"("book_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.books 
  SET upvotes_count = upvotes_count + 1 
  WHERE id = book_id_param;
END;
$$;


ALTER FUNCTION "public"."increment_book_upvotes"("book_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."increment_book_upvotes"("book_id_param" "uuid") IS 'Increments book upvotes count with secure search path';



CREATE OR REPLACE FUNCTION "public"."increment_download_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
    -- Update reader_deliveries download count
    UPDATE public.reader_deliveries
    SET download_count = download_count + 1,
        last_download_at = NOW()
    WHERE id = NEW.delivery_id;
    
    -- Update reader_library download count if exists - FIXED with explicit column reference
    UPDATE public.reader_library rl
    SET download_count = rl.download_count + 1,
        last_accessed_at = NOW()
    FROM public.reader_deliveries rd
    JOIN public.book_delivery_methods bdm ON rd.delivery_method_id = bdm.id
    WHERE rd.id = NEW.delivery_id
    AND rl.book_id = bdm.book_id
    AND rl.reader_id = (SELECT id FROM public.users WHERE email = rd.reader_email LIMIT 1);
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."increment_download_count"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."increment_download_count"() IS 'Increments download count with secure search path';



CREATE OR REPLACE FUNCTION "public"."increment_pen_name_downvotes"("pen_name_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE pen_names 
  SET downvotes_count = downvotes_count + 1 
  WHERE id = pen_name_id_param;
END;
$$;


ALTER FUNCTION "public"."increment_pen_name_downvotes"("pen_name_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."increment_pen_name_downvotes"("pen_name_id_param" "uuid") IS 'Increments pen name downvotes count with secure search path';



CREATE OR REPLACE FUNCTION "public"."increment_pen_name_upvotes"("pen_name_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE pen_names 
  SET upvotes_count = upvotes_count + 1 
  WHERE id = pen_name_id_param;
END;
$$;


ALTER FUNCTION "public"."increment_pen_name_upvotes"("pen_name_id_param" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."increment_pen_name_upvotes"("pen_name_id_param" "uuid") IS 'Increments pen name upvotes count with secure search path';



CREATE OR REPLACE FUNCTION "public"."is_campaign_accepting_entries"("campaign_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  campaign_status text;
  campaign_start timestamptz;
  campaign_end timestamptz;
  can_accept_entries boolean;
BEGIN
  SELECT status, start_date, end_date
  INTO campaign_status, campaign_start, campaign_end
  FROM campaigns
  WHERE id = campaign_id;
  
  -- Check if campaign is active
  IF campaign_status != 'active' THEN
    RETURN false;
  END IF;
  
  -- Check if we're within the campaign dates
  IF campaign_start IS NOT NULL AND now() < campaign_start THEN
    RETURN false;
  END IF;
  
  IF campaign_end IS NOT NULL AND now() > campaign_end THEN
    RETURN false;
  END IF;
  
  -- Check entry count limits
  SELECT public.check_campaign_max_entries(campaign_id) INTO can_accept_entries;
  
  RETURN can_accept_entries;
END;
$$;


ALTER FUNCTION "public"."is_campaign_accepting_entries"("campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."manual_cleanup_expired_accounts"() RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  deleted_count integer;
  result json;
BEGIN
  -- Run the cleanup (only deletes user profiles)
  SELECT "public"."permanently_delete_expired_users"() INTO deleted_count;
  
  -- Return result as JSON with warning about auth users
  result := json_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'timestamp', NOW(),
    'note', 'User profiles deleted. Auth users may need manual cleanup via admin API.'
  );
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."manual_cleanup_expired_accounts"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."manual_cleanup_expired_accounts"() IS 'Manual cleanup function with secure search_path';



CREATE OR REPLACE FUNCTION "public"."migrate_api_keys_to_encrypted"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- This function will be called from the application to migrate existing keys
  -- The actual encryption will happen in the application layer for security
  RAISE NOTICE 'API key migration function created. Call from application to migrate existing keys.';
END;
$$;


ALTER FUNCTION "public"."migrate_api_keys_to_encrypted"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."permanently_delete_expired_users"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete users that have been soft-deleted for more than 30 days
  -- Note: This only deletes the user profile. The auth user will need to be
  -- deleted separately via the Supabase admin API or dashboard.
  WITH deleted_users AS (
    DELETE FROM "public"."users" 
    WHERE "deleted_at" IS NOT NULL 
    AND "deleted_at" < (NOW() - INTERVAL '30 days')
    RETURNING "id"
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted_users;

  RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."permanently_delete_expired_users"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."permanently_delete_expired_users"() IS 'Cleanup function with secure search_path';



CREATE OR REPLACE FUNCTION "public"."recover_user"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Check if user exists and is soft-deleted within 30 days
  IF NOT EXISTS (
    SELECT 1 FROM "public"."users" 
    WHERE "id" = "user_id" 
    AND "deleted_at" IS NOT NULL 
    AND "deleted_at" > (NOW() - INTERVAL '30 days')
  ) THEN
    RETURN false;
  END IF;

  -- Clear deleted_at timestamp
  UPDATE "public"."users" 
  SET "deleted_at" = NULL, "updated_at" = NOW()
  WHERE "id" = "user_id";

  RETURN true;
END;
$$;


ALTER FUNCTION "public"."recover_user"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."recover_user"("user_id" "uuid") IS 'User management function with secure search_path';



CREATE OR REPLACE FUNCTION "public"."set_pen_name_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  base_slug text;
  final_slug text;
  uuid_prefix text;
BEGIN
  -- Generate base slug from name
  base_slug := generate_slug(NEW.name);
  
  -- Check if base slug is unique
  IF NOT EXISTS (SELECT 1 FROM "public"."pen_names" WHERE slug = base_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) THEN
    final_slug := base_slug;
  ELSE
    -- Use first 8 characters of UUID to ensure uniqueness
    uuid_prefix := LEFT(NEW.id::text, 8);
    final_slug := base_slug || '-' || uuid_prefix;
  END IF;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_pen_name_slug"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."set_pen_name_slug"() IS 'Trigger function with secure search_path';



CREATE OR REPLACE FUNCTION "public"."soft_delete_user"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Check if user exists and is not already deleted
  IF NOT EXISTS (
    SELECT 1 FROM "public"."users" 
    WHERE "id" = "user_id" AND "deleted_at" IS NULL
  ) THEN
    RETURN false;
  END IF;

  -- Set deleted_at timestamp
  UPDATE "public"."users" 
  SET "deleted_at" = NOW(), "updated_at" = NOW()
  WHERE "id" = "user_id";

  RETURN true;
END;
$$;


ALTER FUNCTION "public"."soft_delete_user"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."soft_delete_user"("user_id" "uuid") IS 'User management function with secure search_path';



CREATE OR REPLACE FUNCTION "public"."update_book_comment_count"() RETURNS "trigger"
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


ALTER FUNCTION "public"."update_book_comment_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_book_files_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_book_files_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_book_metadata_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_book_metadata_updated_at"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_book_metadata_updated_at"() IS 'Trigger function with secure search_path';



CREATE OR REPLACE FUNCTION "public"."update_campaign_entry_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'valid' THEN
      UPDATE campaigns 
      SET entry_count = entry_count + 1 
      WHERE id = NEW.campaign_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'valid' AND NEW.status != 'valid' THEN
      UPDATE campaigns 
      SET entry_count = entry_count - 1 
      WHERE id = NEW.campaign_id;
    ELSIF OLD.status != 'valid' AND NEW.status = 'valid' THEN
      UPDATE campaigns 
      SET entry_count = entry_count + 1 
      WHERE id = NEW.campaign_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'valid' THEN
      UPDATE campaigns 
      SET entry_count = entry_count - 1 
      WHERE id = OLD.campaign_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_campaign_entry_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_campaign_entry_count"("campaign_id" "uuid", "new_count" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE campaigns
  SET entry_count = new_count,
      updated_at = now()
  WHERE id = campaign_id;
END;
$$;


ALTER FUNCTION "public"."update_campaign_entry_count"("campaign_id" "uuid", "new_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_comments_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_comments_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_delivery_methods_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_delivery_methods_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_giveaway_entry_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Security: Only update if giveaway exists and is active
    UPDATE giveaways 
    SET entry_count = entry_count + 1, updated_at = NOW()
    WHERE id = NEW.giveaway_id 
    AND status = 'active'
    AND (end_date IS NULL OR end_date > NOW());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Security: Only update if giveaway exists
    UPDATE giveaways 
    SET entry_count = GREATEST(0, entry_count - 1), updated_at = NOW()
    WHERE id = OLD.giveaway_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_giveaway_entry_count"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_giveaway_entry_count"() IS 'Trigger function with secure search_path';



CREATE OR REPLACE FUNCTION "public"."update_reader_library_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Update the column that actually exists in reader_library
    NEW.last_accessed_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_reader_library_timestamp"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_reader_library_timestamp"() IS 'Trigger function with secure search_path';



CREATE OR REPLACE FUNCTION "public"."update_reader_preferences"("target_user_id" "uuid", "preferences" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.reader_preferences
  SET preferred_format = preferences->>'preferred_format',
      reading_theme = preferences->>'reading_theme',
      font_size = (preferences->>'font_size')::integer,
      line_spacing = (preferences->>'line_spacing')::numeric,
      updated_at = now()
  WHERE user_id = target_user_id;
END;
$$;


ALTER FUNCTION "public"."update_reader_preferences"("target_user_id" "uuid", "preferences" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_reader_preferences"("target_user_id" "uuid", "preferences" "jsonb") IS 'Fixed: Uses correct reader_preferences table';



CREATE OR REPLACE FUNCTION "public"."update_reader_preferences"("target_user_id" "uuid", "new_favorite_genres" "text"[] DEFAULT NULL::"text"[], "new_reading_preferences" "jsonb" DEFAULT NULL::"jsonb", "new_email_notifications" boolean DEFAULT NULL::boolean, "new_giveaway_reminders" boolean DEFAULT NULL::boolean) RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Update user preferences in users table
  UPDATE public.users
  SET
    favorite_genres = COALESCE(new_favorite_genres, favorite_genres),
    reading_preferences = COALESCE(new_reading_preferences, reading_preferences),
    giveaway_reminders = COALESCE(new_giveaway_reminders, giveaway_reminders),
    updated_at = now()
  WHERE id = target_user_id AND user_type IN ('reader', 'both');
  
  -- Update email notifications in user_settings table
  IF new_email_notifications IS NOT NULL THEN
    UPDATE public.user_settings
    SET email_notifications = new_email_notifications,
        updated_at = now()
    WHERE user_id = target_user_id;
  END IF;
  
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."update_reader_preferences"("target_user_id" "uuid", "new_favorite_genres" "text"[], "new_reading_preferences" "jsonb", "new_email_notifications" boolean, "new_giveaway_reminders" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_reader_preferences"("target_user_id" "uuid", "new_favorite_genres" "text"[], "new_reading_preferences" "jsonb", "new_email_notifications" boolean, "new_giveaway_reminders" boolean) IS 'Fixed: Uses correct table references for email notifications';



CREATE OR REPLACE FUNCTION "public"."update_reading_status"("p_book_id" "uuid", "p_percentage" numeric, "p_position" integer DEFAULT NULL::integer, "p_total_positions" integer DEFAULT NULL::integer, "p_locator" "jsonb" DEFAULT NULL::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_status VARCHAR(20);
    v_percentage NUMERIC;
BEGIN
    v_user_id := auth.uid();
    
    IF p_percentage IS NULL AND p_position IS NOT NULL AND p_total_positions IS NOT NULL AND p_total_positions > 0 THEN
        v_percentage := ROUND((p_position::NUMERIC / p_total_positions::NUMERIC) * 100, 2);
    ELSE
        v_percentage := COALESCE(p_percentage, 0);
    END IF;
    
    v_status := CASE
        WHEN v_percentage = 0 THEN 'unread'
        WHEN v_percentage >= 95 THEN 'completed'
        ELSE 'reading'
    END;
    
    INSERT INTO public.reading_progress (
        user_id,
        book_id,
        position,
        total_positions,
        percentage_complete,
        locator,
        last_updated
    )
    VALUES (
        v_user_id,
        p_book_id,
        COALESCE(p_position, 0),
        COALESCE(p_total_positions, 0),
        v_percentage,
        p_locator,
        NOW()
    )
    ON CONFLICT (user_id, book_id) 
    DO UPDATE SET
        position = COALESCE(EXCLUDED.position, reading_progress.position),
        total_positions = COALESCE(EXCLUDED.total_positions, reading_progress.total_positions),
        percentage_complete = EXCLUDED.percentage_complete,
        locator = COALESCE(EXCLUDED.locator, reading_progress.locator),
        last_updated = EXCLUDED.last_updated,
        sync_version = reading_progress.sync_version + 1;
    
    UPDATE public.reader_library
    SET 
        reading_status = v_status,
        last_accessed_at = NOW()
    WHERE 
        book_id = p_book_id 
        AND user_id = v_user_id;
END;
$$;


ALTER FUNCTION "public"."update_reading_status"("p_book_id" "uuid", "p_percentage" numeric, "p_position" integer, "p_total_positions" integer, "p_locator" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_series_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_series_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_sync_version"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
    NEW.sync_version = COALESCE(OLD.sync_version, 0) + 1;
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_sync_version"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_updated_at_column"() IS 'Trigger function with secure search_path';



CREATE OR REPLACE FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "settings_data" "jsonb") RETURNS TABLE("id" "uuid", "user_id" "uuid", "theme" "text", "font" "text", "sidebar_collapsed" boolean, "keyboard_shortcuts_enabled" boolean, "email_notifications" boolean, "marketing_emails" boolean, "weekly_reports" boolean, "language" "text", "timezone" "text", "usage_analytics" boolean, "auto_save_drafts" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "mailerlite_group_id" "text", "mailerlite_enabled" boolean, "mailchimp_list_id" "text", "mailchimp_enabled" boolean, "convertkit_form_id" "text", "convertkit_enabled" boolean, "klaviyo_list_id" "text", "klaviyo_enabled" boolean, "mailerlite_api_key_encrypted" "jsonb", "mailchimp_api_key_encrypted" "jsonb", "convertkit_api_key_encrypted" "jsonb", "klaviyo_api_key_encrypted" "jsonb", "authorletters_list_id" "text", "authorletters_enabled" boolean, "authorletters_api_key_encrypted" "jsonb")
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
DECLARE
  rows_affected integer;
BEGIN
  UPDATE public.user_settings 
  SET 
    theme = COALESCE((settings_data->>'theme')::text, user_settings.theme),
    font = COALESCE((settings_data->>'font')::text, user_settings.font),
    sidebar_collapsed = COALESCE((settings_data->>'sidebar_collapsed')::boolean, user_settings.sidebar_collapsed),
    keyboard_shortcuts_enabled = COALESCE((settings_data->>'keyboard_shortcuts_enabled')::boolean, user_settings.keyboard_shortcuts_enabled),
    email_notifications = COALESCE((settings_data->>'email_notifications')::boolean, user_settings.email_notifications),
    marketing_emails = COALESCE((settings_data->>'marketing_emails')::boolean, user_settings.marketing_emails),
    weekly_reports = COALESCE((settings_data->>'weekly_reports')::boolean, user_settings.weekly_reports),
    language = COALESCE((settings_data->>'language')::text, user_settings.language),
    timezone = COALESCE((settings_data->>'timezone')::text, user_settings.timezone),
    usage_analytics = COALESCE((settings_data->>'usage_analytics')::boolean, user_settings.usage_analytics),
    auto_save_drafts = COALESCE((settings_data->>'auto_save_drafts')::boolean, user_settings.auto_save_drafts),
    mailerlite_group_id = COALESCE((settings_data->>'mailerlite_group_id')::text, user_settings.mailerlite_group_id),
    mailerlite_enabled = COALESCE((settings_data->>'mailerlite_enabled')::boolean, user_settings.mailerlite_enabled),
    mailchimp_list_id = COALESCE((settings_data->>'mailchimp_list_id')::text, user_settings.mailchimp_list_id),
    mailchimp_enabled = COALESCE((settings_data->>'mailchimp_enabled')::boolean, user_settings.mailchimp_enabled),
    convertkit_form_id = COALESCE((settings_data->>'convertkit_form_id')::text, user_settings.convertkit_form_id),
    convertkit_enabled = COALESCE((settings_data->>'convertkit_enabled')::boolean, user_settings.convertkit_enabled),
    klaviyo_list_id = COALESCE((settings_data->>'klaviyo_list_id')::text, user_settings.klaviyo_list_id),
    klaviyo_enabled = COALESCE((settings_data->>'klaviyo_enabled')::boolean, user_settings.klaviyo_enabled),
    mailerlite_api_key_encrypted = COALESCE((settings_data->>'mailerlite_api_key_encrypted')::jsonb, user_settings.mailerlite_api_key_encrypted),
    mailchimp_api_key_encrypted = COALESCE((settings_data->>'mailchimp_api_key_encrypted')::jsonb, user_settings.mailchimp_api_key_encrypted),
    convertkit_api_key_encrypted = COALESCE((settings_data->>'convertkit_api_key_encrypted')::jsonb, user_settings.convertkit_api_key_encrypted),
    klaviyo_api_key_encrypted = COALESCE((settings_data->>'klaviyo_api_key_encrypted')::jsonb, user_settings.klaviyo_api_key_encrypted),
    authorletters_list_id = COALESCE((settings_data->>'authorletters_list_id')::text, user_settings.authorletters_list_id),
    authorletters_enabled = COALESCE((settings_data->>'authorletters_enabled')::boolean, user_settings.authorletters_enabled),
    authorletters_api_key_encrypted = COALESCE((settings_data->>'authorletters_api_key_encrypted')::jsonb, user_settings.authorletters_api_key_encrypted),
    updated_at = now()
  WHERE user_settings.user_id = target_user_id;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  
  RETURN QUERY
  SELECT 
    us.id,
    us.user_id,
    us.theme,
    us.font,
    us.sidebar_collapsed,
    us.keyboard_shortcuts_enabled,
    us.email_notifications,
    us.marketing_emails,
    us.weekly_reports,
    us.language,
    us.timezone,
    us.usage_analytics,
    us.auto_save_drafts,
    us.created_at,
    us.updated_at,
    us.mailerlite_group_id,
    us.mailerlite_enabled,
    us.mailchimp_list_id,
    us.mailchimp_enabled,
    us.convertkit_form_id,
    us.convertkit_enabled,
    us.klaviyo_list_id,
    us.klaviyo_enabled,
    us.mailerlite_api_key_encrypted,
    us.mailchimp_api_key_encrypted,
    us.convertkit_api_key_encrypted,
    us.klaviyo_api_key_encrypted,
    us.authorletters_list_id,
    us.authorletters_enabled,
    us.authorletters_api_key_encrypted
  FROM public.user_settings us
  WHERE us.user_id = target_user_id;
END;
$$;


ALTER FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "settings_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "new_font" "text" DEFAULT NULL::"text", "new_theme" "text" DEFAULT NULL::"text", "new_sidebar_collapsed" boolean DEFAULT NULL::boolean, "new_keyboard_shortcuts_enabled" boolean DEFAULT NULL::boolean, "new_email_notifications" boolean DEFAULT NULL::boolean, "new_marketing_emails" boolean DEFAULT NULL::boolean, "new_weekly_reports" boolean DEFAULT NULL::boolean, "new_language" "text" DEFAULT NULL::"text", "new_timezone" "text" DEFAULT NULL::"text", "new_usage_analytics" boolean DEFAULT NULL::boolean, "new_auto_save_drafts" boolean DEFAULT NULL::boolean, "new_mailerlite_group_id" "text" DEFAULT NULL::"text", "new_mailerlite_enabled" boolean DEFAULT NULL::boolean, "new_mailchimp_list_id" "text" DEFAULT NULL::"text", "new_mailchimp_enabled" boolean DEFAULT NULL::boolean) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.user_settings
  SET 
    font = COALESCE(new_font, font),
    theme = COALESCE(new_theme, theme),
    sidebar_collapsed = COALESCE(new_sidebar_collapsed, sidebar_collapsed),
    keyboard_shortcuts_enabled = COALESCE(new_keyboard_shortcuts_enabled, keyboard_shortcuts_enabled),
    email_notifications = COALESCE(new_email_notifications, email_notifications),
    marketing_emails = COALESCE(new_marketing_emails, marketing_emails),
    weekly_reports = COALESCE(new_weekly_reports, weekly_reports),
    language = COALESCE(new_language, language),
    timezone = COALESCE(new_timezone, timezone),
    usage_analytics = COALESCE(new_usage_analytics, usage_analytics),
    auto_save_drafts = COALESCE(new_auto_save_drafts, auto_save_drafts),
    mailerlite_group_id = COALESCE(new_mailerlite_group_id, mailerlite_group_id),
    mailerlite_enabled = COALESCE(new_mailerlite_enabled, mailerlite_enabled),
    mailchimp_list_id = COALESCE(new_mailchimp_list_id, mailchimp_list_id),
    mailchimp_enabled = COALESCE(new_mailchimp_enabled, mailchimp_enabled),
    updated_at = now()
  WHERE user_id = target_user_id;
END;
$$;


ALTER FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "new_font" "text", "new_theme" "text", "new_sidebar_collapsed" boolean, "new_keyboard_shortcuts_enabled" boolean, "new_email_notifications" boolean, "new_marketing_emails" boolean, "new_weekly_reports" boolean, "new_language" "text", "new_timezone" "text", "new_usage_analytics" boolean, "new_auto_save_drafts" boolean, "new_mailerlite_group_id" "text", "new_mailerlite_enabled" boolean, "new_mailchimp_list_id" "text", "new_mailchimp_enabled" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "new_font" "text" DEFAULT NULL::"text", "new_theme" "text" DEFAULT NULL::"text", "new_sidebar_collapsed" boolean DEFAULT NULL::boolean, "new_keyboard_shortcuts_enabled" boolean DEFAULT NULL::boolean, "new_email_notifications" boolean DEFAULT NULL::boolean, "new_marketing_emails" boolean DEFAULT NULL::boolean, "new_weekly_reports" boolean DEFAULT NULL::boolean, "new_language" "text" DEFAULT NULL::"text", "new_timezone" "text" DEFAULT NULL::"text", "new_usage_analytics" boolean DEFAULT NULL::boolean, "new_auto_save_drafts" boolean DEFAULT NULL::boolean, "new_mailerlite_api_key" "text" DEFAULT NULL::"text", "new_mailerlite_group_id" "text" DEFAULT NULL::"text", "new_mailerlite_enabled" boolean DEFAULT NULL::boolean, "new_mailchimp_api_key" "text" DEFAULT NULL::"text", "new_mailchimp_list_id" "text" DEFAULT NULL::"text", "new_mailchimp_enabled" boolean DEFAULT NULL::boolean) RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  UPDATE public.user_settings
  SET 
    font = COALESCE(new_font, font),
    theme = COALESCE(new_theme, theme),
    sidebar_collapsed = COALESCE(new_sidebar_collapsed, sidebar_collapsed),
    keyboard_shortcuts_enabled = COALESCE(new_keyboard_shortcuts_enabled, keyboard_shortcuts_enabled),
    email_notifications = COALESCE(new_email_notifications, email_notifications),
    marketing_emails = COALESCE(new_marketing_emails, marketing_emails),
    weekly_reports = COALESCE(new_weekly_reports, weekly_reports),
    language = COALESCE(new_language, language),
    timezone = COALESCE(new_timezone, timezone),
    usage_analytics = COALESCE(new_usage_analytics, usage_analytics),
    auto_save_drafts = COALESCE(new_auto_save_drafts, auto_save_drafts),
    mailerlite_api_key_encrypted = COALESCE(new_mailerlite_api_key, mailerlite_api_key_encrypted),
    mailerlite_group_id = COALESCE(new_mailerlite_group_id, mailerlite_group_id),
    mailerlite_enabled = COALESCE(new_mailerlite_enabled, mailerlite_enabled),
    mailchimp_api_key_encrypted = COALESCE(new_mailchimp_api_key, mailchimp_api_key_encrypted),
    mailchimp_list_id = COALESCE(new_mailchimp_list_id, mailchimp_list_id),
    mailchimp_enabled = COALESCE(new_mailchimp_enabled, mailchimp_enabled),
    updated_at = now()
  WHERE user_id = target_user_id;
END;
$$;


ALTER FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "new_font" "text", "new_theme" "text", "new_sidebar_collapsed" boolean, "new_keyboard_shortcuts_enabled" boolean, "new_email_notifications" boolean, "new_marketing_emails" boolean, "new_weekly_reports" boolean, "new_language" "text", "new_timezone" "text", "new_usage_analytics" boolean, "new_auto_save_drafts" boolean, "new_mailerlite_api_key" "text", "new_mailerlite_group_id" "text", "new_mailerlite_enabled" boolean, "new_mailchimp_api_key" "text", "new_mailchimp_list_id" "text", "new_mailchimp_enabled" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "new_font" "text", "new_theme" "text", "new_sidebar_collapsed" boolean, "new_keyboard_shortcuts_enabled" boolean, "new_email_notifications" boolean, "new_marketing_emails" boolean, "new_weekly_reports" boolean, "new_language" "text", "new_timezone" "text", "new_usage_analytics" boolean, "new_auto_save_drafts" boolean, "new_mailerlite_api_key" "text", "new_mailerlite_group_id" "text", "new_mailerlite_enabled" boolean, "new_mailchimp_api_key" "text", "new_mailchimp_list_id" "text", "new_mailchimp_enabled" boolean) IS 'Fixed: Uses correct encrypted column names';



CREATE OR REPLACE FUNCTION "public"."update_user_type"("target_user_id" "uuid", "new_user_type" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE users
  SET user_type = new_user_type,
      updated_at = now()
  WHERE id = target_user_id;
END;
$$;


ALTER FUNCTION "public"."update_user_type"("target_user_id" "uuid", "new_user_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_foreign_key_consistency"() RETURNS TABLE("table_name" "text", "issue_type" "text", "count" bigint)
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Check for orphaned records in votes table
  RETURN QUERY
  SELECT 
    'votes'::text as table_name,
    'orphaned_records'::text as issue_type,
    COUNT(*)::bigint as count
  FROM public.votes v
  WHERE v.user_id NOT IN (SELECT id FROM auth.users);
  
  -- Check for orphaned records in reader_library table
  RETURN QUERY
  SELECT 
    'reader_library'::text as table_name,
    'orphaned_records'::text as issue_type,
    COUNT(*)::bigint as count
  FROM public.reader_library rl
  WHERE rl.reader_id NOT IN (SELECT id FROM auth.users);
  
  -- Check for orphaned records in reader_preferences table
  RETURN QUERY
  SELECT 
    'reader_preferences'::text as table_name,
    'orphaned_records'::text as issue_type,
    COUNT(*)::bigint as count
  FROM public.reader_preferences rp
  WHERE rp.user_id NOT IN (SELECT id FROM auth.users);
  
  -- Check for orphaned records in reading_progress table
  RETURN QUERY
  SELECT 
    'reading_progress'::text as table_name,
    'orphaned_records'::text as issue_type,
    COUNT(*)::bigint as count
  FROM public.reading_progress rp
  WHERE rp.user_id NOT IN (SELECT id FROM auth.users);
  
  -- Check for orphaned records in user_settings table
  RETURN QUERY
  SELECT 
    'user_settings'::text as table_name,
    'orphaned_records'::text as issue_type,
    COUNT(*)::bigint as count
  FROM public.user_settings us
  WHERE us.user_id NOT IN (SELECT id FROM auth.users);
  
  -- Check for orphaned records in user_sessions table
  RETURN QUERY
  SELECT 
    'user_sessions'::text as table_name,
    'orphaned_records'::text as issue_type,
    COUNT(*)::bigint as count
  FROM public.user_sessions us
  WHERE us.user_id NOT IN (SELECT id FROM auth.users);
  
  -- Check for orphaned records in user_entitlements table
  RETURN QUERY
  SELECT 
    'user_entitlements'::text as table_name,
    'orphaned_records'::text as issue_type,
    COUNT(*)::bigint as count
  FROM public.user_entitlements ue
  WHERE ue.user_id NOT IN (SELECT id FROM auth.users);
END;
$$;


ALTER FUNCTION "public"."validate_foreign_key_consistency"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."validate_foreign_key_consistency"() IS 'Validates that all user-related tables have consistent foreign key references to auth.users';



CREATE OR REPLACE FUNCTION "public"."validate_positions_json"("positions_data" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    SET "search_path" TO 'public', 'pg_catalog'
    AS $$
BEGIN
    IF jsonb_typeof(positions_data) != 'array' THEN
        RETURN FALSE;
    END IF;
    
    RETURN NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(positions_data) AS pos
        WHERE NOT (
            pos ? 'href' AND
            pos ? 'type' AND
            pos ? 'locations'
        )
    );
END;
$$;


ALTER FUNCTION "public"."validate_positions_json"("positions_data" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "event_name" "text" NOT NULL,
    "event_category" "text" NOT NULL,
    "event_label" "text",
    "event_value" numeric DEFAULT 0,
    "properties" "jsonb" DEFAULT '{}'::"jsonb",
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "url" "text",
    "user_agent" "text",
    "ip_address" "inet",
    "request_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "source" "text" DEFAULT 'reader'::"text",
    CONSTRAINT "analytics_events_event_category_check" CHECK (("event_category" = ANY (ARRAY['user'::"text", 'system'::"text", 'reading'::"text", 'navigation'::"text", 'engagement'::"text", 'error'::"text", 'performance'::"text"]))),
    CONSTRAINT "analytics_events_source_check" CHECK (("source" = ANY (ARRAY['reader'::"text", 'author'::"text", 'staging'::"text", 'main'::"text"])))
);


ALTER TABLE "public"."analytics_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."book_delivery_methods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "book_id" "uuid" NOT NULL,
    "format" character varying(20) NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "slug" character varying(255) NOT NULL,
    "is_active" boolean DEFAULT true,
    "requires_email" boolean DEFAULT true,
    "email_template" "text",
    "download_limit" integer,
    "expiry_days" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "delivery_method" character varying(50) NOT NULL,
    CONSTRAINT "book_delivery_methods_format_check" CHECK ((("format")::"text" = ANY (ARRAY[('epub'::character varying)::"text", ('pdf'::character varying)::"text", ('mobi'::character varying)::"text", ('audio'::character varying)::"text", ('print'::character varying)::"text"]))),
    CONSTRAINT "check_delivery_method" CHECK ((("delivery_method")::"text" = ANY (ARRAY[('ebook'::character varying)::"text", ('audiobook'::character varying)::"text", ('print'::character varying)::"text"])))
);


ALTER TABLE "public"."book_delivery_methods" OWNER TO "postgres";


COMMENT ON TABLE "public"."book_delivery_methods" IS 'Stores delivery methods for books (reader magnets, direct downloads, etc.)';



COMMENT ON COLUMN "public"."book_delivery_methods"."id" IS 'Unique identifier for the delivery method';



COMMENT ON COLUMN "public"."book_delivery_methods"."book_id" IS 'ID of the book this delivery method is for';



COMMENT ON COLUMN "public"."book_delivery_methods"."format" IS 'File format for delivery (epub, pdf, mobi, etc.)';



COMMENT ON COLUMN "public"."book_delivery_methods"."title" IS 'Title for the delivery method (e.g., "Free eBook Download")';



COMMENT ON COLUMN "public"."book_delivery_methods"."description" IS 'Description of the delivery method';



COMMENT ON COLUMN "public"."book_delivery_methods"."slug" IS 'Unique slug for public access URL';



COMMENT ON COLUMN "public"."book_delivery_methods"."is_active" IS 'Whether this delivery method is currently active';



COMMENT ON COLUMN "public"."book_delivery_methods"."requires_email" IS 'Whether email capture is required';



COMMENT ON COLUMN "public"."book_delivery_methods"."email_template" IS 'Custom email template for delivery';



COMMENT ON COLUMN "public"."book_delivery_methods"."download_limit" IS 'Maximum number of downloads allowed (NULL for unlimited)';



COMMENT ON COLUMN "public"."book_delivery_methods"."expiry_days" IS 'Number of days before download expires (NULL for no expiry)';



CREATE TABLE IF NOT EXISTS "public"."book_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "book_id" "uuid" NOT NULL,
    "delivery_method_id" "uuid",
    "format" character varying(20) NOT NULL,
    "file_path" "text" NOT NULL,
    "file_name" character varying(255) NOT NULL,
    "file_size" bigint NOT NULL,
    "mime_type" character varying(100) NOT NULL,
    "storage_provider" character varying(50) DEFAULT 'supabase'::character varying,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "book_files_format_check" CHECK ((("format")::"text" = ANY (ARRAY[('epub'::character varying)::"text", ('pdf'::character varying)::"text", ('mobi'::character varying)::"text", ('audio'::character varying)::"text", ('print'::character varying)::"text"]))),
    CONSTRAINT "book_files_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('active'::character varying)::"text", ('archived'::character varying)::"text", ('processing'::character varying)::"text"]))),
    CONSTRAINT "book_files_storage_provider_check" CHECK ((("storage_provider")::"text" = ANY (ARRAY[('supabase'::character varying)::"text", ('bunny'::character varying)::"text", ('aws'::character varying)::"text"])))
);


ALTER TABLE "public"."book_files" OWNER TO "postgres";


COMMENT ON TABLE "public"."book_files" IS 'Stores file references for book delivery';



COMMENT ON COLUMN "public"."book_files"."id" IS 'Unique identifier for the file record';



COMMENT ON COLUMN "public"."book_files"."book_id" IS 'ID of the book this file belongs to';



COMMENT ON COLUMN "public"."book_files"."delivery_method_id" IS 'ID of the delivery method this file is for';



COMMENT ON COLUMN "public"."book_files"."format" IS 'File format (epub, pdf, mobi, etc.)';



COMMENT ON COLUMN "public"."book_files"."file_path" IS 'Path to the file in storage';



COMMENT ON COLUMN "public"."book_files"."file_name" IS 'Original filename';



COMMENT ON COLUMN "public"."book_files"."file_size" IS 'File size in bytes';



COMMENT ON COLUMN "public"."book_files"."mime_type" IS 'MIME type of the file';



COMMENT ON COLUMN "public"."book_files"."storage_provider" IS 'Storage provider (supabase, bunny, aws)';



COMMENT ON COLUMN "public"."book_files"."status" IS 'Status of the file (active, archived, processing)';



CREATE TABLE IF NOT EXISTS "public"."book_metadata" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "book_id" "uuid",
    "toc_data" "jsonb",
    "landmarks_data" "jsonb",
    "page_list_data" "jsonb",
    "accessibility_data" "jsonb",
    "extraction_metadata" "jsonb",
    "extraction_version" character varying(50),
    "checksum" character varying(64),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."book_metadata" OWNER TO "postgres";


COMMENT ON TABLE "public"."book_metadata" IS 'Caches book metadata including TOC, landmarks, and page lists for performance';



COMMENT ON COLUMN "public"."book_metadata"."toc_data" IS 'Cached table of contents in Readium format';



COMMENT ON COLUMN "public"."book_metadata"."landmarks_data" IS 'Cached landmarks navigation data';



COMMENT ON COLUMN "public"."book_metadata"."page_list_data" IS 'Cached page list mapping data';



COMMENT ON COLUMN "public"."book_metadata"."accessibility_data" IS 'Cached accessibility metadata';



COMMENT ON COLUMN "public"."book_metadata"."extraction_metadata" IS 'Other metadata extracted from EPUB';



COMMENT ON COLUMN "public"."book_metadata"."checksum" IS 'Checksum of source EPUB for cache invalidation';



CREATE TABLE IF NOT EXISTS "public"."book_positions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "book_id" "uuid" NOT NULL,
    "total" integer NOT NULL,
    "positions" "jsonb" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "generator_version" character varying(50),
    "checksum" character varying(64),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_positions_structure" CHECK ("public"."validate_positions_json"("positions"))
);


ALTER TABLE "public"."book_positions" OWNER TO "postgres";


COMMENT ON TABLE "public"."book_positions" IS 'Stores pre-generated positions lists for EPUB books (Readium spec)';



CREATE TABLE IF NOT EXISTS "public"."books" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "isbn" "text",
    "title" "text" NOT NULL,
    "author" "text" NOT NULL,
    "description" "text",
    "cover_image_url" "text",
    "publisher" "text",
    "published_date" "text",
    "genre" "text",
    "page_count" integer,
    "language" "text" DEFAULT 'English'::"text",
    "source" "text" DEFAULT 'manual'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "pen_name_id" "uuid",
    "asin" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "series_id" "uuid",
    "series_order" integer,
    "upvotes_count" integer DEFAULT 0,
    "downvotes_count" integer DEFAULT 0,
    "comments_count" integer DEFAULT 0,
    CONSTRAINT "books_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."books" OWNER TO "postgres";


COMMENT ON COLUMN "public"."books"."status" IS 'Status of the book (active or archived)';



COMMENT ON COLUMN "public"."books"."comments_count" IS 'Number of comments on this book';



CREATE TABLE IF NOT EXISTS "public"."campaign_entry_methods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "entry_method_id" "text" NOT NULL,
    "bonus_entries" integer DEFAULT 1,
    "is_required" boolean DEFAULT false,
    "method_config" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."campaign_entry_methods" OWNER TO "postgres";


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
    "campaign_type" "text" DEFAULT 'giveaway'::"text" NOT NULL,
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
    "prize_value" numeric(10,2),
    "prize_format" "text",
    "number_of_winners" integer DEFAULT 1,
    "target_entries" integer DEFAULT 100,
    "duration" integer,
    "entry_methods" "text"[] DEFAULT '{}'::"text"[],
    "selected_books" "text"[] DEFAULT '{}'::"text"[],
    "gdpr_checkbox" boolean DEFAULT false,
    "custom_thank_you_page" "text",
    "social_media_config" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "campaigns_campaign_genre_check" CHECK ((("campaign_genre" IS NULL) OR ("campaign_genre" = ANY (ARRAY['romance'::"text", 'mystery'::"text", 'thriller'::"text", 'fantasy'::"text", 'sci-fi'::"text", 'horror'::"text", 'biography'::"text", 'self-help'::"text", 'history'::"text", 'science'::"text"])))),
    CONSTRAINT "campaigns_campaign_type_check" CHECK (("campaign_type" = ANY (ARRAY['giveaway'::"text", 'book_tour'::"text", 'launch_campaign'::"text", 'contest'::"text"]))),
    CONSTRAINT "campaigns_duration_check" CHECK ((("duration" >= 1) AND ("duration" <= 30))),
    CONSTRAINT "campaigns_number_of_winners_check" CHECK ((("number_of_winners" > 0) AND ("number_of_winners" <= 100))),
    CONSTRAINT "campaigns_prize_format_check" CHECK ((("prize_format" IS NULL) OR ("prize_format" = ANY (ARRAY['ebook'::"text", 'print'::"text", 'audiobook'::"text"])))),
    CONSTRAINT "campaigns_prize_value_check" CHECK (("prize_value" >= (0)::numeric)),
    CONSTRAINT "campaigns_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'active'::"text", 'paused'::"text", 'completed'::"text"]))),
    CONSTRAINT "campaigns_target_entries_check" CHECK ((("target_entries" >= 100) AND ("target_entries" <= 50000)))
);


ALTER TABLE "public"."campaigns" OWNER TO "postgres";


COMMENT ON COLUMN "public"."campaigns"."campaign_genre" IS 'Primary genre category for the campaign (e.g., romance, mystery, fantasy)';



COMMENT ON COLUMN "public"."campaigns"."prize_value" IS 'Estimated prize value in USD';



COMMENT ON COLUMN "public"."campaigns"."prize_format" IS 'Format of the prize (ebook, print, audiobook)';



COMMENT ON COLUMN "public"."campaigns"."number_of_winners" IS 'Number of winners for this campaign';



COMMENT ON COLUMN "public"."campaigns"."target_entries" IS 'Target number of reader entries for the campaign';



COMMENT ON COLUMN "public"."campaigns"."duration" IS 'Duration of the campaign in days';



COMMENT ON COLUMN "public"."campaigns"."entry_methods" IS 'Array of entry method IDs (newsletter, social_follow, etc.)';



COMMENT ON COLUMN "public"."campaigns"."selected_books" IS 'Array of book IDs selected for this campaign';



COMMENT ON COLUMN "public"."campaigns"."gdpr_checkbox" IS 'Whether to show GDPR consent checkbox on landing page';



COMMENT ON COLUMN "public"."campaigns"."custom_thank_you_page" IS 'Custom URL to redirect participants after entry';



COMMENT ON COLUMN "public"."campaigns"."social_media_config" IS 'JSON object mapping social media platforms to boolean values for follow requirements';



CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "book_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


COMMENT ON TABLE "public"."comments" IS 'Stores user comments on books';



COMMENT ON COLUMN "public"."comments"."user_id" IS 'ID of the user who made the comment';



COMMENT ON COLUMN "public"."comments"."book_id" IS 'ID of the book being commented on';



COMMENT ON COLUMN "public"."comments"."content" IS 'The comment text content';



CREATE TABLE IF NOT EXISTS "public"."daily_analytics_summaries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "summary_date" "date" NOT NULL,
    "total_events" integer DEFAULT 0,
    "unique_users" integer DEFAULT 0,
    "total_sessions" integer DEFAULT 0,
    "books_opened" integer DEFAULT 0,
    "unique_books_read" integer DEFAULT 0,
    "books_completed" integer DEFAULT 0,
    "total_reading_time_minutes" integer DEFAULT 0,
    "avg_reading_session_minutes" numeric DEFAULT 0,
    "total_pages_read" integer DEFAULT 0,
    "new_users" integer DEFAULT 0,
    "returning_users" integer DEFAULT 0,
    "bookmarks_added" integer DEFAULT 0,
    "annotations_added" integer DEFAULT 0,
    "top_books" "jsonb" DEFAULT '[]'::"jsonb",
    "top_completed_books" "jsonb" DEFAULT '[]'::"jsonb",
    "reading_completion_rate" numeric DEFAULT 0,
    "avg_session_duration_minutes" numeric DEFAULT 0,
    "peak_reading_hour" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."daily_analytics_summaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."entry_methods" (
    "id" "text" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "requires_verification" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "config" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."entry_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."error_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "message" "text" NOT NULL,
    "stack" "text",
    "filename" "text",
    "line_number" integer,
    "column_number" integer,
    "severity" "text" NOT NULL,
    "category" "text" NOT NULL,
    "context" "jsonb" DEFAULT '{}'::"jsonb",
    "timestamp" timestamp with time zone NOT NULL,
    "url" "text",
    "user_agent" "text",
    "ip_address" "inet",
    "request_id" "text",
    "resolved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "error_reports_category_check" CHECK (("category" = ANY (ARRAY['javascript'::"text", 'react'::"text", 'network'::"text", 'user'::"text", 'system'::"text"]))),
    CONSTRAINT "error_reports_severity_check" CHECK (("severity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"])))
);


ALTER TABLE "public"."error_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."failed_login_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "ip_address" "inet" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "success" boolean DEFAULT false NOT NULL,
    "user_agent" "text",
    "reason" "text",
    "referring_url" "text",
    "login_page_url" "text"
);


ALTER TABLE "public"."failed_login_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."giveaway_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "giveaway_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "user_id" "uuid",
    "entry_method" "text" DEFAULT 'email'::"text",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "giveaway_entries_entry_method_check" CHECK (("entry_method" = ANY (ARRAY['email'::"text", 'google'::"text", 'twitter'::"text"])))
);


ALTER TABLE "public"."giveaway_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."giveaways" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "book_data" "jsonb" NOT NULL,
    "author_data" "jsonb" NOT NULL,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone NOT NULL,
    "max_entries" integer,
    "entry_count" integer DEFAULT 0,
    "number_of_winners" integer DEFAULT 1,
    "prize_description" "text",
    "rules" "text",
    "status" "text" DEFAULT 'active'::"text",
    "is_featured" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "giveaways_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'ended'::"text", 'draft'::"text"])))
);


ALTER TABLE "public"."giveaways" OWNER TO "postgres";


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
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "avatar_url" "text",
    "genre" "text",
    "upvotes_count" integer DEFAULT 0,
    "downvotes_count" integer DEFAULT 0,
    "slug" "text" NOT NULL,
    CONSTRAINT "pen_names_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."pen_names" OWNER TO "postgres";


COMMENT ON COLUMN "public"."pen_names"."slug" IS 'URL-friendly slug generated from author name for SEO-friendly URLs. Guaranteed unique.';



CREATE TABLE IF NOT EXISTS "public"."reader_deliveries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "delivery_method_id" "uuid" NOT NULL,
    "reader_email" character varying(255) NOT NULL,
    "reader_name" character varying(255),
    "ip_address" "inet",
    "user_agent" "text",
    "delivered_at" timestamp with time zone DEFAULT "now"(),
    "download_count" integer DEFAULT 1,
    "last_download_at" timestamp with time zone DEFAULT "now"(),
    "status" character varying(20) DEFAULT 'delivered'::character varying,
    "access_token" "uuid" DEFAULT "gen_random_uuid"(),
    "expires_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "re_download_count" integer DEFAULT 0,
    CONSTRAINT "reader_deliveries_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('delivered'::character varying)::"text", ('failed'::character varying)::"text", ('expired'::character varying)::"text"])))
);


ALTER TABLE "public"."reader_deliveries" OWNER TO "postgres";


COMMENT ON TABLE "public"."reader_deliveries" IS 'Tracks reader downloads and email captures';



COMMENT ON COLUMN "public"."reader_deliveries"."id" IS 'Unique identifier for the delivery record';



COMMENT ON COLUMN "public"."reader_deliveries"."delivery_method_id" IS 'ID of the delivery method used';



COMMENT ON COLUMN "public"."reader_deliveries"."reader_email" IS 'Email address of the reader';



COMMENT ON COLUMN "public"."reader_deliveries"."reader_name" IS 'Name of the reader (optional)';



COMMENT ON COLUMN "public"."reader_deliveries"."ip_address" IS 'IP address of the reader';



COMMENT ON COLUMN "public"."reader_deliveries"."user_agent" IS 'User agent string';



COMMENT ON COLUMN "public"."reader_deliveries"."delivered_at" IS 'When the delivery was made';



COMMENT ON COLUMN "public"."reader_deliveries"."download_count" IS 'Number of times downloaded';



COMMENT ON COLUMN "public"."reader_deliveries"."last_download_at" IS 'Last download timestamp';



COMMENT ON COLUMN "public"."reader_deliveries"."status" IS 'Status of the delivery';



COMMENT ON COLUMN "public"."reader_deliveries"."access_token" IS 'Unique token for accessing the download';



COMMENT ON COLUMN "public"."reader_deliveries"."expires_at" IS 'When the download link expires';



COMMENT ON COLUMN "public"."reader_deliveries"."metadata" IS 'Additional metadata (utm params, referrer, etc.)';



COMMENT ON COLUMN "public"."reader_deliveries"."re_download_count" IS 'Number of times this user has re-downloaded the same book';



CREATE TABLE IF NOT EXISTS "public"."reader_download_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "delivery_id" "uuid" NOT NULL,
    "file_id" "uuid" NOT NULL,
    "downloaded_at" timestamp with time zone DEFAULT "now"(),
    "ip_address" "inet",
    "user_agent" "text",
    "download_size" bigint,
    "download_duration" integer,
    "status" character varying(20) DEFAULT 'success'::character varying,
    CONSTRAINT "reader_download_logs_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('success'::character varying)::"text", ('failed'::character varying)::"text", ('partial'::character varying)::"text"])))
);


ALTER TABLE "public"."reader_download_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."reader_download_logs" IS 'Logs individual download attempts for analytics';



COMMENT ON COLUMN "public"."reader_download_logs"."download_duration" IS 'Download duration in milliseconds';



COMMENT ON COLUMN "public"."reader_download_logs"."status" IS 'Download status (success, failed, partial)';



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
    "verified" boolean DEFAULT true,
    "status" "text" DEFAULT 'valid'::"text",
    "marketing_opt_in" boolean DEFAULT false,
    "referral_code" "text",
    "referred_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL,
    CONSTRAINT "reader_entries_email_check" CHECK (("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text")),
    CONSTRAINT "reader_entries_status_check" CHECK (("status" = ANY (ARRAY['valid'::"text", 'invalid'::"text", 'disqualified'::"text"])))
);


ALTER TABLE "public"."reader_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reader_library" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "book_id" "uuid" NOT NULL,
    "acquired_from" character varying(50) NOT NULL,
    "acquired_at" timestamp with time zone DEFAULT "now"(),
    "campaign_id" "uuid",
    "delivery_method_id" "uuid",
    "status" character varying(20) DEFAULT 'available'::character varying,
    "download_count" integer DEFAULT 0,
    "last_accessed_at" timestamp with time zone,
    "notes" "text",
    "reading_status" character varying(20) DEFAULT 'unread'::character varying,
    CONSTRAINT "reader_library_acquired_from_check" CHECK ((("acquired_from")::"text" = ANY (ARRAY['giveaway'::"text", 'purchase'::"text", 'gift'::"text", 'author_direct'::"text", 'access_token'::"text"]))),
    CONSTRAINT "reader_library_reading_status_check" CHECK ((("reading_status")::"text" = ANY ((ARRAY['unread'::character varying, 'reading'::character varying, 'completed'::character varying])::"text"[]))),
    CONSTRAINT "reader_library_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('available'::character varying)::"text", ('downloaded'::character varying)::"text", ('expired'::character varying)::"text", ('removed'::character varying)::"text"])))
);


ALTER TABLE "public"."reader_library" OWNER TO "postgres";


COMMENT ON TABLE "public"."reader_library" IS 'Stores books won/acquired by readers in their personal library';



COMMENT ON COLUMN "public"."reader_library"."acquired_from" IS 'How the book was acquired (giveaway, purchase, gift, author_direct, access_token)';



COMMENT ON COLUMN "public"."reader_library"."status" IS 'Book status in library (available, downloaded, expired, removed)';



COMMENT ON COLUMN "public"."reader_library"."reading_status" IS 'Quick status: unread, reading, or completed';



CREATE TABLE IF NOT EXISTS "public"."reading_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "book_id" "uuid",
    "position" integer DEFAULT 0 NOT NULL,
    "total_positions" integer DEFAULT 0 NOT NULL,
    "percentage_complete" numeric(5,2),
    "locator" "jsonb",
    "device_id" character varying(100) DEFAULT 'default'::character varying,
    "sync_version" integer DEFAULT 0,
    "last_updated" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reading_progress" OWNER TO "postgres";


COMMENT ON TABLE "public"."reading_progress" IS 'Tracks current reading progress for users across devices with sync support';



CREATE OR REPLACE VIEW "public"."reader_library_view" WITH ("security_invoker"='true') AS
 SELECT "rl"."id",
    "rl"."user_id",
    "rl"."book_id",
    "rl"."acquired_from",
    "rl"."acquired_at",
    "rl"."campaign_id",
    "rl"."delivery_method_id",
    "rl"."status",
    "rl"."download_count",
    "rl"."last_accessed_at",
    "rl"."notes",
    "rl"."reading_status",
    "b"."title",
    "b"."author",
    "b"."cover_image_url",
    "b"."genre",
    "b"."isbn",
    "b"."description",
    COALESCE("rp"."percentage_complete", (0)::numeric) AS "progress",
    "rp"."position" AS "current_position",
    "rp"."total_positions",
    "rp"."last_updated" AS "progress_updated_at"
   FROM (("public"."reader_library" "rl"
     JOIN "public"."books" "b" ON (("rl"."book_id" = "b"."id")))
     LEFT JOIN LATERAL ( SELECT "reading_progress"."percentage_complete",
            "reading_progress"."position",
            "reading_progress"."total_positions",
            "reading_progress"."last_updated"
           FROM "public"."reading_progress"
          WHERE (("reading_progress"."user_id" = "rl"."user_id") AND ("reading_progress"."book_id" = "rl"."book_id") AND (("reading_progress"."device_id")::"text" = 'default'::"text"))
         LIMIT 1) "rp" ON (true));


ALTER VIEW "public"."reader_library_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reader_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "preferred_format" character varying(20) DEFAULT 'epub'::character varying,
    "reading_theme" character varying(20) DEFAULT 'light'::character varying,
    "font_size" integer DEFAULT 16,
    "font_family" character varying(50) DEFAULT 'sans-serif'::character varying,
    "line_spacing" numeric(3,2) DEFAULT 1.5,
    "text_alignment" character varying(20) DEFAULT 'left'::character varying,
    "auto_sync" boolean DEFAULT true,
    "offline_reading" boolean DEFAULT true,
    "notifications_enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reader_preferences_font_size_check" CHECK ((("font_size" >= 10) AND ("font_size" <= 32))),
    CONSTRAINT "reader_preferences_line_spacing_check" CHECK ((("line_spacing" >= 1.0) AND ("line_spacing" <= 3.0))),
    CONSTRAINT "reader_preferences_preferred_format_check" CHECK ((("preferred_format")::"text" = ANY (ARRAY[('epub'::character varying)::"text", ('pdf'::character varying)::"text", ('mobi'::character varying)::"text", ('audio'::character varying)::"text"]))),
    CONSTRAINT "reader_preferences_reading_theme_check" CHECK ((("reading_theme")::"text" = ANY (ARRAY[('light'::character varying)::"text", ('dark'::character varying)::"text", ('sepia'::character varying)::"text", ('auto'::character varying)::"text"]))),
    CONSTRAINT "reader_preferences_text_alignment_check" CHECK ((("text_alignment")::"text" = ANY (ARRAY[('left'::character varying)::"text", ('justify'::character varying)::"text", ('center'::character varying)::"text", ('right'::character varying)::"text"])))
);


ALTER TABLE "public"."reader_preferences" OWNER TO "postgres";


COMMENT ON TABLE "public"."reader_preferences" IS 'Stores reader app preferences and reading settings';



COMMENT ON COLUMN "public"."reader_preferences"."auto_sync" IS 'Auto-sync reading progress across devices';



COMMENT ON COLUMN "public"."reader_preferences"."offline_reading" IS 'Enable offline reading mode';



CREATE TABLE IF NOT EXISTS "public"."reading_features" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "book_id" "uuid",
    "bookmarks" "jsonb" DEFAULT '[]'::"jsonb",
    "notes" "jsonb" DEFAULT '[]'::"jsonb",
    "reading_time_minutes" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reading_features" OWNER TO "postgres";


COMMENT ON TABLE "public"."reading_features" IS 'Stores bookmarks, notes, and reading time (migrated from old schema)';



CREATE TABLE IF NOT EXISTS "public"."reading_progress_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "book_id" "uuid",
    "position" integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "session_duration" integer,
    "pages_read" integer
);


ALTER TABLE "public"."reading_progress_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."reading_progress_history" IS 'Historical reading progress data for analytics';



CREATE TABLE IF NOT EXISTS "public"."series" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "cover_image_url" "text",
    "genre" character varying(100),
    "status" character varying(20) DEFAULT 'active'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "series_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('active'::character varying)::"text", ('archived'::character varying)::"text"])))
);


ALTER TABLE "public"."series" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_entitlements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "max_campaigns_allowed" integer DEFAULT 5 NOT NULL,
    "max_books_allowed" integer DEFAULT 10 NOT NULL,
    "max_pen_names_allowed" integer DEFAULT 3 NOT NULL,
    "plan_name" "text" DEFAULT 'free'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_entitlements_max_books_allowed_check" CHECK (("max_books_allowed" >= 0)),
    CONSTRAINT "user_entitlements_max_campaigns_allowed_check" CHECK (("max_campaigns_allowed" >= 0)),
    CONSTRAINT "user_entitlements_max_pen_names_allowed_check" CHECK (("max_pen_names_allowed" >= 0))
);


ALTER TABLE "public"."user_entitlements" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_reading_overview" WITH ("security_invoker"='true') AS
 SELECT "rp"."user_id",
    "rp"."book_id",
    "b"."title" AS "book_title",
    "b"."author" AS "book_author",
    "rp"."position" AS "current_position",
    "rp"."total_positions",
    "rp"."percentage_complete",
    "rp"."last_updated",
    "rp"."device_id",
    "rp"."sync_version",
    "rf"."bookmarks",
    "rf"."notes",
    "rf"."reading_time_minutes",
        CASE
            WHEN ("rp"."percentage_complete" < (10)::numeric) THEN 'Just Started'::"text"
            WHEN ("rp"."percentage_complete" < (50)::numeric) THEN 'Reading'::"text"
            WHEN ("rp"."percentage_complete" < (90)::numeric) THEN 'Almost Done'::"text"
            WHEN ("rp"."percentage_complete" >= (90)::numeric) THEN 'Finishing'::"text"
            ELSE 'Not Started'::"text"
        END AS "reading_status"
   FROM (("public"."reading_progress" "rp"
     JOIN "public"."books" "b" ON (("rp"."book_id" = "b"."id")))
     LEFT JOIN "public"."reading_features" "rf" ON ((("rf"."user_id" = "rp"."user_id") AND ("rf"."book_id" = "rp"."book_id"))))
  WHERE (("rp"."last_updated" = ( SELECT "max"("rp2"."last_updated") AS "max"
           FROM "public"."reading_progress" "rp2"
          WHERE (("rp2"."user_id" = "rp"."user_id") AND ("rp2"."book_id" = "rp"."book_id")))) AND ("rp"."user_id" = "auth"."uid"()));


ALTER VIEW "public"."user_reading_overview" OWNER TO "postgres";


COMMENT ON VIEW "public"."user_reading_overview" IS 'User reading overview - uses SECURITY INVOKER to respect RLS policies. Users can only see their own data.';



CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "session_id" "text" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "last_activity" timestamp with time zone NOT NULL,
    "page_views" integer DEFAULT 0,
    "viewport_width" integer,
    "viewport_height" integer,
    "user_agent" "text",
    "referrer" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "theme" "text" DEFAULT 'system'::"text" NOT NULL,
    "font" "text" DEFAULT 'Inter'::"text" NOT NULL,
    "sidebar_collapsed" boolean DEFAULT false NOT NULL,
    "keyboard_shortcuts_enabled" boolean DEFAULT true NOT NULL,
    "email_notifications" boolean DEFAULT true NOT NULL,
    "marketing_emails" boolean DEFAULT false NOT NULL,
    "weekly_reports" boolean DEFAULT true NOT NULL,
    "language" "text" DEFAULT 'en'::"text" NOT NULL,
    "timezone" "text" DEFAULT 'America/New_York'::"text" NOT NULL,
    "usage_analytics" boolean DEFAULT true NOT NULL,
    "auto_save_drafts" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "mailerlite_group_id" "text",
    "mailerlite_enabled" boolean DEFAULT false NOT NULL,
    "mailchimp_list_id" "text",
    "mailchimp_enabled" boolean DEFAULT false NOT NULL,
    "convertkit_form_id" "text",
    "convertkit_enabled" boolean DEFAULT false NOT NULL,
    "klaviyo_list_id" "text",
    "klaviyo_enabled" boolean DEFAULT false NOT NULL,
    "mailerlite_api_key_encrypted" "jsonb",
    "mailchimp_api_key_encrypted" "jsonb",
    "convertkit_api_key_encrypted" "jsonb",
    "klaviyo_api_key_encrypted" "jsonb",
    "authorletters_list_id" "text",
    "authorletters_enabled" boolean DEFAULT false NOT NULL,
    "authorletters_api_key_encrypted" "jsonb"
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_settings"."mailerlite_group_id" IS 'MailerLite group ID for subscriber management';



COMMENT ON COLUMN "public"."user_settings"."mailerlite_enabled" IS 'Whether MailerLite integration is enabled for this user';



COMMENT ON COLUMN "public"."user_settings"."mailchimp_list_id" IS 'MailChimp audience/list ID for subscriber management';



COMMENT ON COLUMN "public"."user_settings"."mailchimp_enabled" IS 'Whether MailChimp integration is enabled for this user';



COMMENT ON COLUMN "public"."user_settings"."convertkit_form_id" IS 'ConvertKit form ID for subscriber management';



COMMENT ON COLUMN "public"."user_settings"."convertkit_enabled" IS 'Whether ConvertKit integration is enabled';



COMMENT ON COLUMN "public"."user_settings"."klaviyo_list_id" IS 'Klaviyo list ID for subscriber management';



COMMENT ON COLUMN "public"."user_settings"."klaviyo_enabled" IS 'Whether Klaviyo integration is enabled';



COMMENT ON COLUMN "public"."user_settings"."mailerlite_api_key_encrypted" IS 'Encrypted MailerLite API key stored as JSON with encrypted, iv, and salt';



COMMENT ON COLUMN "public"."user_settings"."mailchimp_api_key_encrypted" IS 'Encrypted MailChimp API key stored as JSON with encrypted, iv, and salt';



COMMENT ON COLUMN "public"."user_settings"."convertkit_api_key_encrypted" IS 'Encrypted ConvertKit API key stored as JSON with encrypted, iv, and salt';



COMMENT ON COLUMN "public"."user_settings"."klaviyo_api_key_encrypted" IS 'Encrypted Klaviyo API key stored as JSON with encrypted, iv, and salt';



CREATE TABLE IF NOT EXISTS "public"."user_upgrade_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "from_user_type" "text" NOT NULL,
    "to_user_type" "text" NOT NULL,
    "upgrade_reason" "text",
    "domain_referrer" "text",
    "ip_address" "inet",
    "user_agent" "text",
    "upgraded_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_upgrade_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_upgrade_logs" IS 'Tracks user type upgrades for analytics';



COMMENT ON COLUMN "public"."user_upgrade_logs"."user_id" IS 'ID of the user who upgraded';



COMMENT ON COLUMN "public"."user_upgrade_logs"."from_user_type" IS 'Previous user type (reader, author, both)';



COMMENT ON COLUMN "public"."user_upgrade_logs"."to_user_type" IS 'New user type after upgrade';



COMMENT ON COLUMN "public"."user_upgrade_logs"."upgrade_reason" IS 'Reason for the upgrade (cross_domain_auth, manual, etc.)';



COMMENT ON COLUMN "public"."user_upgrade_logs"."domain_referrer" IS 'Domain where the upgrade occurred';



COMMENT ON COLUMN "public"."user_upgrade_logs"."ip_address" IS 'IP address of the user during upgrade';



COMMENT ON COLUMN "public"."user_upgrade_logs"."user_agent" IS 'User agent string during upgrade';



COMMENT ON COLUMN "public"."user_upgrade_logs"."upgraded_at" IS 'Timestamp when upgrade occurred';



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
    "deleted_at" timestamp with time zone,
    CONSTRAINT "users_auth_source_check" CHECK (("auth_source" = ANY (ARRAY['crm'::"text", 'talk'::"text"]))),
    CONSTRAINT "users_user_type_check" CHECK (("user_type" = ANY (ARRAY['author'::"text", 'reader'::"text", 'both'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."users"."deleted_at" IS 'Timestamp when user account was soft-deleted. NULL means account is active. Accounts can be recovered within 30 days.';



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


ALTER TABLE "public"."votes" OWNER TO "postgres";


COMMENT ON TABLE "public"."votes" IS 'Voting system for books and pen names with Row Level Security enabled';



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."book_delivery_methods"
    ADD CONSTRAINT "book_delivery_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."book_delivery_methods"
    ADD CONSTRAINT "book_delivery_methods_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."book_files"
    ADD CONSTRAINT "book_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."book_metadata"
    ADD CONSTRAINT "book_metadata_book_id_key" UNIQUE ("book_id");



ALTER TABLE ONLY "public"."book_metadata"
    ADD CONSTRAINT "book_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."book_positions"
    ADD CONSTRAINT "book_positions_book_id_unique" UNIQUE ("book_id");



ALTER TABLE ONLY "public"."book_positions"
    ADD CONSTRAINT "book_positions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_entry_methods"
    ADD CONSTRAINT "campaign_entry_methods_campaign_id_entry_method_id_key" UNIQUE ("campaign_id", "entry_method_id");



ALTER TABLE ONLY "public"."campaign_entry_methods"
    ADD CONSTRAINT "campaign_entry_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_analytics_summaries"
    ADD CONSTRAINT "daily_analytics_summaries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_analytics_summaries"
    ADD CONSTRAINT "daily_analytics_summaries_summary_date_key" UNIQUE ("summary_date");



ALTER TABLE ONLY "public"."entry_methods"
    ADD CONSTRAINT "entry_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_reports"
    ADD CONSTRAINT "error_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."failed_login_attempts"
    ADD CONSTRAINT "failed_login_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."giveaway_entries"
    ADD CONSTRAINT "giveaway_entries_giveaway_id_email_key" UNIQUE ("giveaway_id", "email");



ALTER TABLE ONLY "public"."giveaway_entries"
    ADD CONSTRAINT "giveaway_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."giveaways"
    ADD CONSTRAINT "giveaways_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pen_names"
    ADD CONSTRAINT "pen_names_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pen_names"
    ADD CONSTRAINT "pen_names_slug_unique" UNIQUE ("slug");



ALTER TABLE ONLY "public"."reader_deliveries"
    ADD CONSTRAINT "reader_deliveries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reader_download_logs"
    ADD CONSTRAINT "reader_download_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reader_entries"
    ADD CONSTRAINT "reader_entries_campaign_id_user_id_entry_method_key" UNIQUE ("campaign_id", "user_id", "entry_method");



ALTER TABLE ONLY "public"."reader_entries"
    ADD CONSTRAINT "reader_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reader_library"
    ADD CONSTRAINT "reader_library_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reader_library"
    ADD CONSTRAINT "reader_library_reader_id_book_id_key" UNIQUE ("user_id", "book_id");



ALTER TABLE ONLY "public"."reader_preferences"
    ADD CONSTRAINT "reader_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reader_preferences"
    ADD CONSTRAINT "reader_preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."reading_features"
    ADD CONSTRAINT "reading_features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reading_features"
    ADD CONSTRAINT "reading_features_user_id_book_id_key" UNIQUE ("user_id", "book_id");



ALTER TABLE ONLY "public"."reading_progress_history"
    ADD CONSTRAINT "reading_progress_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reading_progress"
    ADD CONSTRAINT "reading_progress_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reading_progress"
    ADD CONSTRAINT "reading_progress_user_id_book_id_device_id_key" UNIQUE ("user_id", "book_id", "device_id");



ALTER TABLE ONLY "public"."series"
    ADD CONSTRAINT "series_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_entitlements"
    ADD CONSTRAINT "user_entitlements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_entitlements"
    ADD CONSTRAINT "user_entitlements_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_upgrade_logs"
    ADD CONSTRAINT "user_upgrade_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_book_id_key" UNIQUE ("user_id", "book_id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_pen_name_id_key" UNIQUE ("user_id", "pen_name_id");



CREATE UNIQUE INDEX "books_asin_unique_idx" ON "public"."books" USING "btree" ("user_id", "lower"("asin")) WHERE (("asin" IS NOT NULL) AND ("asin" <> ''::"text"));



COMMENT ON INDEX "public"."books_asin_unique_idx" IS 'Prevents duplicate ASIN entries per user';



CREATE INDEX "books_isbn_idx" ON "public"."books" USING "btree" ("isbn") WHERE ("isbn" IS NOT NULL);



CREATE UNIQUE INDEX "books_isbn_unique_idx" ON "public"."books" USING "btree" ("user_id", "lower"("isbn")) WHERE (("isbn" IS NOT NULL) AND ("isbn" <> ''::"text"));



COMMENT ON INDEX "public"."books_isbn_unique_idx" IS 'Prevents duplicate ISBN entries per user';



CREATE UNIQUE INDEX "books_title_author_unique_idx" ON "public"."books" USING "btree" ("user_id", "lower"("title"), "lower"("author"));



COMMENT ON INDEX "public"."books_title_author_unique_idx" IS 'Prevents duplicate title/author combinations per user';



CREATE INDEX "books_user_id_idx" ON "public"."books" USING "btree" ("user_id");



CREATE INDEX "campaign_entry_methods_campaign_id_idx" ON "public"."campaign_entry_methods" USING "btree" ("campaign_id");



CREATE INDEX "campaigns_book_genre_idx" ON "public"."campaigns" USING "btree" ("book_genre");



CREATE INDEX "campaigns_campaign_genre_idx" ON "public"."campaigns" USING "btree" ("campaign_genre");



CREATE INDEX "campaigns_campaign_type_idx" ON "public"."campaigns" USING "btree" ("campaign_type");



CREATE INDEX "campaigns_duration_idx" ON "public"."campaigns" USING "btree" ("duration");



CREATE INDEX "campaigns_end_date_idx" ON "public"."campaigns" USING "btree" ("end_date");



CREATE INDEX "campaigns_gdpr_checkbox_idx" ON "public"."campaigns" USING "btree" ("gdpr_checkbox");



CREATE INDEX "campaigns_is_featured_idx" ON "public"."campaigns" USING "btree" ("is_featured");



CREATE INDEX "campaigns_number_of_winners_idx" ON "public"."campaigns" USING "btree" ("number_of_winners");



CREATE INDEX "campaigns_prize_format_idx" ON "public"."campaigns" USING "btree" ("prize_format");



CREATE INDEX "campaigns_status_idx" ON "public"."campaigns" USING "btree" ("status");



CREATE INDEX "campaigns_target_entries_idx" ON "public"."campaigns" USING "btree" ("target_entries");



CREATE INDEX "campaigns_user_id_idx" ON "public"."campaigns" USING "btree" ("user_id");



CREATE INDEX "comments_book_id_idx" ON "public"."comments" USING "btree" ("book_id");



CREATE INDEX "comments_created_at_idx" ON "public"."comments" USING "btree" ("created_at");



CREATE INDEX "comments_user_id_idx" ON "public"."comments" USING "btree" ("user_id");



CREATE INDEX "idx_analytics_events_category" ON "public"."analytics_events" USING "btree" ("event_category");



CREATE INDEX "idx_analytics_events_category_time" ON "public"."analytics_events" USING "btree" ("event_category", "created_at" DESC);



COMMENT ON INDEX "public"."idx_analytics_events_category_time" IS 'Index for querying analytics events by category and time';



CREATE INDEX "idx_analytics_events_name_time" ON "public"."analytics_events" USING "btree" ("event_name", "created_at" DESC);



CREATE INDEX "idx_analytics_events_properties_gin" ON "public"."analytics_events" USING "gin" ("properties");



COMMENT ON INDEX "public"."idx_analytics_events_properties_gin" IS 'GIN index for efficient JSONB properties queries';



CREATE INDEX "idx_analytics_events_session_time" ON "public"."analytics_events" USING "btree" ("session_id", "created_at" DESC);



CREATE INDEX "idx_analytics_events_source" ON "public"."analytics_events" USING "btree" ("source", "created_at" DESC);



CREATE INDEX "idx_analytics_events_timestamp" ON "public"."analytics_events" USING "btree" ("timestamp" DESC);



CREATE INDEX "idx_analytics_events_user_id" ON "public"."analytics_events" USING "btree" ("user_id");



CREATE INDEX "idx_analytics_events_user_time" ON "public"."analytics_events" USING "btree" ("user_id", "created_at" DESC);



COMMENT ON INDEX "public"."idx_analytics_events_user_time" IS 'Index for querying analytics events by user and time';



CREATE INDEX "idx_book_files_book_id" ON "public"."book_files" USING "btree" ("book_id");



CREATE UNIQUE INDEX "idx_book_files_delivery_format_unique" ON "public"."book_files" USING "btree" ("delivery_method_id", "format") WHERE (("status")::"text" = 'active'::"text");



CREATE INDEX "idx_book_files_delivery_method_id" ON "public"."book_files" USING "btree" ("delivery_method_id");



CREATE INDEX "idx_book_files_format" ON "public"."book_files" USING "btree" ("format");



CREATE INDEX "idx_book_files_status" ON "public"."book_files" USING "btree" ("status");



CREATE INDEX "idx_book_metadata_book_id" ON "public"."book_metadata" USING "btree" ("book_id");



CREATE INDEX "idx_book_metadata_checksum" ON "public"."book_metadata" USING "btree" ("checksum");



CREATE INDEX "idx_book_metadata_updated" ON "public"."book_metadata" USING "btree" ("updated_at");



CREATE INDEX "idx_book_positions_book_id" ON "public"."book_positions" USING "btree" ("book_id");



CREATE INDEX "idx_books_series_id" ON "public"."books" USING "btree" ("series_id");



CREATE INDEX "idx_books_series_order" ON "public"."books" USING "btree" ("series_order");



CREATE INDEX "idx_books_status" ON "public"."books" USING "btree" ("status");



CREATE INDEX "idx_books_user_status" ON "public"."books" USING "btree" ("user_id", "status");



CREATE INDEX "idx_daily_summaries_date" ON "public"."daily_analytics_summaries" USING "btree" ("summary_date" DESC);



CREATE UNIQUE INDEX "idx_delivery_methods_book_format_unique" ON "public"."book_delivery_methods" USING "btree" ("book_id", "format") WHERE ("is_active" = true);



CREATE INDEX "idx_delivery_methods_book_id" ON "public"."book_delivery_methods" USING "btree" ("book_id");



CREATE INDEX "idx_delivery_methods_created_at" ON "public"."book_delivery_methods" USING "btree" ("created_at");



CREATE INDEX "idx_delivery_methods_is_active" ON "public"."book_delivery_methods" USING "btree" ("is_active");



CREATE INDEX "idx_delivery_methods_slug" ON "public"."book_delivery_methods" USING "btree" ("slug");



CREATE INDEX "idx_error_reports_category_time" ON "public"."error_reports" USING "btree" ("category", "created_at" DESC);



CREATE INDEX "idx_error_reports_context_gin" ON "public"."error_reports" USING "gin" ("context");



COMMENT ON INDEX "public"."idx_error_reports_context_gin" IS 'GIN index for efficient JSONB context queries';



CREATE INDEX "idx_error_reports_resolved_time" ON "public"."error_reports" USING "btree" ("resolved", "created_at" DESC);



CREATE INDEX "idx_error_reports_severity" ON "public"."error_reports" USING "btree" ("severity");



CREATE INDEX "idx_error_reports_severity_time" ON "public"."error_reports" USING "btree" ("severity", "created_at" DESC);



COMMENT ON INDEX "public"."idx_error_reports_severity_time" IS 'Index for querying error reports by severity and time';



CREATE INDEX "idx_error_reports_timestamp" ON "public"."error_reports" USING "btree" ("timestamp" DESC);



CREATE INDEX "idx_error_reports_user_time" ON "public"."error_reports" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_failed_login_attempts_email" ON "public"."failed_login_attempts" USING "btree" ("email");



CREATE INDEX "idx_failed_login_attempts_email_success" ON "public"."failed_login_attempts" USING "btree" ("email", "success");



CREATE INDEX "idx_failed_login_attempts_ip" ON "public"."failed_login_attempts" USING "btree" ("ip_address");



CREATE INDEX "idx_failed_login_attempts_timestamp" ON "public"."failed_login_attempts" USING "btree" ("timestamp");



CREATE INDEX "idx_giveaway_entries_created_at" ON "public"."giveaway_entries" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_giveaway_entries_email" ON "public"."giveaway_entries" USING "btree" ("email");



CREATE INDEX "idx_giveaway_entries_giveaway_created" ON "public"."giveaway_entries" USING "btree" ("giveaway_id", "created_at");



CREATE INDEX "idx_giveaway_entries_giveaway_id" ON "public"."giveaway_entries" USING "btree" ("giveaway_id");



CREATE INDEX "idx_giveaway_entries_user_id" ON "public"."giveaway_entries" USING "btree" ("user_id") WHERE ("user_id" IS NOT NULL);



CREATE INDEX "idx_giveaways_end_date" ON "public"."giveaways" USING "btree" ("end_date");



CREATE INDEX "idx_giveaways_featured" ON "public"."giveaways" USING "btree" ("is_featured");



CREATE INDEX "idx_giveaways_status" ON "public"."giveaways" USING "btree" ("status");



CREATE INDEX "idx_giveaways_status_end_date" ON "public"."giveaways" USING "btree" ("status", "end_date") WHERE ("status" = 'active'::"text");



CREATE INDEX "idx_pen_names_slug" ON "public"."pen_names" USING "btree" ("slug");



CREATE INDEX "idx_progress_history_timestamp" ON "public"."reading_progress_history" USING "btree" ("timestamp");



CREATE INDEX "idx_progress_history_user_book" ON "public"."reading_progress_history" USING "btree" ("user_id", "book_id");



CREATE INDEX "idx_reader_deliveries_access_token" ON "public"."reader_deliveries" USING "btree" ("access_token");



CREATE INDEX "idx_reader_deliveries_delivered_at" ON "public"."reader_deliveries" USING "btree" ("delivered_at");



CREATE INDEX "idx_reader_deliveries_delivery_method_id" ON "public"."reader_deliveries" USING "btree" ("delivery_method_id");



CREATE INDEX "idx_reader_deliveries_email_method" ON "public"."reader_deliveries" USING "btree" ("reader_email", "delivery_method_id");



CREATE INDEX "idx_reader_deliveries_expires_at" ON "public"."reader_deliveries" USING "btree" ("expires_at");



CREATE INDEX "idx_reader_deliveries_reader_email" ON "public"."reader_deliveries" USING "btree" ("reader_email");



CREATE INDEX "idx_reader_deliveries_status" ON "public"."reader_deliveries" USING "btree" ("status");



CREATE INDEX "idx_reader_download_logs_delivery_id" ON "public"."reader_download_logs" USING "btree" ("delivery_id");



CREATE INDEX "idx_reader_download_logs_downloaded_at" ON "public"."reader_download_logs" USING "btree" ("downloaded_at");



CREATE INDEX "idx_reader_download_logs_file_id" ON "public"."reader_download_logs" USING "btree" ("file_id");



CREATE INDEX "idx_reader_library_acquired_at" ON "public"."reader_library" USING "btree" ("acquired_at");



CREATE INDEX "idx_reader_library_book_id" ON "public"."reader_library" USING "btree" ("book_id");



CREATE INDEX "idx_reader_library_campaign_id" ON "public"."reader_library" USING "btree" ("campaign_id");



CREATE INDEX "idx_reader_library_reader_id" ON "public"."reader_library" USING "btree" ("user_id");



CREATE INDEX "idx_reader_library_status" ON "public"."reader_library" USING "btree" ("status");



CREATE INDEX "idx_reader_preferences_user_id" ON "public"."reader_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_reading_features_user_book" ON "public"."reading_features" USING "btree" ("user_id", "book_id");



CREATE INDEX "idx_reading_progress_updated" ON "public"."reading_progress" USING "btree" ("last_updated");



CREATE INDEX "idx_reading_progress_user_book" ON "public"."reading_progress" USING "btree" ("user_id", "book_id");



CREATE INDEX "idx_series_created_at" ON "public"."series" USING "btree" ("created_at");



CREATE INDEX "idx_series_status" ON "public"."series" USING "btree" ("status");



CREATE INDEX "idx_series_user_id" ON "public"."series" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_series_user_name_unique" ON "public"."series" USING "btree" ("user_id", "name") WHERE (("status")::"text" = 'active'::"text");



CREATE INDEX "idx_user_sessions_last_activity" ON "public"."user_sessions" USING "btree" ("last_activity" DESC);



CREATE INDEX "idx_user_sessions_start_time" ON "public"."user_sessions" USING "btree" ("start_time" DESC);



CREATE INDEX "idx_user_sessions_user_time" ON "public"."user_sessions" USING "btree" ("user_id", "start_time" DESC);



CREATE INDEX "idx_user_upgrade_logs_reason" ON "public"."user_upgrade_logs" USING "btree" ("upgrade_reason");



CREATE INDEX "idx_user_upgrade_logs_upgraded_at" ON "public"."user_upgrade_logs" USING "btree" ("upgraded_at");



CREATE INDEX "idx_user_upgrade_logs_user_id" ON "public"."user_upgrade_logs" USING "btree" ("user_id");



CREATE INDEX "idx_users_deleted_at" ON "public"."users" USING "btree" ("deleted_at");



CREATE INDEX "idx_users_deleted_cleanup" ON "public"."users" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);



CREATE INDEX "idx_votes_book_id" ON "public"."votes" USING "btree" ("book_id");



CREATE INDEX "idx_votes_pen_name_id" ON "public"."votes" USING "btree" ("pen_name_id");



CREATE INDEX "idx_votes_user_id" ON "public"."votes" USING "btree" ("user_id");



CREATE INDEX "idx_votes_vote_type" ON "public"."votes" USING "btree" ("vote_type");



CREATE INDEX "pen_names_genre_idx" ON "public"."pen_names" USING "btree" ("genre");



CREATE INDEX "pen_names_status_idx" ON "public"."pen_names" USING "btree" ("status");



CREATE INDEX "pen_names_user_id_idx" ON "public"."pen_names" USING "btree" ("user_id");



CREATE INDEX "reader_entries_campaign_id_idx" ON "public"."reader_entries" USING "btree" ("campaign_id");



CREATE INDEX "reader_entries_created_at_idx" ON "public"."reader_entries" USING "btree" ("created_at");



CREATE INDEX "reader_entries_email_idx" ON "public"."reader_entries" USING "btree" ("email");



CREATE INDEX "reader_entries_status_idx" ON "public"."reader_entries" USING "btree" ("status");



CREATE INDEX "reader_entries_user_id_idx" ON "public"."reader_entries" USING "btree" ("user_id");



CREATE INDEX "user_entitlements_plan_name_idx" ON "public"."user_entitlements" USING "btree" ("plan_name");



CREATE INDEX "user_entitlements_user_id_idx" ON "public"."user_entitlements" USING "btree" ("user_id");



CREATE INDEX "user_settings_user_id_idx" ON "public"."user_settings" USING "btree" ("user_id");



CREATE INDEX "users_auth_source_idx" ON "public"."users" USING "btree" ("auth_source");



CREATE INDEX "users_favorite_genres_idx" ON "public"."users" USING "gin" ("favorite_genres") WHERE ("user_type" = ANY (ARRAY['reader'::"text", 'both'::"text"]));



CREATE INDEX "users_user_type_idx" ON "public"."users" USING "btree" ("user_type");



CREATE OR REPLACE TRIGGER "create_user_entitlements_trigger" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."create_default_user_entitlements"();



CREATE OR REPLACE TRIGGER "create_user_settings_trigger" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."create_default_user_settings"();



CREATE OR REPLACE TRIGGER "ensure_single_primary_pen_name_trigger" BEFORE INSERT OR UPDATE ON "public"."pen_names" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_single_primary_pen_name"();



CREATE OR REPLACE TRIGGER "increment_download_count_trigger" AFTER INSERT ON "public"."reader_download_logs" FOR EACH ROW WHEN ((("new"."status")::"text" = 'success'::"text")) EXECUTE FUNCTION "public"."increment_download_count"();



CREATE OR REPLACE TRIGGER "trigger_check_campaign_max_entries" BEFORE INSERT ON "public"."reader_entries" FOR EACH ROW EXECUTE FUNCTION "public"."check_campaign_max_entries"();



CREATE OR REPLACE TRIGGER "trigger_set_pen_name_slug" BEFORE INSERT OR UPDATE OF "name" ON "public"."pen_names" FOR EACH ROW EXECUTE FUNCTION "public"."set_pen_name_slug"();



CREATE OR REPLACE TRIGGER "trigger_update_campaign_entry_count" AFTER INSERT OR DELETE OR UPDATE ON "public"."reader_entries" FOR EACH ROW EXECUTE FUNCTION "public"."update_campaign_entry_count"();



CREATE OR REPLACE TRIGGER "trigger_update_giveaway_entry_count" AFTER INSERT OR DELETE ON "public"."giveaway_entries" FOR EACH ROW EXECUTE FUNCTION "public"."update_giveaway_entry_count"();



CREATE OR REPLACE TRIGGER "update_book_comment_count_trigger" AFTER INSERT OR DELETE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_book_comment_count"();



CREATE OR REPLACE TRIGGER "update_book_files_updated_at_trigger" BEFORE UPDATE ON "public"."book_files" FOR EACH ROW EXECUTE FUNCTION "public"."update_book_files_updated_at"();



CREATE OR REPLACE TRIGGER "update_book_metadata_updated_at_trigger" BEFORE UPDATE ON "public"."book_metadata" FOR EACH ROW EXECUTE FUNCTION "public"."update_book_metadata_updated_at"();



CREATE OR REPLACE TRIGGER "update_book_positions_updated_at" BEFORE UPDATE ON "public"."book_positions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_books_updated_at" BEFORE UPDATE ON "public"."books" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_campaigns_updated_at" BEFORE UPDATE ON "public"."campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_comments_updated_at_trigger" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_comments_updated_at"();



CREATE OR REPLACE TRIGGER "update_delivery_methods_updated_at_trigger" BEFORE UPDATE ON "public"."book_delivery_methods" FOR EACH ROW EXECUTE FUNCTION "public"."update_delivery_methods_updated_at"();



CREATE OR REPLACE TRIGGER "update_pen_names_updated_at" BEFORE UPDATE ON "public"."pen_names" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_reader_entries_updated_at" BEFORE UPDATE ON "public"."reader_entries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_reader_library_timestamp" BEFORE UPDATE ON "public"."reader_library" FOR EACH ROW EXECUTE FUNCTION "public"."update_reader_library_timestamp"();



CREATE OR REPLACE TRIGGER "update_reader_preferences_updated_at" BEFORE UPDATE ON "public"."reader_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_reading_progress_sync" BEFORE UPDATE ON "public"."reading_progress" FOR EACH ROW EXECUTE FUNCTION "public"."update_sync_version"();



CREATE OR REPLACE TRIGGER "update_series_updated_at_trigger" BEFORE UPDATE ON "public"."series" FOR EACH ROW EXECUTE FUNCTION "public"."update_series_updated_at"();



CREATE OR REPLACE TRIGGER "update_user_entitlements_updated_at" BEFORE UPDATE ON "public"."user_entitlements" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_settings_updated_at" BEFORE UPDATE ON "public"."user_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."book_delivery_methods"
    ADD CONSTRAINT "book_delivery_methods_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."book_files"
    ADD CONSTRAINT "book_files_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."book_files"
    ADD CONSTRAINT "book_files_delivery_method_id_fkey" FOREIGN KEY ("delivery_method_id") REFERENCES "public"."book_delivery_methods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."book_metadata"
    ADD CONSTRAINT "book_metadata_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."book_positions"
    ADD CONSTRAINT "book_positions_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pen_name_id_fkey" FOREIGN KEY ("pen_name_id") REFERENCES "public"."pen_names"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_entry_methods"
    ADD CONSTRAINT "campaign_entry_methods_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_entry_methods"
    ADD CONSTRAINT "campaign_entry_methods_entry_method_id_fkey" FOREIGN KEY ("entry_method_id") REFERENCES "public"."entry_methods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_pen_name_id_fkey" FOREIGN KEY ("pen_name_id") REFERENCES "public"."pen_names"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."error_reports"
    ADD CONSTRAINT "error_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."giveaway_entries"
    ADD CONSTRAINT "giveaway_entries_giveaway_id_fkey" FOREIGN KEY ("giveaway_id") REFERENCES "public"."giveaways"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."giveaway_entries"
    ADD CONSTRAINT "giveaway_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pen_names"
    ADD CONSTRAINT "pen_names_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reader_deliveries"
    ADD CONSTRAINT "reader_deliveries_delivery_method_id_fkey" FOREIGN KEY ("delivery_method_id") REFERENCES "public"."book_delivery_methods"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reader_download_logs"
    ADD CONSTRAINT "reader_download_logs_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "public"."reader_deliveries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reader_download_logs"
    ADD CONSTRAINT "reader_download_logs_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."book_files"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reader_entries"
    ADD CONSTRAINT "reader_entries_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reader_entries"
    ADD CONSTRAINT "reader_entries_referred_by_fkey" FOREIGN KEY ("referred_by") REFERENCES "public"."reader_entries"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reader_entries"
    ADD CONSTRAINT "reader_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reader_library"
    ADD CONSTRAINT "reader_library_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reader_library"
    ADD CONSTRAINT "reader_library_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reader_library"
    ADD CONSTRAINT "reader_library_delivery_method_id_fkey" FOREIGN KEY ("delivery_method_id") REFERENCES "public"."book_delivery_methods"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reader_library"
    ADD CONSTRAINT "reader_library_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reader_preferences"
    ADD CONSTRAINT "reader_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_features"
    ADD CONSTRAINT "reading_features_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_features"
    ADD CONSTRAINT "reading_features_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_progress"
    ADD CONSTRAINT "reading_progress_book_id_fkey1" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_progress_history"
    ADD CONSTRAINT "reading_progress_history_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_progress_history"
    ADD CONSTRAINT "reading_progress_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_progress"
    ADD CONSTRAINT "reading_progress_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."series"
    ADD CONSTRAINT "series_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_entitlements"
    ADD CONSTRAINT "user_entitlements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_upgrade_logs"
    ADD CONSTRAINT "user_upgrade_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pen_name_id_fkey" FOREIGN KEY ("pen_name_id") REFERENCES "public"."pen_names"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow admin users to read daily summaries" ON "public"."daily_analytics_summaries" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("users"."user_type" = 'admin'::"text")))));



CREATE POLICY "Allow download logging" ON "public"."reader_download_logs" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Allow entitlements creation during signup" ON "public"."user_entitlements" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Allow service role to manage daily summaries" ON "public"."daily_analytics_summaries" TO "service_role" USING (true);



CREATE POLICY "Anyone can view active entry methods" ON "public"."entry_methods" FOR SELECT TO "authenticated", "anon" USING (("is_active" = true));



CREATE POLICY "Anyone can view comments" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "Anyone can view positions" ON "public"."book_positions" FOR SELECT USING (true);



CREATE POLICY "Anyone can view votes" ON "public"."votes" FOR SELECT USING (true);



COMMENT ON POLICY "Anyone can view votes" ON "public"."votes" IS 'Allows public read access to votes';



CREATE POLICY "Authenticated or service can insert" ON "public"."book_positions" FOR INSERT WITH CHECK ((( SELECT "auth"."role"() AS "role") = ANY (ARRAY['authenticated'::"text", 'service_role'::"text"])));



CREATE POLICY "Authenticated users can cast votes" ON "public"."votes" FOR INSERT WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "user_id") AND (( SELECT "auth"."uid"() AS "uid") IS NOT NULL)));



CREATE POLICY "Authenticated users can insert comments" ON "public"."comments" FOR INSERT WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "user_id") AND (( SELECT "auth"."uid"() AS "uid") IS NOT NULL)));



CREATE POLICY "Campaign owners can delete entry methods" ON "public"."campaign_entry_methods" FOR DELETE TO "authenticated" USING (("campaign_id" IN ( SELECT "campaigns"."id"
   FROM "public"."campaigns"
  WHERE ("campaigns"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Campaign owners can insert entry methods" ON "public"."campaign_entry_methods" FOR INSERT TO "authenticated" WITH CHECK (("campaign_id" IN ( SELECT "campaigns"."id"
   FROM "public"."campaigns"
  WHERE ("campaigns"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Campaign owners can update entry methods" ON "public"."campaign_entry_methods" FOR UPDATE TO "authenticated" USING (("campaign_id" IN ( SELECT "campaigns"."id"
   FROM "public"."campaigns"
  WHERE ("campaigns"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("campaign_id" IN ( SELECT "campaigns"."id"
   FROM "public"."campaigns"
  WHERE ("campaigns"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "Giveaways access policy" ON "public"."giveaways" USING (((( SELECT "auth"."role"() AS "role") = 'service_role'::"text") OR ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text") AND ((( SELECT "auth"."uid"() AS "uid"))::"text" = ("author_data" ->> 'user_id'::"text"))) OR (("status" = 'active'::"text") OR ("status" = 'ended'::"text"))));



COMMENT ON POLICY "Giveaways access policy" ON "public"."giveaways" IS 'Single consolidated RLS policy - no multiple permissive policies';



CREATE POLICY "Public can insert reader deliveries" ON "public"."reader_deliveries" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Public can view reader deliveries" ON "public"."reader_deliveries" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Service role and authenticated users can manage analytics" ON "public"."analytics_events" USING (((( SELECT "auth"."role"() AS "role") = 'service_role'::"text") OR (( SELECT "auth"."role"() AS "role") = 'authenticated'::"text")));



COMMENT ON POLICY "Service role and authenticated users can manage analytics" ON "public"."analytics_events" IS 'Single consolidated RLS policy - no multiple permissive policies';



CREATE POLICY "Service role and users can manage entries" ON "public"."giveaway_entries" USING (((( SELECT "auth"."role"() AS "role") = 'service_role'::"text") OR (( SELECT "auth"."uid"() AS "uid") = "user_id") OR ("user_id" IS NULL)));



COMMENT ON POLICY "Service role and users can manage entries" ON "public"."giveaway_entries" IS 'Consolidated RLS policy to reduce multiple permissive policy overhead';



CREATE POLICY "Service role can delete" ON "public"."book_positions" FOR DELETE USING ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



CREATE POLICY "Service role can insert upgrade logs" ON "public"."user_upgrade_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Service role can manage all entitlements" ON "public"."user_entitlements" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage entry methods" ON "public"."entry_methods" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can manage errors" ON "public"."error_reports" USING ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



COMMENT ON POLICY "Service role can manage errors" ON "public"."error_reports" IS 'Optimized RLS policy with SELECT subquery for better performance';



CREATE POLICY "Service role can manage failed login attempts" ON "public"."failed_login_attempts" USING ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



CREATE POLICY "Service role can manage, everyone can view book metadata" ON "public"."book_metadata" USING (((( SELECT "auth"."role"() AS "role") = 'service_role'::"text") OR true));



COMMENT ON POLICY "Service role can manage, everyone can view book metadata" ON "public"."book_metadata" IS 'Consolidated RLS policy to reduce multiple permissive policy overhead';



CREATE POLICY "Service role can update" ON "public"."book_positions" FOR UPDATE USING ((( SELECT "auth"."role"() AS "role") = 'service_role'::"text"));



CREATE POLICY "Users and campaign owners can view entries" ON "public"."reader_entries" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "user_id") OR ("campaign_id" IN ( SELECT "campaigns"."id"
   FROM "public"."campaigns"
  WHERE ("campaigns"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can add books to their library" ON "public"."reader_library" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can change their own votes" ON "public"."votes" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own book files" ON "public"."book_files" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_files"."book_id") AND ("books"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can delete their own books" ON "public"."books" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own campaigns" ON "public"."campaigns" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own comments" ON "public"."comments" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own delivery methods" ON "public"."book_delivery_methods" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_delivery_methods"."book_id") AND ("books"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can delete their own pen names" ON "public"."pen_names" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own series" ON "public"."series" FOR DELETE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can insert their own book files" ON "public"."book_files" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_files"."book_id") AND ("books"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can insert their own books" ON "public"."books" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own campaigns" ON "public"."campaigns" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own delivery methods" ON "public"."book_delivery_methods" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_delivery_methods"."book_id") AND ("books"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can insert their own entries" ON "public"."reader_entries" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own history" ON "public"."reading_progress_history" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own pen names" ON "public"."pen_names" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own series" ON "public"."series" FOR INSERT WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can insert their preferences" ON "public"."reader_preferences" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can manage their own features" ON "public"."reading_features" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can manage their own progress" ON "public"."reading_progress" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can manage their sessions" ON "public"."user_sessions" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



COMMENT ON POLICY "Users can manage their sessions" ON "public"."user_sessions" IS 'Optimized RLS policy with SELECT subquery for better performance';



CREATE POLICY "Users can remove their own votes" ON "public"."votes" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their library" ON "public"."reader_library" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own book files" ON "public"."book_files" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_files"."book_id") AND ("books"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_files"."book_id") AND ("books"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can update their own books" ON "public"."books" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own campaigns" ON "public"."campaigns" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own comments" ON "public"."comments" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own delivery methods" ON "public"."book_delivery_methods" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_delivery_methods"."book_id") AND ("books"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_delivery_methods"."book_id") AND ("books"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can update their own pen names" ON "public"."pen_names" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."users" FOR UPDATE TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "id") AND ("deleted_at" IS NULL))) WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "id") AND ("deleted_at" IS NULL)));



COMMENT ON POLICY "Users can update their own profile" ON "public"."users" IS 'Optimized RLS policy with SELECT subqueries for better performance';



CREATE POLICY "Users can update their own reader deliveries" ON "public"."reader_deliveries" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Users can update their own series" ON "public"."series" FOR UPDATE USING (("user_id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can update their own settings" ON "public"."user_settings" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their preferences" ON "public"."reader_preferences" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own upgrade logs" ON "public"."user_upgrade_logs" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own campaigns" ON "public"."campaigns" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own entitlements" ON "public"."user_entitlements" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own history" ON "public"."reading_progress_history" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own library" ON "public"."reader_library" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own preferences" ON "public"."reader_preferences" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "id") AND ("deleted_at" IS NULL)));



COMMENT ON POLICY "Users can view their own profile" ON "public"."users" IS 'Optimized RLS policy with SELECT subqueries for better performance';



CREATE POLICY "Users can view their own series" ON "public"."series" FOR SELECT USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view their own settings" ON "public"."user_settings" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "View book files" ON "public"."book_files" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."book_delivery_methods" "bdm"
     JOIN "public"."books" "b" ON (("b"."id" = "bdm"."book_id")))
  WHERE (("bdm"."book_id" = "book_files"."book_id") AND ("bdm"."is_active" = true) AND (("bdm"."delivery_method")::"text" = 'ebook'::"text")))) OR (EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_files"."book_id") AND ("books"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "View books" ON "public"."books" FOR SELECT USING ((("status" = 'active'::"text") OR (( SELECT "auth"."uid"() AS "uid") = "user_id")));



CREATE POLICY "View delivery methods" ON "public"."book_delivery_methods" FOR SELECT USING (((("is_active" = true) AND (("delivery_method")::"text" = ANY ((ARRAY['ebook'::character varying, 'audiobook'::character varying, 'print'::character varying])::"text"[]))) OR (EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_delivery_methods"."book_id") AND ("books"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "View download logs" ON "public"."reader_download_logs" FOR SELECT USING (true);



CREATE POLICY "View entry methods" ON "public"."campaign_entry_methods" FOR SELECT TO "authenticated", "anon" USING ((("campaign_id" IN ( SELECT "campaigns"."id"
   FROM "public"."campaigns"
  WHERE ("campaigns"."status" = 'active'::"text"))) OR ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text") AND ("campaign_id" IN ( SELECT "campaigns"."id"
   FROM "public"."campaigns"
  WHERE ("campaigns"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "View pen names" ON "public"."pen_names" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."books" "b"
  WHERE (("b"."pen_name_id" = "pen_names"."id") AND ("b"."status" = 'active'::"text")))) OR (( SELECT "auth"."uid"() AS "uid") = "user_id")));



ALTER TABLE "public"."analytics_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."book_delivery_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."book_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."book_metadata" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."book_positions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."books" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campaign_entry_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_analytics_summaries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."entry_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."error_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."failed_login_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."giveaway_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."giveaways" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pen_names" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reader_deliveries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reader_download_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reader_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reader_library" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reader_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reading_features" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reading_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reading_progress_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."series" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_entitlements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_upgrade_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



REVOKE ALL ON FUNCTION "public"."aggregate_daily_analytics"("target_date" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."aggregate_daily_analytics"("target_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."aggregate_daily_analytics"("target_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."aggregate_daily_analytics"("target_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_campaign_max_entries"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_campaign_max_entries"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_campaign_max_entries"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_campaign_max_entries"("campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_campaign_max_entries"("campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_campaign_max_entries"("campaign_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_critical_errors"("hours_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_critical_errors"("hours_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_critical_errors"("hours_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_user_limits"("target_user_id" "uuid", "check_campaigns" integer, "check_books" integer, "check_pen_names" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_limits"("target_user_id" "uuid", "check_campaigns" integer, "check_books" integer, "check_pen_names" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_limits"("target_user_id" "uuid", "check_campaigns" integer, "check_books" integer, "check_pen_names" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_accounts"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_accounts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_accounts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_analytics"("analytics_retention_days" integer, "error_retention_days" integer, "session_retention_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_analytics"("analytics_retention_days" integer, "error_retention_days" integer, "session_retention_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_analytics"("analytics_retention_days" integer, "error_retention_days" integer, "session_retention_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_failed_attempts"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_failed_attempts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_failed_attempts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_orphaned_user_records"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_orphaned_user_records"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_orphaned_user_records"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_user_entitlements"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_user_entitlements"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_user_entitlements"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_user_settings"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_user_settings"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_user_settings"() TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_book_comments"("book_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_book_comments"("book_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_book_comments"("book_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_book_downvotes"("book_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_book_downvotes"("book_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_book_downvotes"("book_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_book_upvotes"("book_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_book_upvotes"("book_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_book_upvotes"("book_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_pen_name_downvotes"("pen_name_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_pen_name_downvotes"("pen_name_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_pen_name_downvotes"("pen_name_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_pen_name_upvotes"("pen_name_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_pen_name_upvotes"("pen_name_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_pen_name_upvotes"("pen_name_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_single_primary_pen_name"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_single_primary_pen_name"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_single_primary_pen_name"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_delivery_slug"("title" "text", "book_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_delivery_slug"("title" "text", "book_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_delivery_slug"("title" "text", "book_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_slug"("input_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_storage_path"("user_id" "uuid", "book_id" "uuid", "file_name" "text", "file_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_storage_path"("user_id" "uuid", "book_id" "uuid", "file_name" "text", "file_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_storage_path"("user_id" "uuid", "book_id" "uuid", "file_name" "text", "file_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_analytics_storage_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_analytics_storage_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_analytics_storage_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_analytics_summary"("time_range" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_analytics_summary"("time_range" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_analytics_summary"("time_range" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_campaign_stats"("campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_campaign_stats"("campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_campaign_stats"("campaign_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_library_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_library_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_library_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_pen_name_book_count"("pen_name_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_pen_name_book_count"("pen_name_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pen_name_book_count"("pen_name_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_pen_name_campaign_count"("pen_name_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_pen_name_campaign_count"("pen_name_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pen_name_campaign_count"("pen_name_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_pen_names_with_counts"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_pen_names_with_counts"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pen_names_with_counts"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_pen_names_with_counts_by_status"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_pen_names_with_counts_by_status"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pen_names_with_counts_by_status"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_pen_names_with_counts_by_status"("target_user_id" "uuid", "target_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_pen_names_with_counts_by_status"("target_user_id" "uuid", "target_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pen_names_with_counts_by_status"("target_user_id" "uuid", "target_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_performance_metrics"("time_range" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_performance_metrics"("time_range" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_performance_metrics"("time_range" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_reader_library"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_reader_library"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_reader_library"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_reading_analytics"("time_range" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_reading_analytics"("time_range" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_reading_analytics"("time_range" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_campaign_entries"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_campaign_entries"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_campaign_entries"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_campaign_entries"("campaign_uuid" "uuid", "wp_user_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_campaign_entries"("campaign_uuid" "uuid", "wp_user_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_campaign_entries"("campaign_uuid" "uuid", "wp_user_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_dashboard_data"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_dashboard_data"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_dashboard_data"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_engagement_insights"("time_range" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_engagement_insights"("time_range" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_engagement_insights"("time_range" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_settings"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_settings"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_settings"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_book_comments"("book_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_book_comments"("book_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_book_comments"("book_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_book_downvotes"("book_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_book_downvotes"("book_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_book_downvotes"("book_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_book_upvotes"("book_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_book_upvotes"("book_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_book_upvotes"("book_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_download_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_download_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_download_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_pen_name_downvotes"("pen_name_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_pen_name_downvotes"("pen_name_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_pen_name_downvotes"("pen_name_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_pen_name_upvotes"("pen_name_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_pen_name_upvotes"("pen_name_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_pen_name_upvotes"("pen_name_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_campaign_accepting_entries"("campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_campaign_accepting_entries"("campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_campaign_accepting_entries"("campaign_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."manual_cleanup_expired_accounts"() TO "anon";
GRANT ALL ON FUNCTION "public"."manual_cleanup_expired_accounts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."manual_cleanup_expired_accounts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."migrate_api_keys_to_encrypted"() TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_api_keys_to_encrypted"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_api_keys_to_encrypted"() TO "service_role";



GRANT ALL ON FUNCTION "public"."permanently_delete_expired_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."permanently_delete_expired_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."permanently_delete_expired_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."recover_user"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."recover_user"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."recover_user"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_pen_name_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_pen_name_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_pen_name_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."soft_delete_user"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."soft_delete_user"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."soft_delete_user"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_book_comment_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_book_comment_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_book_comment_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_book_files_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_book_files_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_book_files_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_book_metadata_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_book_metadata_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_book_metadata_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_campaign_entry_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_campaign_entry_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_campaign_entry_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_campaign_entry_count"("campaign_id" "uuid", "new_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."update_campaign_entry_count"("campaign_id" "uuid", "new_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_campaign_entry_count"("campaign_id" "uuid", "new_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_comments_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_comments_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_comments_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_delivery_methods_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_delivery_methods_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_delivery_methods_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_giveaway_entry_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_giveaway_entry_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_giveaway_entry_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_reader_library_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_reader_library_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_reader_library_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_reader_preferences"("target_user_id" "uuid", "preferences" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_reader_preferences"("target_user_id" "uuid", "preferences" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_reader_preferences"("target_user_id" "uuid", "preferences" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_reader_preferences"("target_user_id" "uuid", "new_favorite_genres" "text"[], "new_reading_preferences" "jsonb", "new_email_notifications" boolean, "new_giveaway_reminders" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."update_reader_preferences"("target_user_id" "uuid", "new_favorite_genres" "text"[], "new_reading_preferences" "jsonb", "new_email_notifications" boolean, "new_giveaway_reminders" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_reader_preferences"("target_user_id" "uuid", "new_favorite_genres" "text"[], "new_reading_preferences" "jsonb", "new_email_notifications" boolean, "new_giveaway_reminders" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_reading_status"("p_book_id" "uuid", "p_percentage" numeric, "p_position" integer, "p_total_positions" integer, "p_locator" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_reading_status"("p_book_id" "uuid", "p_percentage" numeric, "p_position" integer, "p_total_positions" integer, "p_locator" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_reading_status"("p_book_id" "uuid", "p_percentage" numeric, "p_position" integer, "p_total_positions" integer, "p_locator" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_series_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_series_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_series_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_sync_version"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_sync_version"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_sync_version"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "settings_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "settings_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "settings_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "new_font" "text", "new_theme" "text", "new_sidebar_collapsed" boolean, "new_keyboard_shortcuts_enabled" boolean, "new_email_notifications" boolean, "new_marketing_emails" boolean, "new_weekly_reports" boolean, "new_language" "text", "new_timezone" "text", "new_usage_analytics" boolean, "new_auto_save_drafts" boolean, "new_mailerlite_group_id" "text", "new_mailerlite_enabled" boolean, "new_mailchimp_list_id" "text", "new_mailchimp_enabled" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "new_font" "text", "new_theme" "text", "new_sidebar_collapsed" boolean, "new_keyboard_shortcuts_enabled" boolean, "new_email_notifications" boolean, "new_marketing_emails" boolean, "new_weekly_reports" boolean, "new_language" "text", "new_timezone" "text", "new_usage_analytics" boolean, "new_auto_save_drafts" boolean, "new_mailerlite_group_id" "text", "new_mailerlite_enabled" boolean, "new_mailchimp_list_id" "text", "new_mailchimp_enabled" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "new_font" "text", "new_theme" "text", "new_sidebar_collapsed" boolean, "new_keyboard_shortcuts_enabled" boolean, "new_email_notifications" boolean, "new_marketing_emails" boolean, "new_weekly_reports" boolean, "new_language" "text", "new_timezone" "text", "new_usage_analytics" boolean, "new_auto_save_drafts" boolean, "new_mailerlite_group_id" "text", "new_mailerlite_enabled" boolean, "new_mailchimp_list_id" "text", "new_mailchimp_enabled" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "new_font" "text", "new_theme" "text", "new_sidebar_collapsed" boolean, "new_keyboard_shortcuts_enabled" boolean, "new_email_notifications" boolean, "new_marketing_emails" boolean, "new_weekly_reports" boolean, "new_language" "text", "new_timezone" "text", "new_usage_analytics" boolean, "new_auto_save_drafts" boolean, "new_mailerlite_api_key" "text", "new_mailerlite_group_id" "text", "new_mailerlite_enabled" boolean, "new_mailchimp_api_key" "text", "new_mailchimp_list_id" "text", "new_mailchimp_enabled" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "new_font" "text", "new_theme" "text", "new_sidebar_collapsed" boolean, "new_keyboard_shortcuts_enabled" boolean, "new_email_notifications" boolean, "new_marketing_emails" boolean, "new_weekly_reports" boolean, "new_language" "text", "new_timezone" "text", "new_usage_analytics" boolean, "new_auto_save_drafts" boolean, "new_mailerlite_api_key" "text", "new_mailerlite_group_id" "text", "new_mailerlite_enabled" boolean, "new_mailchimp_api_key" "text", "new_mailchimp_list_id" "text", "new_mailchimp_enabled" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_settings"("target_user_id" "uuid", "new_font" "text", "new_theme" "text", "new_sidebar_collapsed" boolean, "new_keyboard_shortcuts_enabled" boolean, "new_email_notifications" boolean, "new_marketing_emails" boolean, "new_weekly_reports" boolean, "new_language" "text", "new_timezone" "text", "new_usage_analytics" boolean, "new_auto_save_drafts" boolean, "new_mailerlite_api_key" "text", "new_mailerlite_group_id" "text", "new_mailerlite_enabled" boolean, "new_mailchimp_api_key" "text", "new_mailchimp_list_id" "text", "new_mailchimp_enabled" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_type"("target_user_id" "uuid", "new_user_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_type"("target_user_id" "uuid", "new_user_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_type"("target_user_id" "uuid", "new_user_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_foreign_key_consistency"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_foreign_key_consistency"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_foreign_key_consistency"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_positions_json"("positions_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_positions_json"("positions_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_positions_json"("positions_data" "jsonb") TO "service_role";



GRANT ALL ON TABLE "public"."analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_events" TO "service_role";



GRANT ALL ON TABLE "public"."book_delivery_methods" TO "anon";
GRANT ALL ON TABLE "public"."book_delivery_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."book_delivery_methods" TO "service_role";



GRANT ALL ON TABLE "public"."book_files" TO "anon";
GRANT ALL ON TABLE "public"."book_files" TO "authenticated";
GRANT ALL ON TABLE "public"."book_files" TO "service_role";



GRANT ALL ON TABLE "public"."book_metadata" TO "anon";
GRANT ALL ON TABLE "public"."book_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."book_metadata" TO "service_role";



GRANT ALL ON TABLE "public"."book_positions" TO "anon";
GRANT ALL ON TABLE "public"."book_positions" TO "authenticated";
GRANT ALL ON TABLE "public"."book_positions" TO "service_role";



GRANT ALL ON TABLE "public"."books" TO "anon";
GRANT ALL ON TABLE "public"."books" TO "authenticated";
GRANT ALL ON TABLE "public"."books" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_entry_methods" TO "anon";
GRANT ALL ON TABLE "public"."campaign_entry_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_entry_methods" TO "service_role";



GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."daily_analytics_summaries" TO "anon";
GRANT ALL ON TABLE "public"."daily_analytics_summaries" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_analytics_summaries" TO "service_role";



GRANT ALL ON TABLE "public"."entry_methods" TO "anon";
GRANT ALL ON TABLE "public"."entry_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."entry_methods" TO "service_role";



GRANT ALL ON TABLE "public"."error_reports" TO "anon";
GRANT ALL ON TABLE "public"."error_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."error_reports" TO "service_role";



GRANT ALL ON TABLE "public"."failed_login_attempts" TO "anon";
GRANT ALL ON TABLE "public"."failed_login_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."failed_login_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."giveaway_entries" TO "anon";
GRANT ALL ON TABLE "public"."giveaway_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."giveaway_entries" TO "service_role";



GRANT ALL ON TABLE "public"."giveaways" TO "anon";
GRANT ALL ON TABLE "public"."giveaways" TO "authenticated";
GRANT ALL ON TABLE "public"."giveaways" TO "service_role";



GRANT UPDATE("entry_count") ON TABLE "public"."giveaways" TO "anon";
GRANT UPDATE("entry_count") ON TABLE "public"."giveaways" TO "authenticated";



GRANT UPDATE("updated_at") ON TABLE "public"."giveaways" TO "anon";
GRANT UPDATE("updated_at") ON TABLE "public"."giveaways" TO "authenticated";



GRANT ALL ON TABLE "public"."pen_names" TO "anon";
GRANT ALL ON TABLE "public"."pen_names" TO "authenticated";
GRANT ALL ON TABLE "public"."pen_names" TO "service_role";



GRANT ALL ON TABLE "public"."reader_deliveries" TO "anon";
GRANT ALL ON TABLE "public"."reader_deliveries" TO "authenticated";
GRANT ALL ON TABLE "public"."reader_deliveries" TO "service_role";



GRANT ALL ON TABLE "public"."reader_download_logs" TO "anon";
GRANT ALL ON TABLE "public"."reader_download_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."reader_download_logs" TO "service_role";



GRANT ALL ON TABLE "public"."reader_entries" TO "anon";
GRANT ALL ON TABLE "public"."reader_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."reader_entries" TO "service_role";



GRANT ALL ON TABLE "public"."reader_library" TO "anon";
GRANT ALL ON TABLE "public"."reader_library" TO "authenticated";
GRANT ALL ON TABLE "public"."reader_library" TO "service_role";



GRANT ALL ON TABLE "public"."reading_progress" TO "anon";
GRANT ALL ON TABLE "public"."reading_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_progress" TO "service_role";



GRANT ALL ON TABLE "public"."reader_library_view" TO "anon";
GRANT ALL ON TABLE "public"."reader_library_view" TO "authenticated";
GRANT ALL ON TABLE "public"."reader_library_view" TO "service_role";



GRANT ALL ON TABLE "public"."reader_preferences" TO "anon";
GRANT ALL ON TABLE "public"."reader_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."reader_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."reading_features" TO "anon";
GRANT ALL ON TABLE "public"."reading_features" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_features" TO "service_role";



GRANT ALL ON TABLE "public"."reading_progress_history" TO "anon";
GRANT ALL ON TABLE "public"."reading_progress_history" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_progress_history" TO "service_role";



GRANT ALL ON TABLE "public"."series" TO "anon";
GRANT ALL ON TABLE "public"."series" TO "authenticated";
GRANT ALL ON TABLE "public"."series" TO "service_role";



GRANT ALL ON TABLE "public"."user_entitlements" TO "anon";
GRANT ALL ON TABLE "public"."user_entitlements" TO "authenticated";
GRANT ALL ON TABLE "public"."user_entitlements" TO "service_role";



GRANT ALL ON TABLE "public"."user_reading_overview" TO "anon";
GRANT ALL ON TABLE "public"."user_reading_overview" TO "authenticated";
GRANT ALL ON TABLE "public"."user_reading_overview" TO "service_role";



GRANT ALL ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";



GRANT ALL ON TABLE "public"."user_upgrade_logs" TO "anon";
GRANT ALL ON TABLE "public"."user_upgrade_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."user_upgrade_logs" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






RESET ALL;
