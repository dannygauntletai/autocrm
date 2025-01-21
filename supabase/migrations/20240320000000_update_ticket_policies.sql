-- Drop existing policies
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Public can create tickets" ON tickets;

-- Create new policies
CREATE POLICY "Users can view their own tickets" ON tickets
FOR SELECT TO authenticated
USING (
  requester_email IN (
    SELECT email FROM profiles
    WHERE id = auth.uid()
  )
  OR
  assignee_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'agent')
  )
);

-- Allow public ticket creation without any checks
CREATE POLICY "Public can create tickets" ON tickets
FOR INSERT
WITH CHECK (true);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY; 