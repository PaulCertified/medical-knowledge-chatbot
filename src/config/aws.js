const { 
  BedrockRuntimeClient 
} = require('@aws-sdk/client-bedrock-runtime');
const { 
  DynamoDBClient 
} = require('@aws-sdk/client-dynamodb');
const { 
  LexRuntimeV2Client 
} = require('@aws-sdk/client-lex-runtime-v2');

// AWS Configuration
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const config = {
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Initialize AWS clients
const bedrockClient = new BedrockRuntimeClient(config);
const dynamoDBClient = new DynamoDBClient(config);
const lexClient = new LexRuntimeV2Client(config);

// DynamoDB table names
const TABLES = {
  CHAT_SESSIONS: `${process.env.DYNAMODB_TABLE_PREFIX}chat_sessions`,
  CHAT_MESSAGES: `${process.env.DYNAMODB_TABLE_PREFIX}chat_messages`,
  USER_DATA: `${process.env.DYNAMODB_TABLE_PREFIX}user_data`,
};

// Bedrock model configuration
const BEDROCK_CONFIG = {
  modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-v2',
  maxTokens: 1000,
  temperature: 0.7,
};

// Lex configuration
const LEX_CONFIG = {
  botId: process.env.LEX_BOT_ID,
  botAliasId: process.env.LEX_BOT_ALIAS_ID,
  localeId: 'en_US',
};

module.exports = {
  bedrockClient,
  dynamoDBClient,
  lexClient,
  TABLES,
  BEDROCK_CONFIG,
  LEX_CONFIG,
}; 