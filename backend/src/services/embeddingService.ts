import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import config from '../config/config';
import logger from '../config/logger';

class EmbeddingService {
  private client: BedrockRuntimeClient;
  private readonly modelId = 'amazon.titan-embed-text-v2:0';

  constructor() {
    if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
      throw new Error('Missing AWS credentials');
    }

    this.client = new BedrockRuntimeClient({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          inputText: text,
        }),
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return responseBody.embedding;
    } catch (error) {
      logger.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      return await Promise.all(texts.map(text => this.generateEmbedding(text)));
    } catch (error) {
      logger.error('Failed to generate embeddings:', error);
      throw error;
    }
  }
}

export default new EmbeddingService(); 