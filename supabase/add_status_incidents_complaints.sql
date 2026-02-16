-- Add status column to incidents if it doesn't exist
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Add status column to complaints if it doesn't exist
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Optional: Update existing records to have a status if null
UPDATE incidents SET status = 'pending' WHERE status IS NULL;
UPDATE complaints SET status = 'pending' WHERE status IS NULL;
