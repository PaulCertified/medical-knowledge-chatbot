import { OpenSearchService } from '../openSearchService';
import { Client } from '@opensearch-project/opensearch';
import { KnowledgeBase } from '../../types/knowledgeBase';

// Mock OpenSearch client
jest.mock('@opensearch-project/opensearch');

describe('OpenSearchService', () => {
  let openSearchService: OpenSearchService;
  let mockClient: jest.Mocked<Client>;

  const mockEmbedding = new Float32Array([0.1, 0.2, 0.3]);
  const mockDocument: KnowledgeBase = {
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

    // Setup mock client
    mockClient = {
      indices: {
        exists: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      index: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Client>;

    // Initialize service with mock client
    openSearchService = new OpenSearchService(mockClient);

    // Setup default mock responses
    mockClient.indices.exists.mockResolvedValue({ body: false });
    mockClient.indices.create.mockResolvedValue({ body: { acknowledged: true } });
    mockClient.index.mockResolvedValue({ body: { _id: '123', result: 'created' } });
    mockClient.search.mockResolvedValue({
      body: {
        hits: {
          hits: [
            {
              _source: {
                content: mockDocument.content,
                metadata: mockDocument.metadata,
              },
              _score: 0.9,
            },
          ],
        },
      },
    });
  });

  describe('createIndex', () => {
    it('should create index if it does not exist', async () => {
      // Execute
      await openSearchService.createIndex();

      // Verify
      expect(mockClient.indices.exists).toHaveBeenCalled();
      expect(mockClient.indices.create).toHaveBeenCalledWith({
        index: expect.any(String),
        body: expect.objectContaining({
          mappings: expect.objectContaining({
            properties: expect.objectContaining({
              embedding: expect.objectContaining({
                type: 'knn_vector',
                dimension: 1024,
              }),
            }),
          }),
        }),
      });
    });

    it('should delete and recreate index if it exists', async () => {
      // Setup
      mockClient.indices.exists.mockResolvedValue({ body: true });

      // Execute
      await openSearchService.createIndex();

      // Verify
      expect(mockClient.indices.delete).toHaveBeenCalled();
      expect(mockClient.indices.create).toHaveBeenCalled();
    });

    it('should throw error if index creation fails', async () => {
      // Setup
      mockClient.indices.create.mockRejectedValue(new Error('Creation failed'));

      // Execute & Verify
      await expect(openSearchService.createIndex())
        .rejects.toThrow('Failed to create index');
    });
  });

  describe('addDocument', () => {
    it('should add document to index', async () => {
      // Execute
      await openSearchService.addDocument(mockDocument);

      // Verify
      expect(mockClient.index).toHaveBeenCalledWith({
        index: expect.any(String),
        body: expect.objectContaining({
          content: mockDocument.content,
          metadata: mockDocument.metadata,
          embedding: Array.from(mockDocument.embedding),
        }),
      });
    });

    it('should throw error if document addition fails', async () => {
      // Setup
      mockClient.index.mockRejectedValue(new Error('Addition failed'));

      // Execute & Verify
      await expect(openSearchService.addDocument(mockDocument))
        .rejects.toThrow('Failed to add document');
    });
  });

  describe('searchDocuments', () => {
    it('should return search results with scores', async () => {
      // Execute
      const results = await openSearchService.searchDocuments(mockEmbedding);

      // Verify
      expect(mockClient.search).toHaveBeenCalledWith({
        index: expect.any(String),
        body: expect.objectContaining({
          knn: expect.objectContaining({
            field: 'embedding',
            query_vector: Array.from(mockEmbedding),
            k: expect.any(Number),
            num_candidates: expect.any(Number),
          }),
        }),
      });
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        content: mockDocument.content,
        metadata: mockDocument.metadata,
        score: 0.9,
      });
    });

    it('should return empty array when no results found', async () => {
      // Setup
      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
          },
        },
      });

      // Execute
      const results = await openSearchService.searchDocuments(mockEmbedding);

      // Verify
      expect(results).toHaveLength(0);
    });

    it('should throw error if search fails', async () => {
      // Setup
      mockClient.search.mockRejectedValue(new Error('Search failed'));

      // Execute & Verify
      await expect(openSearchService.searchDocuments(mockEmbedding))
        .rejects.toThrow('Failed to search documents');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document from index', async () => {
      // Execute
      await openSearchService.deleteDocument('123');

      // Verify
      expect(mockClient.delete).toHaveBeenCalledWith({
        index: expect.any(String),
        id: '123',
      });
    });

    it('should throw error if document deletion fails', async () => {
      // Setup
      mockClient.delete.mockRejectedValue(new Error('Deletion failed'));

      // Execute & Verify
      await expect(openSearchService.deleteDocument('123'))
        .rejects.toThrow('Failed to delete document');
    });
  });
}); 