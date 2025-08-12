-- Add public policy for viewing active delivery methods
-- This allows anonymous users to access delivery methods on the reader-facing site

CREATE POLICY "Public can view active delivery methods" ON "public"."book_delivery_methods" 
FOR SELECT TO "anon" 
USING (
  is_active = true 
  AND delivery_method IN ('ebook', 'audiobook', 'print')
);

-- Add comment explaining the policy
COMMENT ON POLICY "Public can view active delivery methods" ON "public"."book_delivery_methods" IS 
'Allows anonymous users to view active delivery methods for reader-facing site access';
