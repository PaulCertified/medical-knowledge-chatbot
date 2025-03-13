const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for chat endpoints
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window per IP
  message: 'Too many chat requests. Please try again later.'
});

// Protected chat routes
router.post('/message', authenticateToken, chatLimiter, chatController.sendMessage);

// Admin routes for knowledge base management
router.post('/knowledge', authenticateToken, chatController.addToKnowledgeBase);

module.exports = router; 