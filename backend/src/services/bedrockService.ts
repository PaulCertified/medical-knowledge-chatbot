import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import env from '../config/env';
import logger from '../config/logger';

class BedrockService {
  private client: BedrockRuntimeClient;
  private readonly embeddingModelId = 'amazon.titan-embed-text-v1';
  private readonly textModelId = 'anthropic.claude-v2';
  private readonly systemPrompt = 'You are a medical expert providing accurate and helpful information about medical conditions, treatments, and health-related topics. Your responses should be professional, clear, and based on current medical knowledge.';

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    if (!text) {
      throw new Error('Text cannot be empty');
    }

    try {
      const command = new InvokeModelCommand({
        modelId: this.embeddingModelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          inputText: text,
        }),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(response.body.toString());

      if (!responseBody.embedding || !Array.isArray(responseBody.embedding)) {
        throw new Error('Invalid response format');
      }

      return responseBody.embedding;
    } catch (error) {
      logger.error('Failed to generate embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  async generateText(prompt: string): Promise<string> {
    if (!prompt) {
      throw new Error('Prompt cannot be empty');
    }

    try {
      const command = new InvokeModelCommand({
        modelId: this.textModelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          prompt: `\n\nHuman: ${this.systemPrompt}\n\nHuman: ${prompt}\n\nAssistant:`,
          max_tokens_to_sample: 2000,
          temperature: 0.7,
          top_p: 0.9,
        }),
      });

      const response = await this.client.send(command);
      let responseBody;
      
      try {
        responseBody = JSON.parse(response.body.toString());
      } catch (error) {
        throw new Error('Failed to parse response');
      }

      if (!responseBody.completion) {
        throw new Error('Invalid response format');
      }

      return responseBody.completion.trim();
    } catch (error) {
      if (error instanceof Error && error.message === 'Failed to parse response') {
        throw error;
      }
      logger.error('Failed to generate text:', error);
      throw new Error('Failed to generate text');
    }
  }
}

export default new BedrockService(); 