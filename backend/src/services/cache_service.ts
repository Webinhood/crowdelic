import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  async get(key: string): Promise<any | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key: string, value: any): Promise<void> {
    await this.redis.set(
      key,
      JSON.stringify(value),
      'EX',
      this.CACHE_TTL
    );
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}
