import express from 'express';
import { authenticate } from '../middleware/auth';
import { chatLimiter } from '../middleware/rateLimiter';
import chatService from '../services/chatService';
import ragService from '../services/ragService';
import logger from '../utils/logger';

const router = express.Router();

router.post('/chat', authenticate, chatLimiter, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query' });
    }

    const response = await chatService.chat(query);
    return res.json(response);
  } catch (error) {
    logger.error('Error in chat endpoint:', error);
    return res.status(500).json({ error: 'Failed to process chat request' });
  }
});

router.get('/search', authenticate, async (req, res) => {
  try {
    const { query, limit } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query' });
    }

    const numLimit = limit ? parseInt(limit as string, 10) : undefined;
    const results = await ragService.searchSimilar(query, numLimit);
    return res.json(results);
  } catch (error) {
    logger.error('Error in search endpoint:', error);
    return res.status(500).json({ error: 'Failed to search documents' });
  }
});

export default router;