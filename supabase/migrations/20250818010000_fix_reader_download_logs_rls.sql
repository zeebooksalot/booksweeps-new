-- Fix RLS policy for reader_download_logs table
-- Allow API to insert download log records

create policy "Allow download logging"
on "public"."reader_download_logs"
as permissive
for insert
to anon, authenticated
with check (true);

-- Allow viewing download logs for analytics (optional)
create policy "Allow viewing download logs"
on "public"."reader_download_logs"
as permissive
for select
to authenticated
using (true);
