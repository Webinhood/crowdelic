-- Add new columns to personas table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'background') THEN
        ALTER TABLE personas ADD COLUMN background TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'goals') THEN
        ALTER TABLE personas ADD COLUMN goals JSONB DEFAULT '[]';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'interests') THEN
        ALTER TABLE personas ADD COLUMN interests JSONB DEFAULT '[]';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'personality') THEN
        ALTER TABLE personas ADD COLUMN personality TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'age') THEN
        ALTER TABLE personas ADD COLUMN age VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'occupation') THEN
        ALTER TABLE personas ADD COLUMN occupation VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personas' AND column_name = 'education') THEN
        ALTER TABLE personas ADD COLUMN education VARCHAR(255);
    END IF;
END $$;
