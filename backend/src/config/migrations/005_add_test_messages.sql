-- Add test_messages table for storing real-time test messages
CREATE TABLE IF NOT EXISTS test_messages (
  id SERIAL PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (test_id, user_id, created_at)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_test_messages_test_user ON test_messages(test_id, user_id);
