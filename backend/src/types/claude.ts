export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeOptions {
  max_tokens?: number;
  temperature?: number;
  system?: string;
}

export interface ClaudeResponse {
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

export interface ClaudeConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
} 