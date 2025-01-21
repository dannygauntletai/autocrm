-- First, disable RLS to make changes
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies for tickets
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Public can create tickets" ON tickets;
DROP POLICY IF EXISTS "Enable read access for all users" ON tickets;

-- Create comprehensive policies

-- 1. Public ticket creation policy (for anonymous submissions)
CREATE POLICY "Allow anonymous ticket creation" ON tickets
FOR INSERT TO anon
WITH CHECK (
  -- Ensure basic fields are present
  requester_email IS NOT NULL
  AND subject IS NOT NULL
  AND description IS NOT NULL
  -- Ensure status is 'new' for public submissions
  AND status = 'new'
  -- Ensure no assignment for public submissions
  AND assignee_id IS NULL
  AND team_id IS NULL
);

-- 2. Authenticated ticket creation policy
CREATE POLICY "Allow authenticated ticket creation" ON tickets
FOR INSERT TO authenticated
WITH CHECK (true);  -- Authenticated users can create tickets with any valid fields

-- 3. Viewing policy for authenticated users
CREATE POLICY "Allow authenticated ticket viewing" ON tickets
FOR SELECT TO authenticated
USING (
  -- Users can view tickets they created
  requester_email IN (
    SELECT email FROM profiles
    WHERE id = auth.uid()
  )
  OR
  -- Assignees can view their tickets
  assignee_id = auth.uid()
  OR
  -- Admins and agents can view all tickets
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'agent')
  )
);

-- 4. Update policy for authenticated users
CREATE POLICY "Allow authenticated ticket updates" ON tickets
FOR UPDATE TO authenticated
USING (
  -- Admins and agents can update any ticket
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'agent')
  )
)
WITH CHECK (
  -- Admins and agents can update any ticket
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'agent')
  )
);

-- Re-enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY; 