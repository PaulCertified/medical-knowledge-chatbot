import { jest } from '@jest/globals';
import ragService from '../ragService';
import bedrockService from '../bedrockService';
import openSearchService from '../openSearchService';
import type { RagService } from '../ragService';

jest.mock('../bedrockService');
jest.mock('../openSearchService');

describe('RagService', () => {
  const mockBedrockService = bedrockService as jest.Mocked<typeof bedrockService>;
  const mockOpenSearchService = openSearchService as jest.Mocked<typeof openSearchService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addDocument', () => {
    it('should add document successfully', async () => {
      const document = {
        id: 'test-id',
        content: 'test content',
      };

      mockBedrockService.generateEmbeddings.mockResolvedValueOnce([0.1, 0.2, 0.3]);
      mockOpenSearchService.addDocument.mockResolvedValueOnce();

      await ragService.addDocument(document);

      expect(mockBedrockService.generateEmbeddings).toHaveBeenCalledWith(document.content);
      expect(mockOpenSearchService.addDocument).toHaveBeenCalledWith({
        ...document,
        embedding: [0.1, 0.2, 0.3],
      });
    });

    it('should handle errors during document addition', async () => {
      const document = {
        id: 'test-id',
        content: 'test content',
      };

      mockBedrockService.generateEmbeddings.mockRejectedValueOnce(new Error('Embedding generation failed'));

      await expect(ragService.addDocument(document)).rejects.toThrow('Embedding generation failed');
    });
  });

  describe('searchSimilar', () => {
    it('should search similar documents successfully', async () => {
      const query = 'test query';
      const mockEmbeddings = [0.1, 0.2, 0.3];
      const mockResults = [
        { content: 'similar content', score: 0.9 },
      ];

      mockBedrockService.generateEmbeddings.mockResolvedValueOnce(mockEmbeddings);
      mockOpenSearchService.searchSimilar.mockResolvedValueOnce(mockResults);

      const results = await ragService.searchSimilar(query, 5);

      expect(mockBedrockService.generateEmbeddings).toHaveBeenCalledWith(query);
      expect(mockOpenSearchService.searchSimilar).toHaveBeenCalledWith(mockEmbeddings, 5);
      expect(results).toEqual(mockResults);
    });

    it('should handle errors during search', async () => {
      const query = 'test query';

      mockBedrockService.generateEmbeddings.mockRejectedValueOnce(new Error('Search failed'));

      await expect(ragService.searchSimilar(query, 5)).rejects.toThrow('Search failed');
    });
  });
});