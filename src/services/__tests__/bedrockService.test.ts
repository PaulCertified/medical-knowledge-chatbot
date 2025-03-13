import { jest } from '@jest/globals';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import bedrockService from '../bedrockService';
import type { BedrockService } from '../bedrockService';

jest.mock('@aws-sdk/client-bedrock-runtime');

describe('BedrockService', () => {
  let mockBedrockClient: jest.Mocked<BedrockRuntimeClient>;

  beforeEach(() => {
    mockBedrockClient = {
      send: jest.fn(),
    } as unknown as jest.Mocked<BedrockRuntimeClient>;

    (BedrockRuntimeClient as jest.Mock).mockImplementation(() => mockBedrockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateEmbeddings', () => {
    it('should generate embeddings successfully', async () => {
      const mockResponse = {
        body: Buffer.from(JSON.stringify({ embedding: [0.1, 0.2, 0.3] })),
      };

      mockBedrockClient.send.mockResolvedValueOnce(mockResponse);

      const result = await bedrockService.generateEmbeddings('test text');
      expect(result).toEqual([0.1, 0.2, 0.3]);
    });

    it('should handle AWS errors', async () => {
      mockBedrockClient.send.mockRejectedValueOnce(new Error('AWS Error'));

      await expect(bedrockService.generateEmbeddings('test text')).rejects.toThrow('AWS Error');
    });
  });

  describe('generateText', () => {
    it('should generate text successfully', async () => {
      const mockResponse = {
        body: Buffer.from(JSON.stringify({ completion: 'Generated text' })),
      };

      mockBedrockClient.send.mockResolvedValueOnce(mockResponse);

      const result = await bedrockService.generateText('test prompt');
      expect(result).toBe('Generated text');
    });

    it('should handle AWS errors', async () => {
      mockBedrockClient.send.mockRejectedValueOnce(new Error('AWS Error'));

      await expect(bedrockService.generateText('test prompt')).rejects.toThrow('AWS Error');
    });

    it('should handle invalid JSON response', async () => {
      mockBedrockClient.send.mockResolvedValueOnce({
        body: Buffer.from('invalid json'),
      });

      await expect(bedrockService.generateText('test prompt')).rejects.toThrow();
    });
  });
}); 