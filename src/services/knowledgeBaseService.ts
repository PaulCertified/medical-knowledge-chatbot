import openSearchService from './openSearchService';
import embeddingService from './embeddingService';
import logger from '../config/logger';

export interface Document {
  content: string;
  metadata: {
    source: string;
    category: string;
    [key: string]: any;
  };
}

class KnowledgeBaseService {
  async initialize() {
    try {
      await openSearchService.initialize();
      logger.info('Knowledge base initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize knowledge base:', error);
      throw error;
    }
  }

  async addDocument(document: Document) {
    try {
      const embedding = await embeddingService.generateEmbedding(document.content);
      await openSearchService.addDocument(document.content, embedding, document.metadata);
      logger.info('Document added successfully');
    } catch (error) {
      logger.error('Failed to add document:', error);
      throw error;
    }
  }

  async addDocuments(documents: Document[]) {
    try {
      const embeddings = await embeddingService.generateEmbeddings(
        documents.map(doc => doc.content)
      );

      const documentsWithEmbeddings = documents.map((doc, index) => ({
        content: doc.content,
        embedding: embeddings[index],
        metadata: doc.metadata,
      }));

      await openSearchService.bulkAddDocuments(documentsWithEmbeddings);
      logger.info(`${documents.length} documents added successfully`);
    } catch (error) {
      logger.error('Failed to add documents:', error);
      throw error;
    }
  }

  async searchSimilar(query: string, limit: number = 5) {
    try {
      const embedding = await embeddingService.generateEmbedding(query);
      const results = await openSearchService.searchSimilar(query, embedding, limit);
      return results;
    } catch (error) {
      logger.error('Failed to search similar documents:', error);
      throw error;
    }
  }

  async searchByCategory(category: string, limit: number = 10) {
    try {
      // Implementation for category-based search
      // This would be added when needed
      throw new Error('Not implemented yet');
    } catch (error) {
      logger.error('Failed to search by category:', error);
      throw error;
    }
  }
}

export default new KnowledgeBaseService(); 