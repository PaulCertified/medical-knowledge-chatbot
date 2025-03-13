import { body, query, ValidationChain } from 'express-validator';
import { validate } from '../validate';

export const chatValidators = {
  generateResponse: [
    body('query')
      .trim()
      .notEmpty()
      .withMessage('Query is required')
      .isString()
      .withMessage('Query must be a string')
      .isLength({ min: 2, max: 1000 })
      .withMessage('Query must be between 2 and 1000 characters'),
    
    body('conversationHistory')
      .optional()
      .isArray()
      .withMessage('Conversation history must be an array'),
    
    body('conversationHistory.*.role')
      .optional()
      .isIn(['user', 'assistant'])
      .withMessage('Message role must be either "user" or "assistant"'),
    
    body('conversationHistory.*.content')
      .optional()
      .isString()
      .withMessage('Message content must be a string'),

    validate
  ],

  addToKnowledgeBase: [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isString()
      .withMessage('Content must be a string')
      .isLength({ min: 10, max: 100000 })
      .withMessage('Content must be between 10 and 100000 characters'),
    
    body('metadata')
      .optional()
      .isObject()
      .withMessage('Metadata must be an object'),
    
    body('metadata.source')
      .optional()
      .isString()
      .withMessage('Source must be a string'),
    
    body('metadata.category')
      .optional()
      .isString()
      .withMessage('Category must be a string'),

    validate
  ],

  searchKnowledgeBase: [
    query('query')
      .trim()
      .notEmpty()
      .withMessage('Search query is required')
      .isString()
      .withMessage('Search query must be a string')
      .isLength({ min: 2, max: 200 })
      .withMessage('Search query must be between 2 and 200 characters'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
      .toInt(),
    
    validate
  ]
}; 