-- First, drop all dependent policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view comments on their tickets" ON comments;
DROP POLICY IF EXISTS "Users can create comments on their tickets" ON comments;

-- Add requester_email column if it doesn't exist
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS requester_email TEXT;

-- Update requester_email from profiles for existing tickets
UPDATE tickets
SET requester_email = (
  SELECT email 
  FROM profiles 
  WHERE profiles.id = tickets.requester_id
)
WHERE requester_id IS NOT NULL;

-- Make requester_email NOT NULL after migration
ALTER TABLE tickets
ALTER COLUMN requester_email SET NOT NULL;

-- Drop the foreign key constraint and column
ALTER TABLE tickets
DROP CONSTRAINT IF EXISTS tickets_requester_id_fkey;

ALTER TABLE tickets
DROP COLUMN requester_id;

-- Create new policies for tickets
CREATE POLICY "Users can view their own tickets"
ON tickets
FOR SELECT
TO public
USING (
  -- Internal users can see all tickets
  (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'agent')
  ))
  OR
  -- Customers can only see tickets with their email
  (
    CASE 
      WHEN auth.role() = 'authenticated' THEN
        requester_email = (SELECT email FROM profiles WHERE id = auth.uid())
      ELSE
        requester_email = current_setting('request.jwt.claims')::json->>'email'
    END
  )
);

CREATE POLICY "Users can create tickets"
ON tickets
FOR INSERT
TO public
WITH CHECK (
  -- Either authenticated user creating ticket
  (
    auth.role() = 'authenticated' 
    AND 
    requester_email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
  OR
  -- Or unauthenticated user with email
  (auth.role() = 'anon' AND requester_email IS NOT NULL)
);

-- Create new policies for comments
CREATE POLICY "Users can view comments on their tickets"
ON comments
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = comments.ticket_id
    AND (
      -- Internal users can see all comments
      (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'agent')
      ))
      OR
      -- Customers can only see comments on their tickets
      (
        CASE 
          WHEN auth.role() = 'authenticated' THEN
            tickets.requester_email = (SELECT email FROM profiles WHERE id = auth.uid())
          ELSE
            tickets.requester_email = current_setting('request.jwt.claims')::json->>'email'
        END
      )
    )
  )
);

CREATE POLICY "Users can create comments on their tickets"
ON comments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = ticket_id
    AND (
      -- Internal users can comment on any ticket
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'agent')
      )
      OR
      -- Customers can only comment on their tickets
      tickets.requester_email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  )
);