-- Drop all existing policies
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Public can create tickets" ON tickets;
DROP POLICY IF EXISTS "Allow anonymous ticket creation" ON tickets;
DROP POLICY IF EXISTS "Allow authenticated ticket creation" ON tickets;
DROP POLICY IF EXISTS "Allow authenticated ticket viewing" ON tickets;
DROP POLICY IF EXISTS "Allow authenticated ticket updates" ON tickets;
DROP POLICY IF EXISTS "Enable read access for all users" ON tickets;

-- Create a simple policy for public ticket creation with no email restrictions
CREATE POLICY "enable_public_ticket_creation" ON tickets FOR INSERT WITH CHECK (
  -- Only require that the email is provided
  requester_email IS NOT NULL
  AND status = 'new'
  AND assignee_id IS NULL
  AND team_id IS NULL
);

-- Create a policy for authenticated users to view and update tickets
CREATE POLICY "enable_authenticated_access" ON tickets TO authenticated USING (
  requester_email IN (SELECT email FROM profiles WHERE id = auth.uid())
  OR assignee_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'agent'))
); 