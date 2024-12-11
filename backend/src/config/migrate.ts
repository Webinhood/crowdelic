import { pool } from './database';
import fs from 'fs';
import path from 'path';

async function createMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getMigrationsApplied(): Promise<string[]> {
  const result = await pool.query('SELECT name FROM migrations ORDER BY id ASC');
  return result.rows.map(row => row.name);
}

async function markMigrationAsApplied(name: string) {
  await pool.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
}

async function runMigration() {
  try {
    process.stdout.write('Starting migration process...\n');

    // Create migrations tracking table
    await createMigrationsTable();
    
    // Get list of applied migrations
    const appliedMigrations = await getMigrationsApplied();
    process.stdout.write(`Previously applied migrations: ${appliedMigrations.join(', ')}\n`);

    // Read and execute schema.sql first if not already applied
    if (!appliedMigrations.includes('schema.sql')) {
      process.stdout.write('Applying schema.sql...\n');
      const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await pool.query(schemaSQL);
      await markMigrationAsApplied('schema.sql');
      process.stdout.write('Schema created successfully\n');
    }

    // Read and execute all migration files in order
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    process.stdout.write(`Found migration files: ${migrationFiles.join(', ')}\n`);

    for (const file of migrationFiles) {
      if (!appliedMigrations.includes(file)) {
        process.stdout.write(`Applying migration ${file}...\n`);
        const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await pool.query(migrationSQL);
        await markMigrationAsApplied(file);
        process.stdout.write(`Migration ${file} executed successfully\n`);
      } else {
        process.stdout.write(`Skipping already applied migration: ${file}\n`);
      }
    }

    process.stdout.write('All migrations completed successfully\n');
    process.exit(0);
  } catch (error) {
    process.stderr.write(`Error running migrations: ${error}\n`);
    process.exit(1);
  }
}

process.stdout.write('Migration script started\n');
runMigration();
