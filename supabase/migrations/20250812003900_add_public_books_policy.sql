-- Add public policy for viewing active books
-- This allows anonymous users to view active books for the reader-facing site


CREATE POLICY "Public can view active books" ON "public"."books" 
FOR SELECT TO "anon" 
USING (status = 'active');

-- Add comment explaining the policy
COMMENT ON POLICY "Public can view active books" ON "public"."books" IS 
'Allows anonymous users to view active books for reader-facing site access';
