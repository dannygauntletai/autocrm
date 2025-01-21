-- Allow null values in author_id column for email replies
ALTER TABLE comments
ALTER COLUMN author_id DROP NOT NULL;

-- Update RLS policy to allow comments with null author_id
DROP POLICY IF EXISTS "Users can create comments on their tickets" ON comments;
CREATE POLICY "Users can create comments on their tickets" ON comments
FOR INSERT TO authenticated, anon
WITH CHECK (
  -- Allow authenticated users to create comments on tickets they own
  (auth.uid() IN (
    SELECT author_id 
    FROM tickets 
    WHERE tickets.id = ticket_id
  ))
  OR
  -- Allow null author_id for email replies
  (author_id IS NULL)
); 