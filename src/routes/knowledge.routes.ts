import express from 'express';
import { authenticate } from '../middleware/auth';
import { knowledgeBaseLimiter } from '../middleware/rateLimiter';
import knowledgeBaseService from '../services/knowledgeBaseService';
import { KnowledgeBaseDocument } from '../types/knowledgeBase';
import logger from '../utils/logger';

const router = express.Router();

router.post('/add', authenticate, knowledgeBaseLimiter, async (req, res) => {
  try {
    const { documents } = req.body;

    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents must be an array' });
    }

    const validDocuments = documents.every((doc): doc is KnowledgeBaseDocument => {
      return typeof doc === 'object' && doc !== null &&
        typeof doc.content === 'string' && doc.content.length > 0 &&
        typeof doc.title === 'string' && doc.title.length > 0;
    });

    if (!validDocuments) {
      return res.status(400).json({ error: 'Invalid document format' });
    }

    await knowledgeBaseService.addDocuments(documents);
    return res.json({ message: 'Documents added successfully' });
  } catch (error) {
    logger.error('Error adding documents:', error);
    return res.status(500).json({ error: 'Failed to add documents' });
  }
});

router.get('/search', authenticate, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query' });
    }

    const results = await knowledgeBaseService.searchSimilar(query);
    return res.json(results);
  } catch (error) {
    logger.error('Error searching documents:', error);
    return res.status(500).json({ error: 'Failed to search documents' });
  }
});

export default router; 