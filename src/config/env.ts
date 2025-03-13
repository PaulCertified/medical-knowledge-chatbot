import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const env = {
  // Server Configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3001,
  host: process.env.HOST || 'localhost',

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || '7d',
  },

  // AWS Configuration
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },

  // DynamoDB Tables
  dynamodb: {
    userTable: process.env.DYNAMODB_USER_TABLE || 'user_data',
    chatMessagesTable: process.env.DYNAMODB_CHAT_MESSAGES_TABLE || 'chat_messages',
    chatSessionsTable: process.env.DYNAMODB_CHAT_SESSIONS_TABLE || 'chat_sessions',
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Bedrock Configuration
  bedrock: {
    modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-v2',
    embeddingModelId: process.env.BEDROCK_EMBEDDING_MODEL_ID || 'amazon.titan-embed-text-v2:0',
  },

  // OpenSearch Configuration
  opensearch: {
    endpoint: process.env.OPENSEARCH_ENDPOINT,
    username: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
    index: process.env.OPENSEARCH_INDEX || 'medical-knowledge',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  // Security
  security: {
    cookieSecret: process.env.COOKIE_SECRET,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    trustProxy: Number(process.env.TRUST_PROXY) || 1,
  },

  // Feature Flags
  features: {
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
    enableErrorReporting: process.env.ENABLE_ERROR_REPORTING !== 'false',
  },

  // Validation function
  validate() {
    const required = [
      'JWT_SECRET',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'OPENSEARCH_ENDPOINT',
      'OPENSEARCH_USERNAME',
      'OPENSEARCH_PASSWORD',
      'COOKIE_SECRET',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  },
} as const;

export default env; 