import { Message } from '../types/chat';
import ragService from './ragService';
import logger from '../utils/logger';

class ChatService {
  async chat(query: string): Promise<Message> {
    try {
      const response = await ragService.generateResponse(query);
      
      return {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error in chat service:', error);
      throw error;
    }
  }
}

const chatService = new ChatService();
export type { ChatService };
export default chatService;