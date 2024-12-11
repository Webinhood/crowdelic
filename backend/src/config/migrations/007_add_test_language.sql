-- Add language column to tests table
ALTER TABLE tests
  ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'pt-BR';
