import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import { connectDatabase } from './config/database';
import { requestLogger, addRequestId } from './middleware/requestLogger';
import { securityHeaders, corsOptions, sanitizeInput } from './middleware/security';
import { generalLimiter, apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import apiRoutes from './routes';
import { env } from './config/env';

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(sanitizeInput);

// Request logging
app.use(requestLogger);
app.use(addRequestId);

// Rate limiting
app.use(generalLimiter);
app.use('/api', apiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory Management API',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}${env.API_DOCS_PATH}`,
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Connect to database
connectDatabase().catch((error) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});

export default app;
