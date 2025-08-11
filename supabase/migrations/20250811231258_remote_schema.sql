drop policy "Authors can view download logs for their books" on "public"."reader_download_logs";

drop policy "Users can add books to their library" on "public"."reader_library";

drop policy "Users can update their library" on "public"."reader_library";

drop policy "Users can view their own library" on "public"."reader_library";

drop policy "Users can insert their preferences" on "public"."reader_preferences";

drop policy "Users can update their preferences" on "public"."reader_preferences";

drop policy "Users can view their own preferences" on "public"."reader_preferences";

drop policy "Users can track their reading progress" on "public"."reading_progress";

drop policy "Users can update their reading progress" on "public"."reading_progress";

drop policy "Users can view their own reading progress" on "public"."reading_progress";

alter table "public"."reader_library" drop constraint "reader_library_reader_id_fkey";

alter table "public"."reader_preferences" drop constraint "reader_preferences_user_id_fkey";

alter table "public"."reading_progress" drop constraint "reading_progress_user_id_fkey";

alter table "public"."votes" drop constraint "votes_user_id_fkey";

drop function if exists "public"."update_user_settings"(target_user_id uuid, new_font text, new_theme text, new_sidebar_collapsed boolean, new_keyboard_shortcuts_enabled boolean, new_email_notifications boolean, new_marketing_emails boolean, new_weekly_reports boolean, new_language text, new_timezone text, new_usage_analytics boolean, new_auto_save_drafts boolean, new_mailerlite_api_key text, new_mailerlite_group_id text, new_mailerlite_enabled boolean, new_mailchimp_api_key text, new_mailchimp_list_id text, new_mailchimp_enabled boolean);

create table "public"."analytics_events" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "session_id" text,
    "event_name" text not null,
    "event_category" text not null,
    "event_label" text,
    "event_value" numeric default 0,
    "properties" jsonb default '{}'::jsonb,
    "timestamp" timestamp with time zone not null default now(),
    "url" text,
    "user_agent" text,
    "ip_address" inet,
    "request_id" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."analytics_events" enable row level security;

create table "public"."error_reports" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "session_id" text,
    "message" text not null,
    "stack" text,
    "filename" text,
    "line_number" integer,
    "column_number" integer,
    "severity" text not null,
    "category" text not null,
    "context" jsonb default '{}'::jsonb,
    "timestamp" timestamp with time zone not null,
    "url" text,
    "user_agent" text,
    "ip_address" inet,
    "request_id" text,
    "resolved" boolean default false,
    "created_at" timestamp with time zone default now()
);


alter table "public"."error_reports" enable row level security;

create table "public"."user_sessions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "session_id" text not null,
    "start_time" timestamp with time zone not null,
    "last_activity" timestamp with time zone not null,
    "page_views" integer default 0,
    "viewport_width" integer,
    "viewport_height" integer,
    "user_agent" text,
    "referrer" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_sessions" enable row level security;

alter table "public"."votes" enable row level security;

CREATE UNIQUE INDEX analytics_events_pkey ON public.analytics_events USING btree (id);

CREATE UNIQUE INDEX error_reports_pkey ON public.error_reports USING btree (id);

CREATE INDEX idx_analytics_events_category ON public.analytics_events USING btree (event_category);

CREATE INDEX idx_analytics_events_category_time ON public.analytics_events USING btree (event_category, created_at DESC);

CREATE INDEX idx_analytics_events_name_time ON public.analytics_events USING btree (event_name, created_at DESC);

CREATE INDEX idx_analytics_events_properties_gin ON public.analytics_events USING gin (properties);

CREATE INDEX idx_analytics_events_session_time ON public.analytics_events USING btree (session_id, created_at DESC);

CREATE INDEX idx_analytics_events_timestamp ON public.analytics_events USING btree ("timestamp" DESC);

CREATE INDEX idx_analytics_events_user_id ON public.analytics_events USING btree (user_id);

CREATE INDEX idx_analytics_events_user_time ON public.analytics_events USING btree (user_id, created_at DESC);

CREATE INDEX idx_error_reports_category_time ON public.error_reports USING btree (category, created_at DESC);

CREATE INDEX idx_error_reports_context_gin ON public.error_reports USING gin (context);

CREATE INDEX idx_error_reports_resolved_time ON public.error_reports USING btree (resolved, created_at DESC);

CREATE INDEX idx_error_reports_severity ON public.error_reports USING btree (severity);

CREATE INDEX idx_error_reports_severity_time ON public.error_reports USING btree (severity, created_at DESC);

