-- Add status tracking columns to incidents
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS status_updated_at timestamptz;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS status_updated_by text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS status_updated_by_id uuid;

-- Add status tracking columns to complaints
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS status_updated_at timestamptz;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS status_updated_by text;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS status_updated_by_id uuid;
