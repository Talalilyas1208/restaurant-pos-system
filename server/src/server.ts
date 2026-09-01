import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestId, noCache } from './middlewares/cacheControl.js';
import { getHealth } from './controllers/health.controller.js';

const app = express();

// 1. Security & utility middlewares
app.use(helmet());
app.use(requestId); // Attach X-Request-ID to every response for client-side tracing
app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin,
    credentials: true,
  })
);
app.use(morgan('dev'));

// 2. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 3. Health & Status (handled via dedicated health controller)
app.get('/health', noCache, getHealth);

// 4. API Routes
app.use('/api/v1', apiRoutes);

// 5. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// 6. Global Error Handler
app.use(errorHandler);

// 7. Start Server
const server = app.listen(config.port, () => {
  console.log(`🚀 Hotel POS Backend running at http://localhost:${config.port}`);
  console.log(`📡 Health Check: http://localhost:${config.port}/health`);
  console.log(`📑 API V1 Base: http://localhost:${config.port}/api/v1`);
});

// Graceful Shutdown
const handleShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
