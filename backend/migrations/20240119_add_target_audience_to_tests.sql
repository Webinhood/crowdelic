ALTER TABLE tests 
ADD COLUMN target_audience JSONB DEFAULT json_build_object(
    'ageRange', '',
    'location', '',
    'income', '',
    'interests', ARRAY[]::text[],
    'painPoints', ARRAY[]::text[],
    'needs', ARRAY[]::text[]
);
