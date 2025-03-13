import Anthropic from '@anthropic-ai/sdk';
import knowledgeBaseService from './knowledgeBaseService';
import logger from '../config/logger';
import config from '../config/config';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: Message;
  relevantDocs?: Array<{
    content: string;
    metadata: any;
    score: number;
  }>;
}

class ChatService {
  private client: Anthropic;
  private readonly systemPrompt = `You are Claude, a medical chatbot assistant. Your responses should be:
- Professional and empathetic
- Based on accurate medical information
- Clear and easy to understand
- Include relevant citations when possible
- Accompanied by appropriate disclaimers

Important: You are not a doctor and cannot provide medical diagnosis or treatment. Always advise users to consult healthcare professionals for specific medical advice.`;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.claude.apiKey,
    });
  }

  private async getRelevantContext(query: string): Promise<string> {
    try {
      const results = await knowledgeBaseService.searchSimilar(query);
      if (!results.length) return '';

      return results
        .map(
          (doc, index) =>
            `[${index + 1}] ${doc.content}\nSource: ${doc.metadata.source}\n`
        )
        .join('\n');
    } catch (error) {
      logger.error('Failed to get relevant context:', error);
      return '';
    }
  }

  private formatMessages(messages: Message[], context: string): Array<{ role: string; content: string }> {
    const formattedMessages: Array<{ role: string; content: string }> = [
      { role: 'system', content: this.systemPrompt },
    ];

    if (context) {
      formattedMessages.push({
        role: 'system',
        content: `Here is some relevant medical information to help with your response:\n\n${context}\n\nPlease use this information to provide accurate and helpful responses, citing the sources when appropriate.`,
      });
    }

    return formattedMessages.concat(
      messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))
    );
  }

  async chat(messages: Message[]): Promise<ChatResponse> {
    try {
      const latestUserMessage = messages[messages.length - 1];
      if (latestUserMessage.role !== 'user') {
        throw new Error('Last message must be from user');
      }

      const relevantDocs = await knowledgeBaseService.searchSimilar(latestUserMessage.content);
      const context = await this.getRelevantContext(latestUserMessage.content);
      
      const response = await this.client.messages.create({
        model: config.claude.model,
        max_tokens: config.claude.maxTokens,
        messages: this.formatMessages(messages, context),
      });

      return {
        message: {
          role: 'assistant',
          content: response.content[0].text,
        },
        relevantDocs,
      };
    } catch (error) {
      logger.error('Failed to get chat response:', error);
      throw error;
    }
  }
}

export default new ChatService(); 