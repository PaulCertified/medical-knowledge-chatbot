import { jest } from '@jest/globals';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import bedrockService from '../bedrockService';
import type { BedrockService } from '../bedrockService';

// Mock AWS SDK
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

  describe('generateResponse', () => {
    const mockQuery = 'What are the symptoms of diabetes?';
    const mockConversationHistory = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi, how can I help you?' },
    ];
    const mockContext = 'Diabetes symptoms include increased thirst and frequent urination.';

    it('should generate response with context and conversation history', async () => {
      // Execute
      const result = await bedrockService.generateResponse(
        mockQuery,
        mockConversationHistory,
        mockContext
      );

      // Verify
      expect(mockBedrockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            modelId: expect.stringContaining('anthropic.claude'),
            body: expect.any(Buffer),
          }),
        })
      );
      expect(result).toBe('Mock response from Bedrock');
    });

    it('should generate response without context', async () => {
      // Execute
      const result = await bedrockService.generateResponse(
        mockQuery,
        mockConversationHistory
      );

      // Verify
      expect(mockBedrockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            modelId: expect.stringContaining('anthropic.claude'),
            body: expect.any(Buffer),
          }),
        })
      );
      expect(result).toBe('Mock response from Bedrock');
    });

    it('should generate response without conversation history', async () => {
      // Execute
      const result = await bedrockService.generateResponse(mockQuery);

      // Verify
      expect(mockBedrockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            modelId: expect.stringContaining('anthropic.claude'),
            body: expect.any(Buffer),
          }),
        })
      );
      expect(result).toBe('Mock response from Bedrock');
    });

    it('should throw error if response generation fails', async () => {
      // Setup
      mockBedrockClient.send.mockRejectedValueOnce(new Error('AWS Error'));

      // Execute & Verify
      await expect(bedrockService.generateResponse(mockQuery))
        .rejects.toThrow('Failed to generate response');
    });

    it('should throw error for empty query', async () => {
      // Execute & Verify
      await expect(bedrockService.generateResponse(''))
        .rejects.toThrow('Query cannot be empty');
    });

    it('should handle malformed response from Bedrock', async () => {
      // Setup
      mockBedrockClient.send.mockResolvedValueOnce({
        body: Buffer.from('invalid json'),
      });

      // Execute & Verify
      await expect(bedrockService.generateResponse(mockQuery))
        .rejects.toThrow('Failed to parse response');
    });
  });
}); 