import dotenv from 'dotenv';
import path from 'path';
import { ClaudeConfig } from '../types/claude';

// Load environment variables from .env file
const envPath = path.join(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

console.log('OpenSearch Config:', {
  node: process.env.OPENSEARCH_ENDPOINT,
  username: process.env.OPENSEARCH_USERNAME,
});

interface OpenSearchConfig {
  node: string;
  username: string;
  password: string;
  index: string;
}

interface AWSConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

interface RAGConfig {
  chunkSize: number;
  chunkOverlap: number;
  maxDocuments: number;
  similarityThreshold: number;
}

interface SecurityConfig {
  jwtSecret: string;
  sessionSecret: string;
  cookieSecret: string;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface LoggingConfig {
  level: string;
  filePath: string;
}

interface Config {
  port: number;
  nodeEnv: string;
  aws: AWSConfig;
  claude: ClaudeConfig;
  openSearch: OpenSearchConfig;
  rag: RAGConfig;
  security: SecurityConfig;
  rateLimit: RateLimitConfig;
  logging: LoggingConfig;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // AWS Configuration
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  },

  // OpenSearch Configuration
  openSearch: {
    node: process.env.OPENSEARCH_ENDPOINT || '',
    username: process.env.OPENSEARCH_USERNAME || '',
    password: process.env.OPENSEARCH_PASSWORD || '',
    index: process.env.OPENSEARCH_INDEX || 'medical_knowledge'
  },

  // Claude API Configuration
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229-v1:0',
    maxTokens: 4096,
    temperature: 0.7
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
    sessionSecret: process.env.SESSION_SECRET || 'default_session_secret',
    cookieSecret: process.env.COOKIE_SECRET || 'default_cookie_secret'
  },

  // RAG Configuration
  rag: {
    chunkSize: parseInt(process.env.RAG_CHUNK_SIZE || '1000', 10),
    chunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP || '200', 10),
    maxDocuments: parseInt(process.env.RAG_MAX_DOCUMENTS || '3', 10),
    similarityThreshold: parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || '0.7')
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log'
  }
};

// Validate required configuration
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'ANTHROPIC_API_KEY',
  'OPENSEARCH_ENDPOINT',
  'OPENSEARCH_USERNAME',
  'OPENSEARCH_PASSWORD'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config; 