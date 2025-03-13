import axios from 'axios';
import claudeService from '../claudeService';
import { ClaudeMessage, ClaudeResponse } from '../../types/claude';
import config from '../../config/config';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ClaudeService', () => {
  const mockApiResponse: ClaudeResponse = {
    id: 'msg_123',
    content: 'Test response',
    role: 'assistant',
    model: 'claude-3-sonnet-20240229-v1:0',
    stop_reason: null,
    stop_sequence: null,
    usage: {
      input_tokens: 10,
      output_tokens: 20
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue({
      post: jest.fn().mockResolvedValue({ data: mockApiResponse })
    } as any);
  });

  describe('constructor', () => {
    it('should throw error if API key is missing', () => {
      const originalApiKey = config.claude.apiKey;
      config.claude.apiKey = '';
      
      expect(() => {
        new (claudeService.constructor as any)();
      }).toThrow('Missing Claude API key');

      config.claude.apiKey = originalApiKey;
    });

    it('should create axios instance with correct config', () => {
      new (claudeService.constructor as any)();
      
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.anthropic.com/v1',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.claude.apiKey,
          'anthropic-version': '2023-06-01'
        }
      });
    });
  });

  describe('generateResponse', () => {
    const mockMessages: ClaudeMessage[] = [
      { role: 'user', content: 'Hello' }
    ];

    it('should successfully generate response', async () => {
      const response = await claudeService.generateResponse(mockMessages);
      
      expect(response).toEqual(mockApiResponse);
      expect(mockedAxios.create().post).toHaveBeenCalledWith('/messages', {
        model: config.claude.model,
        max_tokens: 4096,
        messages: mockMessages,
        temperature: 0.7,
        system: expect.any(String)
      });
    });

    it('should handle API errors', async () => {
      const errorMessage = 'API Error';
      mockedAxios.create().post.mockRejectedValueOnce({
        response: {
          data: {
            error: {
              message: errorMessage
            }
          }
        }
      });

      await expect(claudeService.generateResponse(mockMessages))
        .rejects
        .toThrow(`Failed to generate response from Claude: ${errorMessage}`);
    });

    it('should use custom options when provided', async () => {
      const customOptions = {
        max_tokens: 2048,
        temperature: 0.5,
        system: 'Custom system message'
      };

      await claudeService.generateResponse(mockMessages, customOptions);

      expect(mockedAxios.create().post).toHaveBeenCalledWith('/messages', {
        model: config.claude.model,
        ...customOptions,
        messages: mockMessages
      });
    });
  });

  describe('generateEmbeddings', () => {
    const mockText = 'Test text';
    const mockEmbedding = [0.1, 0.2, 0.3];

    beforeEach(() => {
      mockedAxios.create().post.mockResolvedValueOnce({
        data: { embedding: mockEmbedding }
      });
    });

    it('should successfully generate embeddings for string input', async () => {
      const embedding = await claudeService.generateEmbeddings(mockText);
      
      expect(embedding).toEqual(mockEmbedding);
      expect(mockedAxios.create().post).toHaveBeenCalledWith('/embeddings', {
        model: config.claude.model,
        input: mockText
      });
    });

    it('should handle API errors for embeddings', async () => {
      const errorMessage = 'Embedding API Error';
      mockedAxios.create().post.mockRejectedValueOnce({
        response: {
          data: {
            error: {
              message: errorMessage
            }
          }
        }
      });

      await expect(claudeService.generateEmbeddings(mockText))
        .rejects
        .toThrow(`Failed to generate embeddings: ${errorMessage}`);
    });
  });
}); 