CREATE INDEX idx_error_reports_timestamp ON public.error_reports USING btree ("timestamp" DESC);

CREATE INDEX idx_error_reports_user_time ON public.error_reports USING btree (user_id, created_at DESC);

CREATE INDEX idx_user_sessions_last_activity ON public.user_sessions USING btree (last_activity DESC);

CREATE INDEX idx_user_sessions_start_time ON public.user_sessions USING btree (start_time DESC);

CREATE INDEX idx_user_sessions_user_time ON public.user_sessions USING btree (user_id, start_time DESC);

CREATE UNIQUE INDEX user_sessions_pkey ON public.user_sessions USING btree (id);

alter table "public"."analytics_events" add constraint "analytics_events_pkey" PRIMARY KEY using index "analytics_events_pkey";

alter table "public"."error_reports" add constraint "error_reports_pkey" PRIMARY KEY using index "error_reports_pkey";

alter table "public"."user_sessions" add constraint "user_sessions_pkey" PRIMARY KEY using index "user_sessions_pkey";

alter table "public"."analytics_events" add constraint "analytics_events_event_category_check" CHECK ((event_category = ANY (ARRAY['user'::text, 'system'::text, 'reading'::text, 'navigation'::text, 'engagement'::text, 'error'::text, 'performance'::text]))) not valid;

alter table "public"."analytics_events" validate constraint "analytics_events_event_category_check";

alter table "public"."analytics_events" add constraint "analytics_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."analytics_events" validate constraint "analytics_events_user_id_fkey";

alter table "public"."error_reports" add constraint "error_reports_category_check" CHECK ((category = ANY (ARRAY['javascript'::text, 'react'::text, 'network'::text, 'user'::text, 'system'::text]))) not valid;

alter table "public"."error_reports" validate constraint "error_reports_category_check";

alter table "public"."error_reports" add constraint "error_reports_severity_check" CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))) not valid;

alter table "public"."error_reports" validate constraint "error_reports_severity_check";

alter table "public"."error_reports" add constraint "error_reports_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."error_reports" validate constraint "error_reports_user_id_fkey";

alter table "public"."user_sessions" add constraint "user_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_sessions" validate constraint "user_sessions_user_id_fkey";

