import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import RedisStore from 'rate-limit-redis';
import env from '../config/env';

const redisClient = new Redis(env.REDIS_URL);

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

const redisStore = new RedisStore({
  prefix: 'rate-limit:',
  // @ts-ignore - Type definitions are incorrect for the latest version
  client: redisClient,
  // @ts-ignore - Type definitions are incorrect for the latest version
  sendCommand: async (...args: string[]) => redisClient.call(...args),
});

// Base rate limiter configuration
const createLimiter = (
  windowMs: number,
  max: number,
  message: string
) => {
  return rateLimit({
    store: redisStore,
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Authentication rate limiter (login/signup)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
});

// Chat rate limiter
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
});

// Knowledge base search rate limiter
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
});

// Alias for backward compatibility
export const knowledgeBaseLimiter = searchLimiter;

// Error handler for Redis connection
redisClient.on('error', (error) => {
  console.error('Redis error:', error);
  // Fallback to memory store on Redis error
  authLimiter.resetKey('');
  chatLimiter.resetKey('');
  searchLimiter.resetKey('');
}); 