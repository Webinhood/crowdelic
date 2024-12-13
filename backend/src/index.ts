import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { OpenAI } from 'openai';
import getPort from 'get-port';
import { authRouter } from './routes/auth';
import { personaRouter } from './routes/persona';
import { testRouter } from './routes/test';
import { costsRouter } from './routes/costs';
import { testMessagesRouter } from './routes/test_messages';
import { usersRouter } from './routes/users';
import { TinyTroupeService } from './services/tinytroupe_service';
import { CostsService } from './services/costs_service';
import WebSocketService from './websocket';
import logger from './utils/logger';
import { performanceMonitoring, requestTracking, errorTracking } from './middleware/performance';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Initialize OpenAI
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize services
const costsService = new CostsService();
const tinyTroupeService = new TinyTroupeService(openai, costsService);

// Middleware
app.use(performanceMonitoring());
app.use(requestTracking());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600
}));

// Initialize WebSocket with CORS
const wsService = new WebSocketService(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make services available to routes
app.set('wsService', wsService);
app.set('tinyTroupeService', tinyTroupeService);

// Increase timeout
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.log('Request has timed out.');
    res.status(408).send('Request has timed out.');
  });
  next();
});

app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/personas', personaRouter);
app.use('/api/tests', testRouter);
app.use('/api/tests', testMessagesRouter);
app.use('/api/costs', costsRouter);
app.use('/api/users', usersRouter);

// Add error tracking middleware after all routes
app.use(errorTracking());

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('Starting graceful shutdown...');

  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Shutdown timed out')), 10000);
  });

  try {
    // Close the HTTP server first
    await Promise.race([
      new Promise<void>((resolve) => {
        server.close(() => {
          console.log('HTTP server closed');
          resolve();
        });
      }),
      timeoutPromise
    ]);

    // Close WebSocket connections
    await wsService.cleanup();
    console.log('WebSocket connections closed');

    // Close any other resources (e.g., database connections)
    // Add any other cleanup here

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // Perform graceful shutdown
  gracefulShutdown();
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  // Perform graceful shutdown
  gracefulShutdown();
});

// Start server with port availability check
const startServer = async () => {
  try {
    const preferredPort = parseInt(process.env.PORT || '3000', 10);
    const port = await getPort({ port: preferredPort });

    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} was not available, using port ${port} instead`);
    }

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
