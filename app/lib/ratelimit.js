import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = Redis.fromEnv();

// Create a rate limiter that allows 10 requests per 10 seconds
export const rateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});