import express from 'express';
import pino from 'pino';
import routes from './routes';
import { whatsappClient } from './whatsapp';

const app: express.Application = express();
const logger = pino({ level: 'info' });
const PORT = process.env.PORT || 3500;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.use('/', routes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    ok: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    ok: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 WhatsApp Bridge server running on port ${PORT}`);
  logger.info(`📱 WhatsApp connection status: ${whatsappClient.getConnectionStatus()}`);
  logger.info('🔗 Endpoints:');
  logger.info(`   POST http://localhost:${PORT}/send-otp`);
  logger.info(`   GET  http://localhost:${PORT}/health`);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
  });
});

export default app;
