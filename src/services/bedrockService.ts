import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { env } from '../config/env';
import logger from '../utils/logger';

class BedrockService {
  private readonly client: BedrockRuntimeClient;

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
    try {
      const command = new InvokeModelCommand({
        modelId: 'amazon.titan-embed-text-v1',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({ inputText: text }),
      });

      const response = await this.client.send(command);
      const result = JSON.parse(Buffer.from(response.body).toString());
      return result.embedding;
    } catch (error) {
      logger.error('Error generating embeddings:', error);
      throw error;
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-v2',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
          max_tokens_to_sample: 1000,
          temperature: 0.7,
        }),
      });

      const response = await this.client.send(command);
      const result = JSON.parse(Buffer.from(response.body).toString());
      return result.completion;
    } catch (error) {
      logger.error('Error generating text:', error);
      throw error;
    }
  }
}

const bedrockService = new BedrockService();
export type { BedrockService };
export default bedrockService; 