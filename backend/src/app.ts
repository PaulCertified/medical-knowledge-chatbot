import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { authLimiter, chatLimiter, searchLimiter } from './middleware/rateLimiter';
import { authenticate } from './middleware/auth';
import env from './config/env';

// Import routes
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import knowledgeRoutes from './routes/knowledge.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.ENABLE_REQUEST_LOGGING) {
  app.use(morgan('combined'));
}

// Rate limiting
if (env.ENABLE_RATE_LIMIT) {
  app.use('/api/auth', authLimiter);
  app.use('/api/chat', chatLimiter);
  app.use('/api/knowledge', searchLimiter);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', authenticate, chatRoutes);
app.use('/api/knowledge', authenticate, knowledgeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

export default app; 