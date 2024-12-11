-- Add context and content columns to tests table
ALTER TABLE tests
ADD COLUMN IF NOT EXISTS context JSONB NOT NULL DEFAULT '{"platform": "", "timing": "", "situation": ""}',
ADD COLUMN IF NOT EXISTS content JSONB NOT NULL DEFAULT '{"type": "", "description": "", "url": "", "message": ""}';
