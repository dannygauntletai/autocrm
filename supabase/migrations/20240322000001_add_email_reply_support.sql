-- Add is_from_email column to comments table
ALTER TABLE comments
ADD COLUMN is_from_email BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policy for comments to allow email webhook to create comments
DROP POLICY IF EXISTS "Users can create comments on their tickets" ON comments;
CREATE POLICY "Users can create comments on their tickets"
ON comments
FOR INSERT
TO public
WITH CHECK (
  -- Either authenticated user creating comment
  (auth.role() = 'authenticated' AND author_id = auth.uid())
  OR
  -- Or service role creating comment from email
  (auth.role() = 'service_role' AND is_from_email = true)
); 