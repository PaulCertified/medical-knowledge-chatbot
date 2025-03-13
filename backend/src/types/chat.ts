export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  message: Message;
  context?: string[];
}

export interface ChatHistory {
  messages: Message[];
  userId: string;
  createdAt: string;
  updatedAt: string;
} 