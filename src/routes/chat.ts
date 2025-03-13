import { Router } from 'express';
import { chatValidators } from '../middleware/validators/chatValidators';
import { chatLimiter, knowledgeBaseLimiter } from '../middleware/rateLimiter';
import ragService from '../services/ragService';
import logger from '../config/logger';
import { body, validationResult } from 'express-validator';
import { BedrockRuntime } from 'aws-sdk';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { validateSession } from '../middleware/auth';

const router = Router();
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
    const context = await ragService.searchKnowledgeBase(query);

    // Prepare conversation for Bedrock
    const messages = [
      {
        role: 'system',
        content: `You are a medical assistant AI. Use the following context to answer the user's question. If you cannot find relevant information in the context, say so.
        
Context:
${context.map(doc => doc.content).join('\n\n')}`,
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
router.post(
  '/knowledge',
  knowledgeBaseLimiter,
  chatValidators.addToKnowledgeBase,
  async (req, res) => {
    try {
      const { content, metadata } = req.body;
      
      await ragService.addToKnowledgeBase(content, metadata);
      
      logger.info('Added content to knowledge base successfully');
      res.json({ message: 'Content added successfully' });
    } catch (error: any) {
      logger.error('Error adding to knowledge base:', error);
      res.status(500).json({ error: 'Failed to add content to knowledge base' });
    }
  }
);

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
router.get(
  '/knowledge/search',
  chatValidators.searchKnowledgeBase,
  async (req, res) => {
    try {
      const { query, limit = 10 } = req.query;
      
      const queryEmbedding = await ragService.generateEmbeddings(query as string);
      const results = await ragService.searchKnowledgeBase(query as string, queryEmbedding, limit as number);
      
      logger.info(`Found ${results.length} results for knowledge base search`);
      res.json(results);
    } catch (error: any) {
      logger.error('Error searching knowledge base:', error);
      res.status(500).json({ error: 'Failed to search knowledge base' });
    }
  }
);

export default router; 