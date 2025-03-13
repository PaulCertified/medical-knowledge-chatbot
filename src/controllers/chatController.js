const ragService = require('../services/ragService');
const logger = require('../config/logger');

class ChatController {
  async sendMessage(req, res) {
    try {
      const { message, conversationHistory } = req.body;
      const userId = req.user.sub; // From Cognito JWT token

      // Log the incoming message
      logger.info('Received chat message', {
        userId,
        messageLength: message.length
      });

      // Generate response using RAG
      const response = await ragService.generateResponse(message, conversationHistory);

      // Log the response
      logger.info('Generated chat response', {
        userId,
        responseLength: response.content.length
      });

      res.json({
        message: response.content,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in chat message handling:', error);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  }

  async addToKnowledgeBase(req, res) {
    try {
      const { content, metadata } = req.body;

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Invalid content format' });
      }

      await ragService.addToKnowledgeBase(content, metadata);

      res.json({
        message: 'Content added to knowledge base successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error adding to knowledge base:', error);
      res.status(500).json({ error: 'Failed to add content to knowledge base' });
    }
  }
}

module.exports = new ChatController(); 