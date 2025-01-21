-- Add requester_email column to tickets table
ALTER TABLE tickets
ADD COLUMN requester_email TEXT;

-- Update RLS policies for tickets table to allow public submissions
CREATE POLICY "Allow public ticket creation"
ON tickets
FOR INSERT
TO public
WITH CHECK (
  -- Either authenticated user creating ticket
  (auth.role() = 'authenticated' AND requester_id = auth.uid())
  OR
  -- Or unauthenticated user with email
  (auth.role() = 'anon' AND requester_email IS NOT NULL)
);

-- Update existing policy to handle requester_email in reads
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
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
  -- Customers can only see their own tickets
  (
    requester_id = auth.uid()
    OR
    (requester_email = current_setting('request.jwt.claims')::json->>'email')
  )
); 