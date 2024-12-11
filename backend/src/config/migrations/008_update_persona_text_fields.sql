-- Convert JSONB columns to TEXT
ALTER TABLE personas
  ALTER COLUMN challenges TYPE TEXT USING challenges::text,
  ALTER COLUMN frustrations TYPE TEXT USING frustrations::text,
  ALTER COLUMN habits TYPE TEXT USING habits::text,
  ALTER COLUMN decision_factors TYPE TEXT USING decision_factors::text;

-- Remove default values
ALTER TABLE personas
  ALTER COLUMN challenges DROP DEFAULT,
  ALTER COLUMN frustrations DROP DEFAULT,
  ALTER COLUMN habits DROP DEFAULT,
  ALTER COLUMN decision_factors DROP DEFAULT;
