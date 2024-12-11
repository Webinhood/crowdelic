import { Pool } from 'pg';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL configuration
export const pool = new Pool({
  user: process.env.POSTGRES_USER || 'crowdelic',
  password: process.env.POSTGRES_PASSWORD || 'crowdelic',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'crowdelic',
});

// Redis configuration
export const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Initialize Redis connection
redisClient.connect().catch(console.error);
