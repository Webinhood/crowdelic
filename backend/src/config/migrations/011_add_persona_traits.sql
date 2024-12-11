-- Add traits field to personas table
ALTER TABLE personas
  ADD COLUMN traits JSONB DEFAULT '[]'::jsonb;
