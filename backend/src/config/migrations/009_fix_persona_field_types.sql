-- Convert JSONB columns to TEXT
ALTER TABLE personas
  ALTER COLUMN challenges DROP DEFAULT,
  ALTER COLUMN frustrations DROP DEFAULT,
  ALTER COLUMN habits DROP DEFAULT,
  ALTER COLUMN decision_factors DROP DEFAULT;

ALTER TABLE personas
  ALTER COLUMN challenges TYPE TEXT USING challenges::text,
  ALTER COLUMN frustrations TYPE TEXT USING frustrations::text,
  ALTER COLUMN habits TYPE TEXT USING habits::text,
  ALTER COLUMN decision_factors TYPE TEXT USING decision_factors::text;

-- Keep only goals and interests as JSONB
ALTER TABLE personas
  ALTER COLUMN goals TYPE JSONB USING CASE 
    WHEN goals IS NULL THEN '[]'::jsonb 
    WHEN goals::text = '' THEN '[]'::jsonb 
    ELSE goals::jsonb 
  END,
  ALTER COLUMN interests TYPE JSONB USING CASE 
    WHEN interests IS NULL THEN '[]'::jsonb 
    WHEN interests::text = '' THEN '[]'::jsonb 
    ELSE interests::jsonb 
  END;

ALTER TABLE personas
  ALTER COLUMN goals SET DEFAULT '[]'::jsonb,
  ALTER COLUMN interests SET DEFAULT '[]'::jsonb;
