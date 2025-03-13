import { jest } from '@jest/globals';
import chatService from '../chatService';
import ragService from '../ragService';
import type { ChatService } from '../chatService';

jest.mock('../ragService');

describe('ChatService', () => {
  const mockRagService = ragService as jest.Mocked<typeof ragService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('chat', () => {
    it('should generate chat response successfully', async () => {
      const query = 'test query';
      const mockResults = [
        { content: 'similar content 1', score: 0.9 },
        { content: 'similar content 2', score: 0.8 },
      ];
      const mockResponse = 'Generated response';

      mockRagService.searchSimilar.mockResolvedValueOnce(mockResults);
      mockRagService.bedrockService.generateText.mockResolvedValueOnce(mockResponse);

      const result = await chatService.chat(query);

      expect(mockRagService.searchSimilar).toHaveBeenCalledWith(query, expect.any(Number));
      expect(mockRagService.bedrockService.generateText).toHaveBeenCalledWith(expect.stringContaining(query));
      expect(result).toEqual({
        role: 'assistant',
        content: mockResponse,
        timestamp: expect.any(Date),
      });
    });

    it('should handle errors during chat', async () => {
      const query = 'test query';

      mockRagService.searchSimilar.mockRejectedValueOnce(new Error('Chat failed'));

      await expect(chatService.chat(query)).rejects.toThrow('Chat failed');
    });

    it('should handle empty search results', async () => {
      const query = 'test query';
      const mockResponse = 'Generated response without context';

      mockRagService.searchSimilar.mockResolvedValueOnce([]);
      mockRagService.bedrockService.generateText.mockResolvedValueOnce(mockResponse);

      const result = await chatService.chat(query);

      expect(mockRagService.searchSimilar).toHaveBeenCalledWith(query, expect.any(Number));
      expect(mockRagService.bedrockService.generateText).toHaveBeenCalledWith(expect.stringContaining(query));
      expect(result).toEqual({
        role: 'assistant',
        content: mockResponse,
        timestamp: expect.any(Date),
      });
    });
  });
}); 