alter table "public"."reader_library" add constraint "reader_library_reader_id_fkey" FOREIGN KEY (reader_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reader_library" validate constraint "reader_library_reader_id_fkey";

alter table "public"."reader_preferences" add constraint "reader_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reader_preferences" validate constraint "reader_preferences_user_id_fkey";

alter table "public"."reading_progress" add constraint "reading_progress_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reading_progress" validate constraint "reading_progress_user_id_fkey";

alter table "public"."votes" add constraint "votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."votes" validate constraint "votes_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_critical_errors(hours_back integer DEFAULT 1)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_old_analytics(analytics_retention_days integer DEFAULT 90, error_retention_days integer DEFAULT 30, session_retention_days integer DEFAULT 60)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_orphaned_user_records()
 RETURNS TABLE(operation text, count integer)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_analytics_storage_stats()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_analytics_summary(time_range text DEFAULT '7d'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_performance_metrics(time_range text DEFAULT '7d'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_reading_analytics(time_range text DEFAULT '7d'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_engagement_insights(time_range text DEFAULT '7d'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_settings(target_user_id uuid, new_font text DEFAULT NULL::text, new_theme text DEFAULT NULL::text, new_sidebar_collapsed boolean DEFAULT NULL::boolean, new_keyboard_shortcuts_enabled boolean DEFAULT NULL::boolean, new_email_notifications boolean DEFAULT NULL::boolean, new_marketing_emails boolean DEFAULT NULL::boolean, new_weekly_reports boolean DEFAULT NULL::boolean, new_language text DEFAULT NULL::text, new_timezone text DEFAULT NULL::text, new_usage_analytics boolean DEFAULT NULL::boolean, new_auto_save_drafts boolean DEFAULT NULL::boolean, new_mailerlite_group_id text DEFAULT NULL::text, new_mailerlite_enabled boolean DEFAULT NULL::boolean, new_mailchimp_list_id text DEFAULT NULL::text, new_mailchimp_enabled boolean DEFAULT NULL::boolean)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_foreign_key_consistency()
 RETURNS TABLE(table_name text, issue_type text, count bigint)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_book_downvotes(book_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.books 
  SET downvotes_count = downvotes_count + 1 
  WHERE id = book_id_param;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_book_upvotes(book_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.books 
  SET upvotes_count = upvotes_count + 1 
  WHERE id = book_id_param;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_pen_name_downvotes(pen_name_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE pen_names 
  SET downvotes_count = downvotes_count + 1 
  WHERE id = pen_name_id_param;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.decrement_pen_name_upvotes(pen_name_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE pen_names 
  SET upvotes_count = upvotes_count + 1 
  WHERE id = pen_name_id_param;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_storage_path(user_id uuid, book_id uuid, file_name text, file_type text DEFAULT 'book'::text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  RETURN 'books/' || user_id::text || '/' || book_id::text || '/' || file_type || '/' || file_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_campaign_entries(campaign_uuid uuid, wp_user_id bigint)
 RETURNS TABLE(entry_method text, entry_data jsonb, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_campaign_entries(target_user_id uuid)
 RETURNS TABLE(campaign_id uuid, campaign_title text, book_title text, entry_date timestamp with time zone, campaign_status text)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.increment_book_downvotes(book_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.books 
  SET downvotes_count = downvotes_count + 1 
  WHERE id = book_id_param;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_book_upvotes(book_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.books 
  SET upvotes_count = upvotes_count + 1 
  WHERE id = book_id_param;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_reader_preferences(target_user_id uuid, new_favorite_genres text[] DEFAULT NULL::text[], new_reading_preferences jsonb DEFAULT NULL::jsonb, new_email_notifications boolean DEFAULT NULL::boolean, new_giveaway_reminders boolean DEFAULT NULL::boolean)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_reader_preferences(target_user_id uuid, preferences jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.reader_preferences
  SET preferred_format = preferences->>'preferred_format',
      reading_theme = preferences->>'reading_theme',
      font_size = (preferences->>'font_size')::integer,
      line_spacing = (preferences->>'line_spacing')::numeric,
      updated_at = now()
  WHERE user_id = target_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_settings(target_user_id uuid, new_font text DEFAULT NULL::text, new_theme text DEFAULT NULL::text, new_sidebar_collapsed boolean DEFAULT NULL::boolean, new_keyboard_shortcuts_enabled boolean DEFAULT NULL::boolean, new_email_notifications boolean DEFAULT NULL::boolean, new_marketing_emails boolean DEFAULT NULL::boolean, new_weekly_reports boolean DEFAULT NULL::boolean, new_language text DEFAULT NULL::text, new_timezone text DEFAULT NULL::text, new_usage_analytics boolean DEFAULT NULL::boolean, new_auto_save_drafts boolean DEFAULT NULL::boolean, new_mailerlite_api_key text DEFAULT NULL::text, new_mailerlite_group_id text DEFAULT NULL::text, new_mailerlite_enabled boolean DEFAULT NULL::boolean, new_mailchimp_api_key text DEFAULT NULL::text, new_mailchimp_list_id text DEFAULT NULL::text, new_mailchimp_enabled boolean DEFAULT NULL::boolean)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_settings(target_user_id uuid, settings_data jsonb)
 RETURNS TABLE(id uuid, user_id uuid, theme text, font text, sidebar_collapsed boolean, keyboard_shortcuts_enabled boolean, email_notifications boolean, marketing_emails boolean, weekly_reports boolean, language text, timezone text, usage_analytics boolean, auto_save_drafts boolean, created_at timestamp with time zone, updated_at timestamp with time zone, mailerlite_group_id text, mailerlite_enabled boolean, mailchimp_list_id text, mailchimp_enabled boolean, convertkit_form_id text, convertkit_enabled boolean, klaviyo_list_id text, klaviyo_enabled boolean, mailerlite_api_key_encrypted jsonb, mailchimp_api_key_encrypted jsonb, convertkit_api_key_encrypted jsonb, klaviyo_api_key_encrypted jsonb, authorletters_list_id text, authorletters_enabled boolean, authorletters_api_key_encrypted jsonb)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$
;

grant delete on table "public"."analytics_events" to "anon";

grant insert on table "public"."analytics_events" to "anon";

grant references on table "public"."analytics_events" to "anon";

grant select on table "public"."analytics_events" to "anon";

grant trigger on table "public"."analytics_events" to "anon";

grant truncate on table "public"."analytics_events" to "anon";

grant update on table "public"."analytics_events" to "anon";

grant delete on table "public"."analytics_events" to "authenticated";

grant insert on table "public"."analytics_events" to "authenticated";

grant references on table "public"."analytics_events" to "authenticated";

grant select on table "public"."analytics_events" to "authenticated";

grant trigger on table "public"."analytics_events" to "authenticated";

grant truncate on table "public"."analytics_events" to "authenticated";

grant update on table "public"."analytics_events" to "authenticated";

grant delete on table "public"."analytics_events" to "service_role";

grant insert on table "public"."analytics_events" to "service_role";

grant references on table "public"."analytics_events" to "service_role";

grant select on table "public"."analytics_events" to "service_role";

grant trigger on table "public"."analytics_events" to "service_role";

grant truncate on table "public"."analytics_events" to "service_role";

grant update on table "public"."analytics_events" to "service_role";

grant delete on table "public"."error_reports" to "anon";

grant insert on table "public"."error_reports" to "anon";

grant references on table "public"."error_reports" to "anon";

grant select on table "public"."error_reports" to "anon";

grant trigger on table "public"."error_reports" to "anon";

grant truncate on table "public"."error_reports" to "anon";

grant update on table "public"."error_reports" to "anon";

grant delete on table "public"."error_reports" to "authenticated";

grant insert on table "public"."error_reports" to "authenticated";

grant references on table "public"."error_reports" to "authenticated";

grant select on table "public"."error_reports" to "authenticated";

grant trigger on table "public"."error_reports" to "authenticated";

grant truncate on table "public"."error_reports" to "authenticated";

grant update on table "public"."error_reports" to "authenticated";

grant delete on table "public"."error_reports" to "service_role";

grant insert on table "public"."error_reports" to "service_role";

grant references on table "public"."error_reports" to "service_role";

grant select on table "public"."error_reports" to "service_role";

grant trigger on table "public"."error_reports" to "service_role";

grant truncate on table "public"."error_reports" to "service_role";

grant update on table "public"."error_reports" to "service_role";

grant delete on table "public"."user_sessions" to "anon";

grant insert on table "public"."user_sessions" to "anon";

grant references on table "public"."user_sessions" to "anon";

grant select on table "public"."user_sessions" to "anon";

grant trigger on table "public"."user_sessions" to "anon";

grant truncate on table "public"."user_sessions" to "anon";

grant update on table "public"."user_sessions" to "anon";

grant delete on table "public"."user_sessions" to "authenticated";

grant insert on table "public"."user_sessions" to "authenticated";

grant references on table "public"."user_sessions" to "authenticated";

grant select on table "public"."user_sessions" to "authenticated";

grant trigger on table "public"."user_sessions" to "authenticated";

grant truncate on table "public"."user_sessions" to "authenticated";

grant update on table "public"."user_sessions" to "authenticated";

grant delete on table "public"."user_sessions" to "service_role";

grant insert on table "public"."user_sessions" to "service_role";

grant references on table "public"."user_sessions" to "service_role";

grant select on table "public"."user_sessions" to "service_role";

grant trigger on table "public"."user_sessions" to "service_role";

grant truncate on table "public"."user_sessions" to "service_role";

grant update on table "public"."user_sessions" to "service_role";

create policy "Service role can manage analytics"
on "public"."analytics_events"
as permissive
for all
to public
using ((( SELECT auth.role() AS role) = 'service_role'::text));


create policy "Service role can manage errors"
on "public"."error_reports"
as permissive
for all
to public
using ((( SELECT auth.role() AS role) = 'service_role'::text));


create policy "Users can manage their sessions"
on "public"."user_sessions"
as permissive
for all
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Anyone can view votes"
on "public"."votes"
as permissive
for select
to public
using (true);


create policy "Authenticated users can cast votes"
on "public"."votes"
as permissive
for insert
to public
with check (((( SELECT auth.uid() AS uid) = user_id) AND (( SELECT auth.uid() AS uid) IS NOT NULL)));


create policy "Users can change their own votes"
on "public"."votes"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can remove their own votes"
on "public"."votes"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Authors can view download logs for their books"
on "public"."reader_download_logs"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) IN ( SELECT b.user_id
   FROM (books b
     JOIN book_files bf ON ((b.id = bf.book_id)))
  WHERE (bf.id = reader_download_logs.file_id))));


create policy "Users can add books to their library"
on "public"."reader_library"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = reader_id));


create policy "Users can update their library"
on "public"."reader_library"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = reader_id));


create policy "Users can view their own library"
on "public"."reader_library"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = reader_id));


create policy "Users can insert their preferences"
on "public"."reader_preferences"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can update their preferences"
on "public"."reader_preferences"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can view their own preferences"
on "public"."reader_preferences"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can track their reading progress"
on "public"."reading_progress"
as permissive
for insert
to public
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can update their reading progress"
on "public"."reading_progress"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can view their own reading progress"
on "public"."reading_progress"
as permissive
for select
to public
using ((( SELECT auth.uid() AS uid) = user_id));



