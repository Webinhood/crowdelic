-- Add settings and topics columns to tests table
ALTER TABLE tests
ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{"maxIterations": 5, "responseFormat": "detailed", "interactionStyle": "natural"}'::jsonb,
ADD COLUMN IF NOT EXISTS topics JSONB NOT NULL DEFAULT '[]'::jsonb;
