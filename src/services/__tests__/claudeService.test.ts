import { jest } from '@jest/globals';
import axios from 'axios';
import { ClaudeService } from '../claudeService';

jest.mock('axios');

describe('ClaudeService', () => {
  let claudeService: ClaudeService;
  let mockAxiosInstance: jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockAxiosInstance = {
      post: jest.fn(),
      create: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<typeof axios>;

    (axios as unknown as jest.Mock).mockImplementation(() => mockAxiosInstance);
    claudeService = new ClaudeService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateText', () => {
    it('should generate text successfully', async () => {
      const mockResponse = {
        data: {
          completion: 'Generated text',
        },
      };

      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await claudeService.generateText('test prompt');
      expect(result).toBe('Generated text');
    });

    it('should handle API errors', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(claudeService.generateText('test prompt')).rejects.toThrow('API Error');
    });
  });
}); 