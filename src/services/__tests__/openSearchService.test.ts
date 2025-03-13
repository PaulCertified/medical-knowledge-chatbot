import { jest } from '@jest/globals';
import { Client } from '@opensearch-project/opensearch';
import openSearchService from '../openSearchService';
import type { OpenSearchService } from '../openSearchService';
import { Document } from '../../types/document';

jest.mock('@opensearch-project/opensearch');

describe('OpenSearchService', () => {
  let mockClient: jest.Mocked<Client>;

  beforeEach(() => {
    mockClient = {
      indices: {
        exists: jest.fn(),
        create: jest.fn(),
      },
      index: jest.fn(),
      search: jest.fn(),
    } as unknown as jest.Mocked<Client>;

    (Client as jest.Mock).mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addDocument', () => {
    it('should add document successfully', async () => {
      mockClient.indices.exists.mockResolvedValueOnce({ body: false });
      mockClient.indices.create.mockResolvedValueOnce({});
      mockClient.index.mockResolvedValueOnce({ body: { _id: 'test-id' } });

      const document = {
        id: 'test-id',
        content: 'test content',
        embedding: [0.1, 0.2, 0.3],
      };

      await openSearchService.addDocument(document);

      expect(mockClient.index).toHaveBeenCalledWith({
        index: expect.any(String),
        body: expect.objectContaining({
          content: document.content,
          embedding: document.embedding,
        }),
      });
    });

    it('should handle OpenSearch errors', async () => {
      mockClient.indices.exists.mockRejectedValueOnce(new Error('OpenSearch Error'));

      const document = {
        id: 'test-id',
        content: 'test content',
        embedding: [0.1, 0.2, 0.3],
      };

      await expect(openSearchService.addDocument(document)).rejects.toThrow('OpenSearch Error');
    });
  });

  describe('searchSimilar', () => {
    it('should search similar documents successfully', async () => {
      const mockSearchResponse = {
        body: {
          hits: {
            hits: [
              {
                _source: {
                  content: 'similar content',
                },
                _score: 0.9,
              },
            ],
          },
        },
      };

      mockClient.search.mockResolvedValueOnce(mockSearchResponse);

      const results = await openSearchService.searchSimilar([0.1, 0.2, 0.3], 5);

      expect(results).toEqual([
        {
          content: 'similar content',
          score: 0.9,
        },
      ]);
    });

    it('should handle OpenSearch errors', async () => {
      mockClient.search.mockRejectedValueOnce(new Error('OpenSearch Error'));

      await expect(openSearchService.searchSimilar([0.1, 0.2, 0.3], 5)).rejects.toThrow('OpenSearch Error');
    });
  });

  describe('initialize', () => {
    it('should create index if it does not exist', async () => {
      mockClient.indices.exists.mockResolvedValue({ body: false });
      mockClient.indices.create.mockResolvedValue({ body: { acknowledged: true } });

      await openSearchService.initialize();

      expect(mockClient.indices.exists).toHaveBeenCalled();
      expect(mockClient.indices.create).toHaveBeenCalled();
    });

    it('should not create index if it already exists', async () => {
      mockClient.indices.exists.mockResolvedValue({ body: true });

      await openSearchService.initialize();

      expect(mockClient.indices.exists).toHaveBeenCalled();
      expect(mockClient.indices.create).not.toHaveBeenCalled();
    });

    it('should handle index creation error', async () => {
      mockClient.indices.exists.mockResolvedValue({ body: false });
      mockClient.indices.create.mockRejectedValue(new Error('Creation failed'));

      await expect(openSearchService.initialize()).rejects.toThrow('Creation failed');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      mockClient.delete.mockResolvedValue({ body: { result: 'deleted' } });

      await openSearchService.deleteDocument('123');

      expect(mockClient.delete).toHaveBeenCalled();
    });

    it('should handle deletion error', async () => {
      mockClient.delete.mockRejectedValue(new Error('Deletion failed'));

      await expect(openSearchService.deleteDocument('123')).rejects.toThrow('Deletion failed');
    });
  });

  describe('getDocument', () => {
    it('should get document successfully', async () => {
      mockClient.get.mockResolvedValue({ body: { _source: mockDocument } });

      const result = await openSearchService.getDocument('123');
      expect(result).toEqual(mockDocument);
    });

    it('should return null for non-existent document', async () => {
      mockClient.get.mockRejectedValue({ statusCode: 404 });

      const result = await openSearchService.getDocument('123');
      expect(result).toBeNull();
    });

    it('should handle get error', async () => {
      mockClient.get.mockRejectedValue(new Error('Get failed'));

      await expect(openSearchService.getDocument('123')).rejects.toThrow('Get failed');
    });
  });

  describe('addDocuments', () => {
    it('should add multiple documents successfully', async () => {
      mockClient.indices.exists.mockResolvedValue({ body: true });
      mockClient.bulk.mockResolvedValue({ body: { errors: false } });

      await openSearchService.addDocuments([mockDocument]);

      expect(mockClient.bulk).toHaveBeenCalled();
    });

    it('should handle bulk addition error', async () => {
      mockClient.indices.exists.mockResolvedValue({ body: true });
      mockClient.bulk.mockResolvedValue({ body: { errors: true } });

      await expect(openSearchService.addDocuments([mockDocument])).rejects.toThrow('Failed to add some documents');
    });
  });
}); 