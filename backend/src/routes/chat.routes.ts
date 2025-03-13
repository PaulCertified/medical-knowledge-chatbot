import express from 'express';
import { authenticate } from '../middleware/auth';
import chatService from '../services/chatService';
import { ApiError } from '../middleware/error';
import logger from '../config/logger';

const router = express.Router();

router.post('/chat', authenticate, async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new ApiError(400, 'Messages array is required');
    }

    // Validate message format
    const isValidFormat = messages.every(
      msg =>
        typeof msg === 'object' &&
        (msg.role === 'user' || msg.role === 'assistant') &&
        typeof msg.content === 'string'
    );

    if (!isValidFormat) {
      throw new ApiError(400, 'Invalid message format');
    }

    const response = await chatService.chat(messages);
    res.json(response);
  } catch (error) {
    logger.error('Chat error:', error);
    next(error);
  }
});

export default router; 