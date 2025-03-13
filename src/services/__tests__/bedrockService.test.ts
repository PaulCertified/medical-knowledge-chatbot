import { BedrockService } from '../bedrockService';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Mock AWS SDK
jest.mock('@aws-sdk/client-bedrock-runtime');

describe('BedrockService', () => {
  let bedrockService: BedrockService;
  let mockBedrockClient: jest.Mocked<BedrockRuntimeClient>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock client
    mockBedrockClient = {
      send: jest.fn(),
    } as unknown as jest.Mocked<BedrockRuntimeClient>;

    // Initialize service with mock client
    bedrockService = new BedrockService(mockBedrockClient);

    // Setup default mock response for embedding generation
    (mockBedrockClient.send as jest.Mock).mockImplementation((command) => {
      if (command instanceof InvokeModelCommand) {
        if (command.input.modelId === 'amazon.titan-embed-text-v1') {
          return Promise.resolve({
            body: Buffer.from(JSON.stringify({
              embedding: Array(1024).fill(0.1),
            })),
          });
        } else {
          return Promise.resolve({
            body: Buffer.from(JSON.stringify({
              completion: 'Mock response from Bedrock',
            })),
          });
        }
      }
    });
  });

  describe('generateEmbedding', () => {
    it('should generate embedding for given text', async () => {
      // Execute
      const result = await bedrockService.generateEmbedding('Test text');

      // Verify
      expect(mockBedrockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            modelId: 'amazon.titan-embed-text-v1',
            body: expect.any(Buffer),
          }),
        })
      );
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(1024);
    });

    it('should throw error if embedding generation fails', async () => {
      // Setup
      mockBedrockClient.send.mockRejectedValueOnce(new Error('AWS Error'));

      // Execute & Verify
      await expect(bedrockService.generateEmbedding('Test text'))
        .rejects.toThrow('Failed to generate embedding');
    });

    it('should throw error for empty text', async () => {
      // Execute & Verify
      await expect(bedrockService.generateEmbedding(''))
        .rejects.toThrow('Text cannot be empty');
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