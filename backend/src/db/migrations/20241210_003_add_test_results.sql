-- Add results column to tests table
ALTER TABLE tests
ADD COLUMN IF NOT EXISTS results JSONB;
