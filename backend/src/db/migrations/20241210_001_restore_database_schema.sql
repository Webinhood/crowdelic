-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS usage_logs;
DROP TABLE IF EXISTS test_messages;
DROP TABLE IF EXISTS tests;
DROP TABLE IF EXISTS personas;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  api_quota INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create personas table
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  age INTEGER,
  occupation VARCHAR(255),
  income VARCHAR(255),
  location VARCHAR(255),
  family_status VARCHAR(255),
  education TEXT,
  daily_routine TEXT,
  challenges TEXT,
  goals TEXT[],
  frustrations TEXT,
  interests TEXT[],
  habits TEXT,
  digital_skills TEXT,
  spending_habits TEXT,
  decision_factors TEXT,
  personality_traits TEXT,
  background_story TEXT,
  traits TEXT[],
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create tests table
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  objective TEXT,
  language VARCHAR(10) DEFAULT 'pt',
  status VARCHAR(50) DEFAULT 'pending',
  settings JSONB DEFAULT '{"maxIterations": 5, "responseFormat": "detailed", "interactionStyle": "natural"}',
  topics TEXT[],
  persona_ids TEXT[],
  target_audience JSONB DEFAULT '{"ageRange": "", "location": "", "income": "", "interests": [], "painPoints": [], "needs": []}',
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create test_messages table
CREATE TABLE test_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL,
  persona_id UUID NOT NULL,
  first_impression TEXT,
  personal_context JSONB,
  benefits TEXT[],
  concerns TEXT[],
  decision_factors TEXT[],
  suggestions TEXT[],
  target_audience_alignment JSONB,
  tags JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (test_id) REFERENCES tests(id),
  FOREIGN KEY (persona_id) REFERENCES personas(id)
);

-- Create usage_logs table
CREATE TABLE usage_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  model VARCHAR(50) NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  cost NUMERIC(10,6) NOT NULL,
  test_id UUID,
  user_id UUID NOT NULL,
  FOREIGN KEY (test_id) REFERENCES tests(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_personas_user_id ON personas(user_id);
CREATE INDEX idx_tests_user_id ON tests(user_id);
CREATE INDEX idx_test_messages_test_id ON test_messages(test_id);
CREATE INDEX idx_test_messages_persona_id ON test_messages(persona_id);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_test_id ON usage_logs(test_id);
