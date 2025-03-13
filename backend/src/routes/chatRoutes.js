const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const authService = require('../services/authService');

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await authService.verifyToken(token);
    if (!result.valid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user info to request
    req.user = result.decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Request validation middleware
const validateChatRequest = (req, res, next) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  // Check message length
  if (message.length > 1000) {
    return res.status(400).json({ error: 'Message too long' });
  }

  // Basic PHI detection (example patterns)
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{9}\b/, // MRN
    /\b\d{10}\b/, // Phone number
  ];

  for (const pattern of phiPatterns) {
    if (pattern.test(message)) {
      return res.status(400).json({ 
        error: 'Message contains sensitive information. Please do not include personal identifiable information.' 
      });
    }
  }

  next();
};

// Create new chat session
router.post('/sessions', authenticateUser, async (req, res) => {
  try {
    const sessionId = Date.now().toString();
    const userId = req.user.sub;

    // TODO: Store session in DynamoDB
    res.status(201).json({
      sessionId,
      created: new Date().toISOString(),
      userId
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Send message in chat session
router.post('/chat', authenticateUser, validateChatRequest, async (req, res) => {
  try {
    const { message } = req.body;
    const sessionId = req.headers['session-id'];
    const userId = req.user.sub;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const response = await chatService.processMessage(message, sessionId);
    
    // Audit log
    console.log({
      type: 'chat_message',
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
      messageLength: message.length
    });

    res.json({
      response: response.message,
      metadata: {
        ...response.metadata,
        userId,
        sessionId
      }
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get chat history
router.get('/history/:sessionId', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.sub;

    // TODO: Implement chat history retrieval from DynamoDB
    // Ensure user has access to the requested session
    
    res.json({
      sessionId,
      userId,
      messages: []
    });
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// Delete chat session
router.delete('/sessions/:sessionId', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.sub;

    // TODO: Implement session deletion in DynamoDB
    // Ensure user has access to the session before deletion

    res.json({
      message: 'Session deleted successfully',
      sessionId
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

module.exports = router; 