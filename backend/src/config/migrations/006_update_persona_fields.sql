-- Add new columns to personas table
ALTER TABLE personas
  ADD COLUMN IF NOT EXISTS income VARCHAR(255),
  ADD COLUMN IF NOT EXISTS location VARCHAR(255),
  ADD COLUMN IF NOT EXISTS family_status VARCHAR(255),
  ADD COLUMN IF NOT EXISTS education VARCHAR(255),
  ADD COLUMN IF NOT EXISTS daily_routine TEXT,
  ADD COLUMN IF NOT EXISTS challenges JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS frustrations JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS habits JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS digital_skills VARCHAR(255),
  ADD COLUMN IF NOT EXISTS spending_habits TEXT,
  ADD COLUMN IF NOT EXISTS decision_factors JSONB DEFAULT '[]';

-- Update existing columns to match new schema
ALTER TABLE personas
  ALTER COLUMN age TYPE INTEGER USING age::integer,
  ALTER COLUMN occupation TYPE VARCHAR(255);

-- Drop columns that are no longer used
ALTER TABLE personas
  DROP COLUMN IF EXISTS traits,
  DROP COLUMN IF EXISTS background,
  DROP COLUMN IF EXISTS personality;
