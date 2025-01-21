-- First, update the enum to include both statuses temporarily
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'closed';

-- Update any existing tickets with 'solved' status to 'closed'
UPDATE tickets
SET status = 'closed'
WHERE status = 'solved';

-- Create a new enum without 'solved'
CREATE TYPE ticket_status_new AS ENUM ('new', 'open', 'pending', 'closed');

-- Remove the default temporarily
ALTER TABLE tickets ALTER COLUMN status DROP DEFAULT;

-- Update the column to use the new enum
ALTER TABLE tickets
  ALTER COLUMN status TYPE ticket_status_new
  USING status::text::ticket_status_new;

-- Set the default back with the new type
ALTER TABLE tickets ALTER COLUMN status SET DEFAULT 'new'::ticket_status_new;

-- Drop the old enum
DROP TYPE ticket_status;

-- Rename the new enum to the original name
ALTER TYPE ticket_status_new RENAME TO ticket_status; 