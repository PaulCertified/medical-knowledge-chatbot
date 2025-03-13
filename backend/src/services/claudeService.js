const axios = require('axios');
const logger = require('../config/logger');

class ClaudeService {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.anthropic.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });
  }

  async generateResponse(messages, options = {}) {
    try {
      const response = await this.client.post('/messages', {
        model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229-v1:0',
        max_tokens: options.max_tokens || 4096,
        messages,
        temperature: options.temperature || 0.7,
        system: options.system || "You are a knowledgeable and professional medical assistant. Always provide accurate, evidence-based information while maintaining HIPAA compliance. If you're unsure about something, say so rather than making assumptions."
      });

      logger.info('Claude API response received successfully');
      return response.data;
    } catch (error) {
      logger.error('Error calling Claude API:', error.response?.data || error.message);
      throw new Error('Failed to generate response from Claude');
    }
  }

  async generateEmbeddings(text) {
    try {
      const response = await this.client.post('/embeddings', {
        model: 'claude-3-sonnet-20240229-v1:0',
        input: text
      });

      logger.info('Claude embeddings generated successfully');
      return response.data.embedding;
    } catch (error) {
      logger.error('Error generating embeddings:', error.response?.data || error.message);
      throw new Error('Failed to generate embeddings');
    }
  }
}

module.exports = new ClaudeService(); 