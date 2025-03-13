import { Client } from '@opensearch-project/opensearch';
import env from '../config/env';
import logger from '../config/logger';

export interface Document {
  id: string;
  content: string;
  metadata: {
    source: string;
    title?: string;
    [key: string]: any;
  };
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  document: Document;
  score: number;
}

class OpenSearchService {
  private client: Client;
  private readonly index = 'documents';

  constructor() {
    this.client = new Client({
      node: env.OPENSEARCH_URL,
      auth: {
        username: env.OPENSEARCH_USERNAME,
        password: env.OPENSEARCH_PASSWORD,
      },
    });
  }

  async initialize(): Promise<void> {
    try {
      const indexExists = await this.client.indices.exists({ index: this.index });
      if (!indexExists.body) {
        await this.client.indices.create({
          index: this.index,
          body: {
            mappings: {
              properties: {
                content: { type: 'text' },
                embedding: { type: 'dense_vector', dims: 1536 },
                metadata: { type: 'object' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' },
              },
            },
          },
        });
      }
    } catch (error) {
      logger.error('Error initializing OpenSearch:', error);
      throw new Error('Failed to initialize OpenSearch');
    }
  }

  async addDocument(content: string, embedding: number[], metadata: any): Promise<void> {
    try {
      await this.initialize();
      await this.client.index({
        index: this.index,
        body: {
          content,
          embedding,
          metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error adding document:', error);
      throw new Error('Failed to add document');
    }
  }

  async bulkAddDocuments(documents: Document[]): Promise<void> {
    try {
      await this.initialize();
      const body = documents.flatMap(doc => [
        { index: { _index: this.index } },
        {
          ...doc,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const { body: bulkResponse } = await this.client.bulk({ body });
      if (bulkResponse.errors) {
        throw new Error('Bulk operation had errors');
      }
    } catch (error) {
      logger.error('Error bulk adding documents:', error);
      throw new Error('Failed to bulk add documents');
    }
  }

  async searchSimilar(embedding: number[], k: number = 3): Promise<SearchResult[]> {
    try {
      const response = await this.client.search({
        index: this.index,
        body: {
          size: k,
          query: {
            script_score: {
              query: { match_all: {} },
              script: {
                source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                params: { query_vector: embedding },
              },
            },
          },
        },
      });

      return response.body.hits.hits.map((hit: any) => ({
        document: hit._source as Document,
        score: hit._score,
      }));
    } catch (error) {
      logger.error('Error searching similar documents:', error);
      throw new Error('Failed to search similar documents');
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await this.client.delete({
        index: this.index,
        id,
      });
    } catch (error) {
      logger.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }

  async getDocument(id: string): Promise<Document | null> {
    try {
      const response = await this.client.get({
        index: this.index,
        id,
      });
      return response.body._source as Document;
    } catch (error) {
      if ((error as any).statusCode === 404) {
        return null;
      }
      logger.error('Error getting document:', error);
      throw new Error('Failed to get document');
    }
  }
}

export default new OpenSearchService(); 