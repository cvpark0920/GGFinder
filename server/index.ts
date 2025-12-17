import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { appendFileSync } from 'fs';
import { join } from 'path';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import apiRoutes from './routes/api';

// #region agent log
const logPath = join(process.cwd(), '.cursor', 'debug.log');
const logEntry = (location: string, message: string, data: any) => {
  const now = new Date();
  const timestamp = now.toISOString();
  const timestampMs = Date.now();
  const entry = JSON.stringify({
    location,
    message,
    data,
    timestamp: timestamp,
    timestampMs: timestampMs,
    sessionId: 'debug-session',
    runId: 'run5',
    hypothesisId: 'F',
  }) + '\n';
  try {
    appendFileSync(logPath, entry, 'utf8');
    console.log(`[${timestamp}] ${location}: ${message}`, data);
  } catch (e) {
    // Ignore file write errors
  }
};

logEntry('server/index.ts:18', 'Server starting - checking env vars', {
  databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
});
// #endregion

const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4001',
  credentials: true, // 쿠키 전송 허용
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes (must be before static file serving)
app.use('/api', apiRoutes);

// Serve uploaded files (must be before React app static files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the React app build directory
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// Health check endpoint (before SPA routing)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA routing: All other requests send back React's index.html file
// Express 5 doesn't support wildcard routes with '*', so we use app.use() as fallback
app.use((req: Request, res: Response, next: NextFunction) => {
  // Skip API routes, uploads, and static files that were already handled
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  // Serve index.html for all other routes (SPA fallback)
  res.sendFile(path.join(buildPath, 'index.html'), (err) => {
    if (err) {
      next(err);
    }
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// #region agent log
// Process-level error handlers (register before app.listen to catch startup errors)
process.on('uncaughtException', (error: Error) => {
  logEntry('server/index.ts:91', 'Uncaught Exception', {
    error: error.message,
    errorName: error.name,
    stack: error.stack,
  });
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logEntry('server/index.ts:99', 'Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    errorName: reason instanceof Error ? reason.name : 'Unknown',
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  console.error('Unhandled Rejection:', reason);
});
// #endregion

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${buildPath}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logEntry('server/index.ts:99', 'SIGTERM received', {});
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logEntry('server/index.ts:105', 'SIGINT received', {});
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

