-- Fix RLS policy for reader_deliveries to allow public downloads
-- This allows both anonymous and authenticated users to insert delivery records

-- Drop the existing policy that only allows authenticated users
DROP POLICY IF EXISTS "Users can insert reader deliveries" ON "public"."reader_deliveries";

-- Create a new policy that allows both anonymous and authenticated users
CREATE POLICY "Public can insert reader deliveries" ON "public"."reader_deliveries" 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Add comment explaining the policy
COMMENT ON POLICY "Public can insert reader deliveries" ON "public"."reader_deliveries" IS 
'Allows both anonymous and authenticated users to insert delivery records for download tracking';
