import bedrockService from './bedrockService';
import openSearchService, { Document, SearchResult } from './openSearchService';
import logger from '../utils/logger';

export interface KnowledgeBaseDocument {
  content: string;
  metadata: {
    source: string;
    title?: string;
    [key: string]: any;
  };
}

class KnowledgeBaseService {
  async initialize(): Promise<void> {
    try {
      await openSearchService.initialize();
      logger.info('Knowledge base initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize knowledge base:', error);
      throw error;
    }
  }

  async addDocument(document: KnowledgeBaseDocument): Promise<void> {
    try {
      const embedding = await bedrockService.generateEmbeddings(document.content);
      await openSearchService.addDocument(document.content, embedding, document.metadata);
    } catch (error) {
      logger.error('Failed to add document:', error);
      throw new Error('Failed to add document');
    }
  }

  async addDocuments(documents: KnowledgeBaseDocument[]): Promise<void> {
    try {
      for (const document of documents) {
        await this.addDocument(document);
      }
    } catch (error) {
      logger.error('Failed to add documents:', error);
      throw new Error('Failed to add documents');
    }
  }

  async searchSimilar(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      const embedding = await bedrockService.generateEmbeddings(query);
      return await openSearchService.searchSimilar(embedding, limit);
    } catch (error) {
      logger.error('Failed to search documents:', error);
      throw new Error('Failed to search documents');
    }
  }

  async getDocument(id: string): Promise<KnowledgeBaseDocument | null> {
    return this.openSearchService.getDocument(id);
  }

  async deleteDocument(id: string): Promise<void> {
    await this.openSearchService.deleteDocument(id);
  }
}

const knowledgeBaseService = new KnowledgeBaseService();
export type { KnowledgeBaseService };
export default knowledgeBaseService;