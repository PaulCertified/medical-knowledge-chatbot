import { Client } from '@opensearch-project/opensearch';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import config from '../config/config';
import logger from '../config/logger';

export class OpenSearchService {
  private client: Client;
  private readonly indexName = 'medical-knowledge';

  constructor() {
    if (!config.openSearch.node) {
      throw new Error('Missing required OpenSearch configuration');
    }

    this.client = new Client({
      ...AwsSigv4Signer({
        region: config.aws.region,
        service: 'es',
        getCredentials: () => {
          const credentialsProvider = defaultProvider();
          return credentialsProvider();
        },
      }),
      node: config.openSearch.node,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }

  async initialize() {
    try {
      const response = await this.client.indices.exists({
        index: this.indexName
      });
      
      if (response.statusCode === 404) {
        await this.createIndex();
      } else {
        // Delete and recreate the index to update the vector dimension
        await this.client.indices.delete({ index: this.indexName });
        await this.createIndex();
      }
    } catch (error) {
      logger.error('Failed to initialize OpenSearch:', error);
      throw error;
    }
  }

  private async createIndex() {
    try {
      const response = await this.client.indices.create({
        index: this.indexName,
        body: {
          mappings: {
            properties: {
              content: { type: 'text' },
              embedding: {
                type: 'knn_vector',
                dimension: 1024,
                method: {
                  name: 'hnsw',
                  space_type: 'l2',
                  engine: 'nmslib'
                }
              },
              metadata: {
                properties: {
                  source: { type: 'keyword' },
                  category: { type: 'keyword' },
                  timestamp: { type: 'date' },
                },
              },
            },
          },
          settings: {
            index: {
              number_of_shards: 1,
              number_of_replicas: 1,
            },
          },
        },
      });
      logger.info(`Created index: ${this.indexName}`);
    } catch (error) {
      logger.error('Failed to create index:', error);
      throw error;
    }
  }

  async searchSimilar(query: string, embedding: number[], limit: number = 5) {
    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            script_score: {
              query: { match_all: {} },
              script: {
                source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                params: { query_vector: embedding },
              },
            },
          },
          size: limit,
        },
      });

      return response.body.hits.hits.map((hit: any) => ({
        content: hit._source.content,
        score: hit._score,
        metadata: hit._source.metadata,
      }));
    } catch (error) {
      logger.error('Failed to search similar documents:', error);
      throw error;
    }
  }

  async addDocument(content: string, embedding: number[], metadata: any) {
    try {
      await this.client.index({
        index: this.indexName,
        body: {
          content,
          embedding,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
          },
        },
        refresh: true,
      });
    } catch (error) {
      logger.error('Failed to add document:', error);
      throw error;
    }
  }

  async bulkAddDocuments(documents: Array<{ content: string; embedding: number[]; metadata: any }>) {
    try {
      const body = documents.flatMap(doc => [
        { index: { _index: this.indexName } },
        {
          content: doc.content,
          embedding: doc.embedding,
          metadata: {
            ...doc.metadata,
            timestamp: new Date().toISOString(),
          },
        },
      ]);

      const response = await this.client.bulk({ body, refresh: true });
      
      if (response.body.errors) {
        const errors = response.body.items
          .filter((item: any) => item.index.error)
          .map((item: any) => item.index.error);
        throw new Error(`Bulk indexing errors: ${JSON.stringify(errors)}`);
      }
    } catch (error) {
      logger.error('Failed to bulk add documents:', error);
      throw error;
    }
  }
}

export default new OpenSearchService(); 