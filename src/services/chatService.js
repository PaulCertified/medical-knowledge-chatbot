const { bedrockClient, BEDROCK_CONFIG } = require('../config/aws');
const { InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const lexService = require('./lexService');
const ragService = require('./ragService');

class ChatService {
  constructor() {
    this.modelId = BEDROCK_CONFIG.modelId;
    this.maxTokens = BEDROCK_CONFIG.maxTokens;
    this.temperature = BEDROCK_CONFIG.temperature;
  }

  async processMessage(message, sessionId) {
    try {
      // First, classify the intent using Lex
      const intentData = await lexService.classifyIntent(message, sessionId);
      
      // Get the appropriate handler for the intent
      const intentHandler = lexService.getIntentHandler(intentData.intent);
      const intentResponse = await intentHandler(intentData.slots);

      let response;
      if (intentResponse.type === 'medical') {
        // For medical queries, use RAG to generate response
        response = await this.handleMedicalQuery(message, sessionId);
      } else {
        // For other intents, use the intent handler response
        response = {
          message: intentResponse.response || 'I understand your request. How can I assist you further?',
          metadata: {
            intent: intentData.intent,
            confidence: intentData.confidence,
            type: intentResponse.type
          }
        };
      }

      // Validate response for PHI
      response.message = lexService.validateResponse(response.message);

      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      throw new Error('Failed to process message');
    }
  }

  async handleMedicalQuery(message, sessionId) {
    try {
      // Get conversation history for context
      const context = await this.getConversationContext(sessionId);

      // Generate response using RAG
      const ragResponse = await ragService.generateResponse(
        message,
        context,
        this.constructSystemPrompt()
      );

      // Validate response for HIPAA compliance
      const validatedResponse = ragService.validateResponse(ragResponse.response);

      return {
        message: validatedResponse,
        metadata: {
          model: ragResponse.model,
          sources: ragResponse.sources,
          type: 'medical'
        }
      };
    } catch (error) {
      console.error('Error handling medical query:', error);
      throw new Error('Failed to process medical query');
    }
  }

  async getConversationContext(sessionId, limit = 5) {
    // TODO: Implement conversation history retrieval from DynamoDB
    return [];
  }

  constructSystemPrompt() {
    return `You are a HIPAA-compliant healthcare assistant. Your role is to:
    1. Provide accurate, evidence-based medical information
    2. Never ask for or store personal health information
    3. Always maintain patient privacy and confidentiality
    4. Use clear, understandable language
    5. Provide general medical guidance while emphasizing the importance of consulting healthcare professionals
    6. Never make definitive diagnoses or treatment recommendations
    7. Always include appropriate medical disclaimers when necessary`;
  }

  sanitizeResponse(response) {
    // Additional HIPAA compliance checks
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{9}\b/, // MRN
      /\b\d{10}\b/, // Phone numbers
      /\b[A-Z]{2}\d{6}\b/, // Medical license numbers
      /\b(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\b/, // Dates of birth
      /\b[A-Z][a-z]+ [A-Z][a-z]+, MD\b/, // Doctor names
      /\b\d{1,3} [A-Z][a-z]+ (?:Street|Ave|Road|Boulevard|Lane)\b/ // Addresses
    ];

    let sanitizedResponse = response;
    for (const pattern of phiPatterns) {
      sanitizedResponse = sanitizedResponse.replace(pattern, '[REDACTED]');
    }

    return sanitizedResponse;
  }

  async storeMessage(sessionId, message, response, metadata) {
    try {
      // TODO: Implement message storage in DynamoDB
      console.log('Storing message:', {
        sessionId,
        timestamp: new Date().toISOString(),
        message: this.sanitizeResponse(message),
        response: this.sanitizeResponse(response),
        metadata
      });
    } catch (error) {
      console.error('Error storing message:', error);
      // Don't throw error here to prevent blocking the response
    }
  }
}

module.exports = new ChatService(); 