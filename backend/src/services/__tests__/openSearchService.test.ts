import { jest } from '@jest/globals';
import { Client } from '@opensearch-project/opensearch';
import openSearchService from '../openSearchService';
import type { OpenSearchService } from '../openSearchService';

jest.mock('@opensearch-project/opensearch');

describe('OpenSearchService', () => {
  let mockClient: jest.Mocked<Client>;

  beforeEach(() => {
    mockClient = {
      indices: {
        exists: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      index: jest.fn(),
      search: jest.fn(),
      bulk: jest.fn(),
    } as unknown as jest.Mocked<Client>;

    (Client as jest.Mock).mockImplementation(() => mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create index if it does not exist', async () => {
      mockClient.indices.exists.mockResolvedValueOnce({ body: false });
      mockClient.indices.create.mockResolvedValueOnce({ body: { acknowledged: true } });

      await openSearchService.initialize();

      expect(mockClient.indices.exists).toHaveBeenCalled();
      expect(mockClient.indices.create).toHaveBeenCalled();
    });

    it('should not create index if it already exists', async () => {
      mockClient.indices.exists.mockResolvedValueOnce({ body: true });

      await openSearchService.initialize();

      expect(mockClient.indices.exists).toHaveBeenCalled();
      expect(mockClient.indices.create).not.toHaveBeenCalled();
    });

    it('should handle errors during initialization', async () => {
      mockClient.indices.exists.mockRejectedValueOnce(new Error('OpenSearch Error'));

      await expect(openSearchService.initialize()).rejects.toThrow('OpenSearch Error');
    });
  });

  describe('addDocument', () => {
    const mockDocument = {
      id: '1',
      content: 'test content',
      embeddings: [0.1, 0.2, 0.3],
    };

    it('should add document successfully', async () => {
      mockClient.index.mockResolvedValueOnce({ body: { result: 'created' } });

      await openSearchService.addDocument(mockDocument);

      expect(mockClient.index).toHaveBeenCalledWith({
        index: expect.any(String),
        body: expect.objectContaining({
          content: mockDocument.content,
          vector: mockDocument.embeddings,
        }),
      });
    });

    it('should handle errors when adding document', async () => {
      mockClient.index.mockRejectedValueOnce(new Error('OpenSearch Error'));

      await expect(openSearchService.addDocument(mockDocument)).rejects.toThrow('OpenSearch Error');
    });
  });

  describe('searchSimilar', () => {
    const mockEmbeddings = [0.1, 0.2, 0.3];

    it('should return search results successfully', async () => {
      const mockSearchResponse = {
        body: {
          hits: {
            hits: [
              {
                _source: { content: 'result 1' },
                _id: '1',
                _score: 0.9,
              },
              {
                _source: { content: 'result 2' },
                _id: '2',
                _score: 0.8,
              },
            ],
          },
        },
      };

      mockClient.search.mockResolvedValueOnce(mockSearchResponse);

      const results = await openSearchService.searchSimilar(mockEmbeddings, 2);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: expect.any(String),
        body: expect.objectContaining({
          query: expect.any(Object),
          size: 2,
        }),
      });

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: '1',
        content: 'result 1',
        score: 0.9,
      });
    });

    it('should handle errors during search', async () => {
      mockClient.search.mockRejectedValueOnce(new Error('OpenSearch Error'));

      await expect(openSearchService.searchSimilar(mockEmbeddings, 2)).rejects.toThrow('OpenSearch Error');
    });

    it('should return empty array when no results found', async () => {
      mockClient.search.mockResolvedValueOnce({
        body: {
          hits: {
            hits: [],
          },
        },
      });

      const results = await openSearchService.searchSimilar(mockEmbeddings, 2);
      expect(results).toEqual([]);
    });
  });
}); 