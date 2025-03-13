import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import env from '../config/env';

const redis = new Redis(env.redis.url, {
  enableOfflineQueue: false,
});

// Base rate limiter configuration
const createLimiter = (
  windowMs: number,
  max: number,
  message: string
) => {
  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rate-limit:',
    }),
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Authentication rate limiter (login/signup)
export const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests
  'Too many authentication attempts. Please try again later.'
);

// Chat rate limiter
export const chatLimiter = createLimiter(
  60 * 1000, // 1 minute
  10, // 10 requests
  'Too many chat requests. Please wait a moment before sending more messages.'
);

// Knowledge base search rate limiter
export const searchLimiter = createLimiter(
  60 * 1000, // 1 minute
  20, // 20 requests
  'Too many search requests. Please wait a moment before trying again.'
);

// Error handler for Redis connection
redis.on('error', (error) => {
  console.error('Redis connection error:', error);
  // Fallback to memory store if Redis is unavailable
  authLimiter.store = undefined;
  chatLimiter.store = undefined;
  searchLimiter.store = undefined;
}); 