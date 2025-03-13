import express from 'express';
import { chatValidators } from '../middleware/validators/chatValidators';
import { chatLimiter, knowledgeBaseLimiter, searchLimiter } from '../middleware/rateLimiter';
import chatService from '../services/chatService';
import logger from '../config/logger';
import { body, validationResult } from 'express-validator';
import { BedrockRuntime } from 'aws-sdk';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { validateSession, authenticate } from '../middleware/auth';
import ragService from '../services/ragService';
import { Message } from '../types/chat';
import { Document } from '../services/openSearchService';

const router = express.Router();
const bedrock = new BedrockRuntime();
const dynamoDB = new DynamoDB.DocumentClient();

/**
 * @swagger
 * /api/chat/generate:
 *   post:
 *     summary: Generate a chat response
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: The user's query
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ChatMessage'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/generate', validateSession, chatLimiter, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { query, conversationHistory } = req.body;
    const { userId } = req.user!;

    // Get relevant context from RAG service
    const embedding = await ragService.bedrockService.generateEmbeddings(query);
    const context = await ragService.openSearchService.searchSimilar(query, embedding);

    // Prepare conversation for Bedrock
    const messages = [
      {
        role: 'system',
        content: `You are a medical assistant AI. Use the following context to answer the user's question. If you cannot find relevant information in the context, say so.
        
Context:
${context.map(result => result.document.content).join('\n\n')}`,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: query,
      },
    ];

    // Call Bedrock
    const response = await bedrock.invokeModel({
      modelId: 'anthropic.claude-v2',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt: messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
      }),
    }).promise();

    const result = JSON.parse(response.body.toString());

    // Save conversation to DynamoDB
    const messageId = uuidv4();
    await dynamoDB.put({
      TableName: 'chat_messages',
      Item: {
        id: messageId,
        userId,
        role: 'assistant',
        content: result.completion,
        timestamp: new Date().toISOString(),
        metadata: {
          context: context.map(doc => doc.id),
          modelId: 'anthropic.claude-v2',
        },
      },
    }).promise();

    // Update conversation session
    const sessionId = req.headers['x-session-id'] as string;
    if (sessionId) {
      await dynamoDB.update({
        TableName: 'chat_sessions',
        Key: { id: sessionId },
        UpdateExpression: 'SET lastMessageId = :messageId, updatedAt = :now',
        ExpressionAttributeValues: {
          ':messageId': messageId,
          ':now': new Date().toISOString(),
        },
      }).promise();
    }

    res.json({
      response: result.completion,
      context: context.map(doc => ({
        id: doc.id,
        relevance: doc.relevance,
      })),
    });
  } catch (error) {
    console.error('Message generation error:', error);
    res.status(500).json({ message: 'Failed to generate response' });
  }
});

/**
 * @swagger
 * /api/chat/knowledge:
 *   post:
 *     summary: Add content to knowledge base
 *     tags: [Knowledge Base]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content to add
 *               metadata:
 *                 $ref: '#/components/schemas/DocumentMetadata'
 *     responses:
 *       200:
 *         description: Content added successfully
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/knowledge', authenticate, async (req, res) => {
  try {
    const { content, metadata } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!metadata || typeof metadata !== 'object') {
      return res.status(400).json({ error: 'Metadata is required' });
    }

    if (!metadata.source) {
      return res.status(400).json({ error: 'Source is required in metadata' });
    }

    await ragService.addToKnowledgeBase(content, metadata);
    res.json({ message: 'Document added successfully' });
  } catch (error) {
    logger.error('Error adding document:', error);
    res.status(500).json({ error: 'Failed to add document' });
  }
});

/**
 * @swagger
 * /api/chat/knowledge/search:
 *   get:
 *     summary: Search the knowledge base
 *     tags: [Knowledge Base]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of results to return
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   content:
 *                     type: string
 *                   score:
 *                     type: number
 *                   metadata:
 *                     $ref: '#/components/schemas/DocumentMetadata'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/knowledge/search', authenticate, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await ragService.searchKnowledgeBase(query);
    res.json(results);
  } catch (error) {
    logger.error('Error searching knowledge base:', error);
    res.status(500).json({ error: 'Failed to search knowledge base' });
  }
});

router.post('/message', authenticate, chatLimiter, async (req, res) => {
  try {
    const { content } = req.body;
    const user = req.user!;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ message: 'Invalid message content' });
    }

    const message: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const response = await chatService.processMessage(message, user);
    return res.json({ message: response });
  } catch (error) {
    console.error('Error processing message:', error);
    return res.status(500).json({ message: 'Failed to process message' });
  }
});

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

router.post('/rag', authenticate, chatLimiter, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query format' });
    }

    const response = await ragService.generateResponse(query);
    res.json(response);
  } catch (error) {
    logger.error('Error in RAG endpoint:', error);
    res.status(500).json({ error: 'Failed to process RAG request' });
  }
});

export default router; 