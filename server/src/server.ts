import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestId, noCache } from './middlewares/cacheControl.js';
import { getHealth } from './controllers/health.controller.js';
import { generalLimiter } from './middlewares/rateLimiter.js';

const app = express();

// 1. Hide server technology signature
app.disable('x-powered-by');

// 2. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Managed by Next.js frontend
  })
);

// 3. Attach X-Request-ID for distributed tracing & telemetry
app.use(requestId);

// 4. Secure CORS Configuration
const allowedOrigins = config.corsOrigin && config.corsOrigin !== '*'
  ? config.corsOrigin.split(',').map((o) => o.trim())
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // In development or if wildcard configured, allow localhost & standard web origins
      if (!allowedOrigins) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      return callback(new Error('Cross-Origin Request Blocked by CORS Security Policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    maxAge: 86400, // 24 hours preflight cache
  })
);

// 5. Rate Limiting Protection (DDoS and Brute-force mitigation)
app.use(generalLimiter);

// 6. Request Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// 7. Body Parsing with Strict Payload Caps
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 8. Health & Status Check
app.get('/health', noCache, getHealth);

// 9. API V1 Routes
app.use('/api/v1', apiRoutes);

// 10. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: cannot ${req.method} ${req.originalUrl}`,
  });
});

// 11. Centralized Global Error Handler (Sanitizes stack traces & DB errors)
app.use(errorHandler);

// 12. Start HTTP Server
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
