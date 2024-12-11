-- Add personality fields to personas table
ALTER TABLE personas
  ADD COLUMN personality_traits TEXT,
  ADD COLUMN background_story TEXT;
