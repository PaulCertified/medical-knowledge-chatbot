const claudeService = require('./claudeService');
const openSearchService = require('./openSearchService');
const logger = require('../config/logger');

class RAGService {
  constructor() {
    this.chunkSize = parseInt(process.env.RAG_CHUNK_SIZE) || 1000;
    this.chunkOverlap = parseInt(process.env.RAG_CHUNK_OVERLAP) || 200;
    this.maxDocuments = parseInt(process.env.RAG_MAX_DOCUMENTS) || 3;
    this.similarityThreshold = parseFloat(process.env.RAG_SIMILARITY_THRESHOLD) || 0.7;
  }

  async processDocument(content, metadata = {}) {
    try {
      // Split content into chunks
      const chunks = this.splitIntoChunks(content);
      
      // Generate embeddings for each chunk
      const documents = await Promise.all(
        chunks.map(async (chunk) => {
          const embedding = await claudeService.generateEmbeddings(chunk);
          return {
            content: chunk,
            embedding,
            metadata
          };
        })
      );

      // Bulk index the documents
      await openSearchService.bulkIndex(documents);
      logger.info(`Processed and indexed ${chunks.length} chunks from document`);
    } catch (error) {
      logger.error('Error processing document:', error);
      throw new Error('Failed to process document');
    }
  }

  splitIntoChunks(text) {
    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
      const end = Math.min(start + this.chunkSize, text.length);
      chunks.push(text.slice(start, end));
      start = end - this.chunkOverlap;
    }

    return chunks;
  }

  async generateResponse(query, conversationHistory = []) {
    try {
      // Generate embedding for the query
      const queryEmbedding = await claudeService.generateEmbeddings(query);

      // Search for relevant documents
      const relevantDocs = await openSearchService.searchSimilar(
        queryEmbedding,
        this.maxDocuments,
        this.similarityThreshold
      );

      // Prepare context from relevant documents
      const context = relevantDocs
        .map(doc => doc.content)
        .join('\n\n');

      // Prepare system message with context
      const systemMessage = `You are a knowledgeable and professional medical assistant. Use the following relevant medical information to help answer the user's question, but do not reference it directly. Always provide accurate, evidence-based information while maintaining HIPAA compliance. If you're unsure about something, say so rather than making assumptions.

Relevant information:
${context}`;

      // Prepare messages array with conversation history
      const messages = [
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
    } catch (error) {
      logger.error('Error generating RAG response:', error);
      throw new Error('Failed to generate response');
    }
  }

  async addToKnowledgeBase(content, metadata = {}) {
    try {
      await this.processDocument(content, metadata);
      logger.info('Successfully added content to knowledge base');
    } catch (error) {
      logger.error('Error adding to knowledge base:', error);
      throw new Error('Failed to add content to knowledge base');
    }
  }
}

module.exports = new RAGService(); 