export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface SendMessageRequest {
  content: string;
  conversationId?: string;
  userId: string;
  timestamp: string;
}

export interface SendMessageResponse {
  message: Message;
  conversationId: string;
} 