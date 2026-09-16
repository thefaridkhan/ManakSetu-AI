import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDB, prisma } from './config/prisma.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupIngestionScheduler } from './ingestion/scheduler/cronJobs.js';

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in local development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.includes('/health')) {
      logger.info(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Health check and root endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Bureau of Indian Standards (BIS) Intelligent Assistant API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      apiDocs: '/api'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount Master API
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

const PORT = parseInt(env.PORT, 10) || 5000;

async function startServer() {
  await connectDB();
  
  // Start Cron Job
  setupIngestionScheduler();

  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`=======================================================`);
    logger.info(`🏛️  BIS Intelligent Assistant REST API Server Running!`);
    logger.info(`🚀 Listening on http://0.0.0.0:${PORT}`);
    logger.info(`📖 API Root: http://0.0.0.0:${PORT}/api`);
    logger.info(`🩺 Health Check: http://0.0.0.0:${PORT}/api/health`);
    logger.info(`🧠 AI Provider: ${env.AI_PROVIDER.toUpperCase()} (${env.GEMINI_MODEL})`);
    logger.info(`=======================================================`);
  });

  // Graceful Shutdown
  const shutdown = async () => {
    logger.info('🛑 Shutting down server gracefully...');
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('👋 Database disconnected. Process exiting.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();

export default app;
