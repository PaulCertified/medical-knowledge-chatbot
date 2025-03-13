const { 
  LexRuntimeV2Client, 
  RecognizeTextCommand 
} = require('@aws-sdk/client-lex-runtime-v2');
const { LEX_CONFIG } = require('../config/aws');

class LexService {
  constructor() {
    this.lexClient = new LexRuntimeV2Client({
      region: process.env.AWS_REGION
    });
    this.botId = LEX_CONFIG.botId;
    this.botAliasId = LEX_CONFIG.botAliasId;
    this.localeId = LEX_CONFIG.localeId;
  }

  async classifyIntent(text, sessionId) {
    try {
      const command = new RecognizeTextCommand({
        botId: this.botId,
        botAliasId: this.botAliasId,
        localeId: this.localeId,
        sessionId: sessionId,
        text: text
      });

      const response = await this.lexClient.send(command);

      return {
        intent: response.interpretations[0]?.intent?.name || 'Unknown',
        confidence: response.interpretations[0]?.nluConfidence?.score || 0,
        slots: response.interpretations[0]?.intent?.slots || {},
        sessionState: response.sessionState
      };
    } catch (error) {
      console.error('Error classifying intent:', error);
      throw new Error('Failed to classify intent');
    }
  }

  // Map Lex intents to specific handlers
  getIntentHandler(intent) {
    const intentHandlers = {
      'MedicalQuery': this.handleMedicalQuery,
      'AppointmentScheduling': this.handleAppointmentQuery,
      'Greeting': this.handleGreeting,
      'Default': this.handleDefault
    };

    return intentHandlers[intent] || intentHandlers.Default;
  }

  async handleMedicalQuery(slots) {
    // This will be enhanced with proper medical knowledge handling
    return {
      type: 'medical',
      requiresFollowUp: true,
      slots
    };
  }

  async handleAppointmentQuery(slots) {
    return {
      type: 'appointment',
      requiresFollowUp: false,
      slots
    };
  }

  async handleGreeting() {
    return {
      type: 'greeting',
      requiresFollowUp: false,
      response: 'Hello! I am your HIPAA-compliant healthcare assistant. How can I help you today?'
    };
  }

  async handleDefault() {
    return {
      type: 'unknown',
      requiresFollowUp: true,
      response: 'I apologize, but I\'m not sure I understood your request. Could you please rephrase it?'
    };
  }

  // Validate that the response doesn't contain PHI
  validateResponse(response) {
    // Add PHI detection patterns
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{9}\b/, // MRN
      /\b\d{10}\b/, // Phone numbers
      /\b[A-Z]{2}\d{6}\b/ // Medical license numbers
    ];

    for (const pattern of phiPatterns) {
      if (pattern.test(response)) {
        throw new Error('Response contains potential PHI');
      }
    }

    return response;
  }
}

module.exports = new LexService(); 