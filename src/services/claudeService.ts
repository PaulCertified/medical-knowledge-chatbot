import axios, { AxiosInstance } from 'axios';
import logger from '../config/logger';
import config from '../config/config';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeOptions {
  max_tokens?: number;
  temperature?: number;
  system?: string;
}

interface ClaudeResponse {
  id: string;
  content: string;
  role: string;
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

class ClaudeService {
  private client: AxiosInstance;

  constructor() {
    if (!config.claude.apiKey) {
      throw new Error('Missing Claude API key');
    }

    this.client = axios.create({
      baseURL: 'https://api.anthropic.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.claude.apiKey,
        'anthropic-version': '2023-06-01'
      }
    });
  }

  async generateResponse(messages: ClaudeMessage[], options: ClaudeOptions = {}): Promise<ClaudeResponse> {
    try {
      const response = await this.client.post('/messages', {
        model: config.claude.model || 'claude-3-sonnet-20240229-v1:0',
        max_tokens: options.max_tokens || 4096,
        messages,
        temperature: options.temperature || 0.7,
        system: options.system || "You are a knowledgeable and professional medical assistant. Always provide accurate, evidence-based information while maintaining HIPAA compliance. If you're unsure about something, say so rather than making assumptions."
      });

      logger.info('Claude API response received successfully');
      return response.data;
    } catch (error: any) {
      logger.error('Error calling Claude API:', error.response?.data || error.message);
      throw new Error(`Failed to generate response from Claude: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async generateEmbeddings(text: string | string[]): Promise<number[]> {
    try {
      const response = await this.client.post('/embeddings', {
        model: config.claude.model,
        input: text
      });

      logger.info('Claude embeddings generated successfully');
      return response.data.embedding;
    } catch (error: any) {
      logger.error('Error generating embeddings:', error.response?.data || error.message);
      throw new Error(`Failed to generate embeddings: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

export default new ClaudeService(); 