import { RagService } from '../ragService';
import { BedrockService } from '../bedrockService';
import { OpenSearchService } from '../openSearchService';
import { KnowledgeBase } from '../../types/knowledgeBase';

// Mock dependencies
jest.mock('../bedrockService');
jest.mock('../openSearchService');

describe('RagService', () => {
  let ragService: RagService;
  let mockBedrockService: jest.Mocked<BedrockService>;
  let mockOpenSearchService: jest.Mocked<OpenSearchService>;

  const mockEmbedding = new Float32Array([0.1, 0.2, 0.3]);
  const mockKnowledgeBase: KnowledgeBase = {
    id: '123',
    content: 'Test medical content',
    metadata: {
      source: 'test',
      category: 'general',
    },
    embedding: mockEmbedding,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock services
    mockBedrockService = {
      generateEmbedding: jest.fn(),
      generateResponse: jest.fn(),
    } as jest.Mocked<BedrockService>;

    mockOpenSearchService = {
      addDocument: jest.fn(),
      searchDocuments: jest.fn(),
      deleteDocument: jest.fn(),
      createIndex: jest.fn(),
    } as jest.Mocked<OpenSearchService>;

    // Initialize service with mock dependencies
    ragService = new RagService(mockBedrockService, mockOpenSearchService);

    // Setup default mock implementations
    mockBedrockService.generateEmbedding.mockResolvedValue(mockEmbedding);
    mockBedrockService.generateResponse.mockResolvedValue('Mock response');
    mockOpenSearchService.searchDocuments.mockResolvedValue([{
      content: mockKnowledgeBase.content,
      score: 0.9,
      metadata: mockKnowledgeBase.metadata,
    }]);
  });

  describe('generateResponse', () => {
    it('should generate response with context from knowledge base', async () => {
      // Setup
      const query = 'What are the symptoms of diabetes?';
      const conversationHistory = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi, how can I help you?' },
      ];

      // Execute
      const result = await ragService.generateResponse(query, conversationHistory);

      // Verify
      expect(mockBedrockService.generateEmbedding).toHaveBeenCalledWith(query);
      expect(mockOpenSearchService.searchDocuments).toHaveBeenCalledWith(mockEmbedding);
      expect(mockBedrockService.generateResponse).toHaveBeenCalledWith(
        query,
        conversationHistory,
        expect.any(String)
      );
      expect(result.response).toBe('Mock response');
      expect(result.context).toHaveLength(1);
      expect(result.context[0].score).toBe(0.9);
    });

    it('should handle case when no relevant context is found', async () => {
      // Setup
      mockOpenSearchService.searchDocuments.mockResolvedValue([]);

      // Execute
      const result = await ragService.generateResponse('Test query', []);

      // Verify
      expect(mockBedrockService.generateResponse).toHaveBeenCalledWith(
        'Test query',
        [],
        expect.any(String)
      );
      expect(result.context).toHaveLength(0);
    });

    it('should throw error if embedding generation fails', async () => {
      // Setup
      mockBedrockService.generateEmbedding.mockRejectedValue(new Error('Embedding failed'));

      // Execute & Verify
      await expect(ragService.generateResponse('Test query', []))
        .rejects.toThrow('Failed to generate embedding');
    });
  });

  describe('addToKnowledgeBase', () => {
    it('should add document to knowledge base', async () => {
      // Setup
      const content = 'New medical content';
      const metadata = { source: 'test', category: 'general' };

      // Execute
      await ragService.addToKnowledgeBase(content, metadata);

      // Verify
      expect(mockBedrockService.generateEmbedding).toHaveBeenCalledWith(content);
      expect(mockOpenSearchService.addDocument).toHaveBeenCalledWith({
        content,
        metadata,
        embedding: mockEmbedding,
      });
    });

    it('should throw error if document addition fails', async () => {
      // Setup
      mockOpenSearchService.addDocument.mockRejectedValue(new Error('Addition failed'));

      // Execute & Verify
      await expect(ragService.addToKnowledgeBase('Test content', {}))
        .rejects.toThrow('Failed to add document to knowledge base');
    });
  });

  describe('searchKnowledgeBase', () => {
    it('should return search results with scores', async () => {
      // Setup
      const query = 'diabetes symptoms';

      // Execute
      const results = await ragService.searchKnowledgeBase(query);

      // Verify
      expect(mockBedrockService.generateEmbedding).toHaveBeenCalledWith(query);
      expect(mockOpenSearchService.searchDocuments).toHaveBeenCalledWith(mockEmbedding);
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        content: mockKnowledgeBase.content,
        score: 0.9,
        metadata: mockKnowledgeBase.metadata,
      });
    });

    it('should return empty array when no results found', async () => {
      // Setup
      mockOpenSearchService.searchDocuments.mockResolvedValue([]);

      // Execute
      const results = await ragService.searchKnowledgeBase('test query');

      // Verify
      expect(results).toHaveLength(0);
    });

    it('should throw error if search fails', async () => {
      // Setup
      mockOpenSearchService.searchDocuments.mockRejectedValue(new Error('Search failed'));

      // Execute & Verify
      await expect(ragService.searchKnowledgeBase('test query'))
        .rejects.toThrow('Failed to search knowledge base');
    });
  });
}); 