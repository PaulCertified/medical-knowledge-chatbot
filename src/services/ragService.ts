import claudeService from './claudeService';
import openSearchService from './openSearchService';
import logger from '../config/logger';
import config from '../config/config';
import { ClaudeMessage } from '../types/claude';

interface DocumentMetadata {
  source?: string;
  category?: string;
  timestamp?: string;
  [key: string]: any;
}

interface ProcessedDocument {
  content: string;
  embedding: number[];
  metadata: DocumentMetadata;
}

interface RAGConfig {
  chunkSize: number;
  chunkOverlap: number;
  maxDocuments: number;
  similarityThreshold: number;
}

class RAGService {
  private config: RAGConfig;

  constructor() {
    this.config = {
      chunkSize: config.rag.chunkSize || 1000,
      chunkOverlap: config.rag.chunkOverlap || 200,
      maxDocuments: config.rag.maxDocuments || 3,
      similarityThreshold: config.rag.similarityThreshold || 0.7
    };
  }

  async processDocument(content: string, metadata: DocumentMetadata = {}): Promise<void> {
    try {
      // Validate input
      if (!content || typeof content !== 'string') {
        throw new Error('Invalid document content');
      }

      // Split content into chunks
      const chunks = this.splitIntoChunks(content);
      
      // Generate embeddings for each chunk
      const documents: ProcessedDocument[] = await Promise.all(
        chunks.map(async (chunk) => {
          const embedding = await claudeService.generateEmbeddings(chunk);
          return {
            content: chunk,
            embedding,
            metadata: {
              ...metadata,
              timestamp: new Date().toISOString()
            }
          };
        })
      );

      // Bulk index the documents
      await openSearchService.bulkAddDocuments(documents);
      logger.info(`Processed and indexed ${chunks.length} chunks from document`);
    } catch (error: any) {
      logger.error('Error processing document:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  private splitIntoChunks(text: string): string[] {
    if (!text) return [];

    const chunks: string[] = [];
    let start = 0;
    
    while (start < text.length) {
      const end = Math.min(start + this.config.chunkSize, text.length);
      chunks.push(text.slice(start, end));
      start = end - this.config.chunkOverlap;
    }

    return chunks;
  }

  async generateResponse(query: string, conversationHistory: ClaudeMessage[] = []): Promise<any> {
    try {
      // Validate input
      if (!query || typeof query !== 'string') {
        throw new Error('Invalid query');
      }

      // Generate embedding for the query
      const queryEmbedding = await claudeService.generateEmbeddings(query);

      // Search for relevant documents
      const relevantDocs = await openSearchService.searchSimilar(
        query,
        queryEmbedding,
        this.config.maxDocuments
      );

      if (!relevantDocs.length) {
        logger.warn('No relevant documents found for query');
      }

      // Prepare context from relevant documents
      const context = relevantDocs
        .map(doc => doc.content)
        .join('\n\n');

      // Prepare system message with context
      const systemMessage = `You are a knowledgeable and professional medical assistant. Use the following relevant medical information to help answer the user's question, but do not reference it directly. Always provide accurate, evidence-based information while maintaining HIPAA compliance. If you're unsure about something, say so rather than making assumptions.

Relevant information:
${context}`;

      // Prepare messages array with conversation history
      const messages: ClaudeMessage[] = [
        ...conversationHistory,
        { role: 'user', content: query }
      ];

      // Generate response using Claude
      const response = await claudeService.generateResponse(messages, {
        system: systemMessage,
        temperature: 0.7
      });

      logger.info('Generated RAG response successfully');
      return response;
    } catch (error: any) {
      logger.error('Error generating RAG response:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  async addToKnowledgeBase(content: string, metadata: DocumentMetadata = {}): Promise<void> {
    try {
      if (!content || typeof content !== 'string') {
        throw new Error('Invalid content');
      }

      await this.processDocument(content, metadata);
      logger.info('Successfully added content to knowledge base');
    } catch (error: any) {
      logger.error('Error adding to knowledge base:', error);
      throw new Error(`Failed to add content to knowledge base: ${error.message}`);
    }
  }
}

export default new RAGService(); 