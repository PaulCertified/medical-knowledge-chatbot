import env from '../config/env';
import ragService from './ragService';
import { Message } from '../types/chat';
import { UserSession } from '../types/user';
import logger from '../config/logger';
import config from '../config/config';
import { Anthropic } from '@anthropic-ai/sdk';
import knowledgeBaseService from './knowledgeBaseService';

export interface ChatResponse {
  message: Message;
  context?: string[];
}

export class ChatService {
  private client: Anthropic;
  private readonly systemPrompt = `You are Claude, a medical chatbot assistant. Your responses should be:
- Professional and empathetic
- Evidence-based and accurate
- Clear and easy to understand
Important: You are not a doctor and cannot provide medical diagnosis or treatment. Always advise users to consult healthcare professionals for specific medical advice.`;

  constructor() {
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }

  private async getRelevantContext(query: string): Promise<string> {
    try {
      const response = await ragService.generateResponse(query);
      if (!response.context.length) return '';

      return response.context
        .map(
          (result, index) =>
            `[${index + 1}] ${result.document.content}\nSource: ${result.document.metadata.source}\n`
        )
        .join('\n');
    } catch (error) {
      logger.error('Failed to get relevant context:', error);
      return '';
    }
  }

  private formatMessages(messages: Message[], context?: string[]): Message[] {
    const formattedMessages: Message[] = [
      {
        role: 'assistant',
        content: this.systemPrompt,
        timestamp: new Date().toISOString(),
      },
    ];

    if (context && context.length > 0) {
      formattedMessages.push({
        role: 'assistant',
        content: `Context:\n${context.join('\n')}`,
        timestamp: new Date().toISOString(),
      });
    }

    return [...formattedMessages, ...messages];
  }

  async processMessage(message: Message, user: UserSession): Promise<Message> {
    try {
      const response = await ragService.generateResponse(message.content);
      return {
        content: response,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw new Error('Failed to process message');
    }
  }

  async chat(messages: Message[]): Promise<ChatResponse> {
    try {
      const formattedMessages = this.formatMessages(messages);
      const response = await this.client.messages.create({
        model: env.ANTHROPIC_MODEL_ID,
        max_tokens: 1000,
        messages: formattedMessages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      return {
        message: {
          role: 'assistant',
          content: response.content[0].text,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error('Error generating chat response:', error);
      throw new Error('Failed to generate chat response');
    }
  }
}

export default new ChatService(); 