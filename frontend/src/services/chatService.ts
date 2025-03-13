import axios from 'axios';
import { SendMessageRequest, SendMessageResponse } from '../types/chat';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const chatService = {
  sendMessage: async (request: SendMessageRequest): Promise<SendMessageResponse> => {
    try {
      const response = await axios.post<SendMessageResponse>(
        `${API_URL}/chat`,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to send message. Please try again.');
    }
  },

  getConversationHistory: async (conversationId?: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/chat/history${conversationId ? `/${conversationId}` : ''}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch conversation history.');
    }
  },
};

export default chatService; 