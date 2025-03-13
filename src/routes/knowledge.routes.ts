import express from 'express';
import { authenticate } from '../middleware/auth';
import knowledgeBaseService from '../services/knowledgeBaseService';
import { ApiError } from '../middleware/error';
import logger from '../config/logger';

const router = express.Router();

// Add a single document
router.post('/documents', authenticate, async (req, res, next) => {
  try {
    const { content, metadata } = req.body;

    if (!content || typeof content !== 'string') {
      throw new ApiError(400, 'Content is required and must be a string');
    }

    if (!metadata || typeof metadata !== 'object') {
      throw new ApiError(400, 'Metadata is required and must be an object');
    }

    if (!metadata.source || !metadata.category) {
      throw new ApiError(400, 'Source and category are required in metadata');
    }

    await knowledgeBaseService.addDocument({ content, metadata });
    res.status(201).json({ message: 'Document added successfully' });
  } catch (error) {
    logger.error('Error adding document:', error);
    next(error);
  }
});

// Add multiple documents
router.post('/documents/bulk', authenticate, async (req, res, next) => {
  try {
    const { documents } = req.body;

    if (!Array.isArray(documents) || documents.length === 0) {
      throw new ApiError(400, 'Documents array is required');
    }

    // Validate all documents
    const isValidFormat = documents.every(
      doc =>
        typeof doc.content === 'string' &&
        typeof doc.metadata === 'object' &&
        typeof doc.metadata.source === 'string' &&
        typeof doc.metadata.category === 'string'
    );

    if (!isValidFormat) {
      throw new ApiError(400, 'Invalid document format');
    }

    await knowledgeBaseService.addDocuments(documents);
    res.status(201).json({ message: `${documents.length} documents added successfully` });
  } catch (error) {
    logger.error('Error adding documents:', error);
    next(error);
  }
});

// Search documents
router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { query, limit } = req.query;

    if (!query || typeof query !== 'string') {
      throw new ApiError(400, 'Query parameter is required');
    }

    const numLimit = limit ? parseInt(limit as string, 10) : undefined;
    const results = await knowledgeBaseService.searchSimilar(query, numLimit);
    res.json(results);
  } catch (error) {
    logger.error('Error searching documents:', error);
    next(error);
  }
});

export default router; 