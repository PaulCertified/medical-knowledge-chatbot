import bedrockService from './bedrockService';
import openSearchService, { SearchResult } from './openSearchService';
import logger from '../utils/logger';

class RagService {
  public readonly bedrockService = bedrockService;
  public readonly openSearchService = openSearchService;

  async searchSimilar(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const embedding = await this.bedrockService.generateEmbeddings(query);
      return await this.openSearchService.searchSimilar(embedding, limit);
    } catch (error) {
      logger.error('Error searching similar documents:', error);
      throw error;
    }
  }

  async generateResponse(query: string): Promise<string> {
    try {
      const results = await this.searchSimilar(query);
      let prompt = query;
      
      if (results.length > 0) {
        const context = results
          .map((result, index) => `[${index + 1}] ${result.document.content}`)
          .join('\n\n');
        prompt = `Context:\n${context}\n\nQuestion: ${query}`;
      }

      return await this.bedrockService.generateText(prompt);
    } catch (error) {
      logger.error('Error generating response:', error);
      throw error;
    }
  }
}

const ragService = new RagService();
export type { RagService };
export default ragService; 