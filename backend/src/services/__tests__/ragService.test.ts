import { jest } from '@jest/globals';
import ragService, { RagResponse } from '../ragService';
import bedrockService from '../bedrockService';
import openSearchService, { Document, SearchResult } from '../openSearchService';
import { KnowledgeBase } from '../../types/knowledgeBase';

// Mock dependencies
jest.mock('../bedrockService');
jest.mock('../openSearchService');

describe('RagService', () => {
  const mockBedrockService = bedrockService as jest.Mocked<typeof bedrockService>;
  const mockOpenSearchService = openSearchService as jest.Mocked<typeof openSearchService>;

  const mockEmbedding = [0.1, 0.2, 0.3];
  const mockDocument: Document = {
    id: '123',
    content: 'Test medical content',
    metadata: {
      source: 'test',
      title: 'Test Document',
    },
    embedding: mockEmbedding,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockSearchResult: SearchResult = {
    document: mockDocument,
    score: 0.9,
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('searchSimilar', () => {
    it('should return search results successfully', async () => {
      const mockQuery = 'test query';
      const mockEmbeddings = [0.1, 0.2, 0.3];
      const mockSearchResults: SearchResult[] = [
        { id: '1', content: 'result 1', score: 0.9 },
        { id: '2', content: 'result 2', score: 0.8 },
      ];

      mockBedrockService.generateEmbeddings.mockResolvedValueOnce(mockEmbeddings);
      mockOpenSearchService.searchSimilar.mockResolvedValueOnce(mockSearchResults);

      const result = await ragService.searchSimilar(mockQuery, 2);

      expect(mockBedrockService.generateEmbeddings).toHaveBeenCalledWith(mockQuery);
      expect(mockOpenSearchService.searchSimilar).toHaveBeenCalledWith(mockEmbeddings, 2);
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle errors from BedrockService', async () => {
      mockBedrockService.generateEmbeddings.mockRejectedValueOnce(new Error('Bedrock Error'));

      await expect(ragService.searchSimilar('test query', 2)).rejects.toThrow('Bedrock Error');
    });

    it('should handle errors from OpenSearchService', async () => {
      mockBedrockService.generateEmbeddings.mockResolvedValueOnce([0.1, 0.2, 0.3]);
      mockOpenSearchService.searchSimilar.mockRejectedValueOnce(new Error('OpenSearch Error'));

      await expect(ragService.searchSimilar('test query', 2)).rejects.toThrow('OpenSearch Error');
    });
  });

  describe('generateResponse', () => {
    it('should generate response with context successfully', async () => {
      const mockQuery = 'test query';
      const mockSearchResults: SearchResult[] = [
        { id: '1', content: 'context 1', score: 0.9 },
        { id: '2', content: 'context 2', score: 0.8 },
      ];
      const mockResponse = 'Generated response';

      mockBedrockService.generateText.mockResolvedValueOnce(mockResponse);

      const result = await ragService.generateResponse(mockQuery, mockSearchResults);

      expect(mockBedrockService.generateText).toHaveBeenCalledWith(
        expect.stringContaining(mockQuery)
      );
      expect(mockBedrockService.generateText).toHaveBeenCalledWith(
        expect.stringContaining('context 1')
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle errors from BedrockService', async () => {
      mockBedrockService.generateText.mockRejectedValueOnce(new Error('Bedrock Error'));

      await expect(
        ragService.generateResponse('test query', [])
      ).rejects.toThrow('Bedrock Error');
    });
  });

  describe('addToKnowledgeBase', () => {
    it('should add document to knowledge base', async () => {
      const content = 'Test content';
      const metadata = { source: 'test', title: 'Test' };

      (bedrockService.generateEmbeddings as jest.Mock).mockResolvedValue(mockEmbedding);

      await ragService.addToKnowledgeBase(content, metadata);

      expect(bedrockService.generateEmbeddings).toHaveBeenCalledWith(content);
      expect(openSearchService.addDocument).toHaveBeenCalledWith(
        content,
        mockEmbedding,
        metadata
      );
    });

    it('should throw error if adding document fails', async () => {
      (bedrockService.generateEmbeddings as jest.Mock).mockRejectedValue(
        new Error('Failed to generate embeddings')
      );

      await expect(
        ragService.addToKnowledgeBase('Test content', { source: 'test' })
      ).rejects.toThrow('Failed to add to knowledge base');
    });
  });

  describe('searchKnowledgeBase', () => {
    it('should return search results', async () => {
      const query = 'test query';

      (bedrockService.generateEmbeddings as jest.Mock).mockResolvedValue(mockEmbedding);
      (openSearchService.searchSimilar as jest.Mock).mockResolvedValue([mockSearchResult]);

      const results = await ragService.searchKnowledgeBase(query);

      expect(bedrockService.generateEmbeddings).toHaveBeenCalledWith(query);
      expect(openSearchService.searchSimilar).toHaveBeenCalledWith(mockEmbedding);
      expect(results).toEqual([mockSearchResult]);
    });

    it('should throw error if search fails', async () => {
      (bedrockService.generateEmbeddings as jest.Mock).mockRejectedValue(
        new Error('Failed to generate embeddings')
      );

      await expect(ragService.searchKnowledgeBase('test query')).rejects.toThrow(
        'Failed to search knowledge base'
      );
    });
  });
}); 