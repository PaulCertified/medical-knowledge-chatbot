import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set default environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.ANTHROPIC_API_KEY = 'test-claude-key';
process.env.CLAUDE_MODEL = 'claude-3-sonnet-20240229-v1:0';
process.env.OPENSEARCH_ENDPOINT = 'http://localhost:9200';
process.env.OPENSEARCH_USERNAME = 'admin';
process.env.OPENSEARCH_PASSWORD = 'admin';
process.env.OPENSEARCH_INDEX = 'test-medical-knowledge';

// Mock AWS SDK
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  InvokeModelCommand: jest.fn(),
}));

// Mock OpenSearch
jest.mock('@opensearch-project/opensearch', () => ({
  Client: jest.fn().mockImplementation(() => ({
    indices: {
      exists: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    search: jest.fn(),
    index: jest.fn(),
    bulk: jest.fn(),
  })),
}));

// Mock Axios
jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    post: jest.fn(),
    get: jest.fn(),
  }),
}));

// Global test timeout
jest.setTimeout(10000); 