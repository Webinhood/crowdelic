import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL pool configuration
export const pgPool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo máximo que uma conexão pode ficar inativa
  connectionTimeoutMillis: 2000, // tempo máximo para estabelecer uma conexão
});

// Prisma configuration with connection limit
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['error', 'warn'],
});

// Redis configuration
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis connection error:', err));

// Initialize Redis connection
redisClient.connect().catch(console.error);

// Handle pool errors
pgPool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Cleanup function
export const cleanupConnections = async () => {
  await prisma.$disconnect();
  await redisClient.disconnect();
  await pgPool.end();
};
