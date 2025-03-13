import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { apiLimiter } from './middleware/rateLimiter';
import { swaggerSpec } from './config/swagger';
import chatRoutes from './routes/chat';
import logger from './config/logger';
import config from './config/config';
import knowledgeRoutes from './routes/knowledge.routes';
import knowledgeBaseService from './services/knowledgeBaseService';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/chat', chatRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// Initialize services
const initializeApp = async () => {
  try {
    await knowledgeBaseService.initialize();
    logger.info('Knowledge base initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

// Start server
const startServer = () => {
  const port = config.port;
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
    logger.info(`API Documentation available at http://localhost:${port}/api-docs`);
  });
};

// Initialize and start
initializeApp().then(startServer);

export default app; 