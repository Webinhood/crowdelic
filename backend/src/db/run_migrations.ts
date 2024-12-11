import { pool } from './index';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/logger';

async function runMigrations() {
  const migrationsPath = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsPath)
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    logger.info(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf8');
    
    try {
      await pool.query(sql);
      logger.info(`Successfully ran migration: ${file}`);
    } catch (error) {
      logger.error(`Error running migration ${file}:`, error);
      throw error;
    }
  }
}

runMigrations()
  .then(() => {
    logger.info('All migrations completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Migration failed:', error);
    process.exit(1);
  });
