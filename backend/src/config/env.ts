import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Environment {
  NODE_ENV: string;
  PORT: number;
  HOST: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  DYNAMODB_USER_TABLE: string;
  DYNAMODB_CHAT_TABLE: string;
  REDIS_URL: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  BEDROCK_MODEL_ID: string;
  BEDROCK_ENDPOINT: string;
  OPENSEARCH_ENDPOINT: string;
  OPENSEARCH_URL: string;
  OPENSEARCH_USERNAME: string;
  OPENSEARCH_PASSWORD: string;
  LOG_LEVEL: string;
  LOG_FILE: string;
  COOKIE_SECRET: string;
  CORS_ORIGIN: string;
  TRUST_PROXY: boolean;
  ENABLE_RATE_LIMIT: boolean;
  ENABLE_REQUEST_LOGGING: boolean;
  ENABLE_ERROR_REPORTING: boolean;
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL_ID: string;
}

const env: Environment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || 'localhost',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  DYNAMODB_USER_TABLE: process.env.DYNAMODB_USER_TABLE || 'users',
  DYNAMODB_CHAT_TABLE: process.env.DYNAMODB_CHAT_TABLE || 'chats',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-v2',
  BEDROCK_ENDPOINT: process.env.BEDROCK_ENDPOINT || '',
  OPENSEARCH_ENDPOINT: process.env.OPENSEARCH_ENDPOINT || '',
  OPENSEARCH_URL: process.env.OPENSEARCH_URL || 'http://localhost:9200',
  OPENSEARCH_USERNAME: process.env.OPENSEARCH_USERNAME || 'admin',
  OPENSEARCH_PASSWORD: process.env.OPENSEARCH_PASSWORD || 'admin',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'app.log',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'your-cookie-secret',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  TRUST_PROXY: process.env.TRUST_PROXY === 'true',
  ENABLE_RATE_LIMIT: process.env.ENABLE_RATE_LIMIT !== 'false',
  ENABLE_REQUEST_LOGGING: process.env.ENABLE_REQUEST_LOGGING !== 'false',
  ENABLE_ERROR_REPORTING: process.env.ENABLE_ERROR_REPORTING !== 'false',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  ANTHROPIC_MODEL_ID: process.env.ANTHROPIC_MODEL_ID || 'claude-3-opus-20240229',
};

// Validate required environment variables
const requiredEnvVars: (keyof Environment)[] = [
  'JWT_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'ANTHROPIC_API_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default env; 