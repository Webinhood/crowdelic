-- Add completed_at column to tests table
ALTER TABLE tests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
