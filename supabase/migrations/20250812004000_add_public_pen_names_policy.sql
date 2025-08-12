-- Add public policy for pen_names to allow reading pen names for authors with active books
-- This allows anonymous users to view pen names for any author who has active books

CREATE POLICY "Public can view pen names for active authors" ON "public"."pen_names" 
FOR SELECT TO "anon"
USING (
  EXISTS (
    SELECT 1 
    FROM "public"."books" b
    WHERE b.pen_name_id = pen_names.id 
    AND b.status = 'active'
  )
);

-- Add comment explaining the policy
COMMENT ON POLICY "Public can view pen names for active authors" ON "public"."pen_names" IS 
'Allows anonymous users to view pen names for any author who has active books';
