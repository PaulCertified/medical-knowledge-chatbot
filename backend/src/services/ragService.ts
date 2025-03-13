import bedrockService from './bedrockService';
import openSearchService from './openSearchService';
import logger from '../config/logger';
import { Document, SearchResult } from './openSearchService';

export interface RagResponse {
  response: string;
  context: SearchResult[];
}

class RagService {
  async generateResponse(query: string): Promise<RagResponse> {
    try {
      const embedding = await bedrockService.generateEmbeddings(query);
      const searchResults = await openSearchService.searchSimilar(embedding);

      let prompt = query;
      if (searchResults.length > 0) {
        const context = searchResults
          .map(
            (result, index) =>
              `[${index + 1}] ${result.document.content}\nSource: ${result.document.metadata.source}`
          )
          .join('\n\n');
        prompt = `Context:\n${context}\n\nQuestion: ${query}`;
      }

      const response = await bedrockService.generateText(prompt);
      return {
        response,
        context: searchResults,
      };
    } catch (error) {
      logger.error('Failed to generate response:', error);
      throw new Error('Failed to generate response');
    }
  }

  async addToKnowledgeBase(content: string, metadata: Document['metadata']): Promise<void> {
    try {
      const embedding = await bedrockService.generateEmbeddings(content);
      await openSearchService.addDocument(content, embedding, metadata);
    } catch (error) {
      logger.error('Failed to add to knowledge base:', error);
      throw new Error('Failed to add to knowledge base');
    }
  }

  async searchKnowledgeBase(query: string): Promise<SearchResult[]> {
    try {
      const embedding = await bedrockService.generateEmbeddings(query);
      return await openSearchService.searchSimilar(embedding);
    } catch (error) {
      logger.error('Failed to search knowledge base:', error);
      throw new Error('Failed to search knowledge base');
    }
  }
}

export default new RagService(); 