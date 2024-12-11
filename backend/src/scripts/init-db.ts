import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'crowdelic',
  password: process.env.POSTGRES_PASSWORD || 'crowdelic',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'crowdelic',
});

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '..', 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('Schema created successfully');

    // Create test user
    const hashedPassword = '$2a$10$K4MRrZaXyqFGWP5.9ywz6.2Qz8/DGVXfb4kSGDGxkOqcQoE1QgBNe'; // password: testpass123
    await pool.query(
      `INSERT INTO users (name, email, password, company, role) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['Test User', 'test@example.com', hashedPassword, 'Test Company', 'user']
    );
    console.log('Test user created successfully');

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
