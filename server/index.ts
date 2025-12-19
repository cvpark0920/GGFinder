import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { appendFileSync } from 'fs';
import { join } from 'path';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
// Import API routes after server setup to avoid early Prisma initialization errors
let apiRoutes: any;
try {
  console.log('[DEBUG] Loading API routes...');
  apiRoutes = require('./routes/api').default;
  console.log('[DEBUG] API routes loaded successfully');
} catch (error) {
  console.error('[ERROR] Failed to load API routes:', error);
  console.error('[ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack');
  // Create a minimal router that returns errors
  const { Router } = require('express');
  apiRoutes = Router();
  apiRoutes.use('*', (req: any, res: any) => {
    res.status(503).json({ error: 'API routes failed to load', details: error instanceof Error ? error.message : String(error) });
  });
}

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

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Trust proxy 설정 (DigitalOcean App Platform은 로드밸런서 뒤에 있음)
// X-Forwarded-Proto, X-Forwarded-For 헤더를 신뢰하여 req.protocol, req.secure가 올바르게 설정됨
app.set('trust proxy', true);

// Middleware
// CORS 설정: FRONTEND_URL 또는 CORS_ORIGIN 환경 변수 사용
// #region agent log
const corsOrigin = process.env.CORS_ORIGIN;
const frontendUrl = process.env.FRONTEND_URL;
const allowedOrigin = corsOrigin || frontendUrl || 'http://localhost:4001';
fetch('http://127.0.0.1:7243/ingest/1ea1dcfc-80be-42cc-9332-f848c10e9a0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.ts:62',message:'CORS origin configuration',data:{corsOrigin:corsOrigin||'NOT_SET',frontendUrl:frontendUrl||'NOT_SET',allowedOrigin:allowedOrigin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion
app.use(cors({
  origin: allowedOrigin,
  credentials: true, // 쿠키 전송 허용
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes (must be before static file serving)
// #region agent log
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin || 'NO_ORIGIN';
  fetch('http://127.0.0.1:7243/ingest/1ea1dcfc-80be-42cc-9332-f848c10e9a0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.ts:72',message:'API request received',data:{method:req.method,path:req.path,origin:origin,allowedOrigin:allowedOrigin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  next();
});
// #endregion
app.use('/api', apiRoutes);

// Serve uploaded files (must be before React app static files)
// __dirname is server/dist, so we need to go up two levels to reach project root/uploads/
const uploadsPath = path.join(__dirname, '..', '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Serve static files from the React app build directory
// __dirname is server/dist, so we need to go up two levels to reach project root/build/
const buildPath = path.join(__dirname, '..', '..', 'build');
app.use(express.static(buildPath));

import prisma from './prisma';

// ... (existing imports)

// Health check endpoint (before SPA routing)
app.get('/health', async (req: Request, res: Response) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
    uptime: process.uptime(),
    database: {
      status: 'unknown',
      latency: 0,
      error: null as string | null
    }
  };

  try {
    const start = Date.now();
    // 간단한 쿼리로 DB 연결 확인
    await prisma.$queryRaw`SELECT 1`;
    const end = Date.now();
    
    healthCheck.database.status = 'connected';
    healthCheck.database.latency = end - start;
  } catch (error) {
    console.error('Health check DB error:', error);
    healthCheck.database.status = 'disconnected';
    healthCheck.database.error = error instanceof Error ? error.message : String(error);
    // DB 연결 실패 시에도 200 OK를 반환하되 상태 정보를 포함
    // (로드밸런서 설정에 따라 500을 반환해야 할 수도 있음)
  }

  console.log(`[${new Date().toISOString()}] Health check requested`, healthCheck);
  res.json(healthCheck);
});

// SPA routing: All other requests send back React's index.html file
// Express 5 doesn't support wildcard routes with '*', so we use app.use() as fallback
app.use((req: Request, res: Response, next: NextFunction) => {
  // Skip API routes - uploads and static files are already handled by express.static
  // express.static will call next() if file not found, so we only skip /api here
  if (req.path.startsWith('/api')) {
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

// Start server with error handling
console.log('=== Server Startup ===');
console.log(`Port: ${PORT}`);
console.log(`Build Path: ${buildPath}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
// #region agent log
console.log(`CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'NOT SET'}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);
console.log(`Allowed Origin: ${allowedOrigin}`);
fetch('http://127.0.0.1:7243/ingest/1ea1dcfc-80be-42cc-9332-f848c10e9a0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'server/index.ts:135',message:'Server startup - CORS config',data:{corsOrigin:process.env.CORS_ORIGIN||'NOT_SET',frontendUrl:process.env.FRONTEND_URL||'NOT_SET',allowedOrigin:allowedOrigin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion
console.log(`Node Version: ${process.version}`);
console.log(`Working Directory: ${process.cwd()}`);

try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📁 Serving static files from: ${buildPath}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
    console.log(`🔗 Health check available at: http://0.0.0.0:${PORT}/health`);
    logEntry('server/index.ts:113', 'Server started successfully', {
      port: PORT,
      buildPath,
      nodeEnv: process.env.NODE_ENV || 'development',
    });
  });
  
  server.on('error', (error: NodeJS.ErrnoException) => {
    logEntry('server/index.ts:120', 'Server listen error', {
      error: error.message,
      errorCode: error.code,
      port: PORT,
      syscall: error.syscall,
    });
    console.error(`❌ Failed to start server on port ${PORT}:`, error);
    console.error(`Error Code: ${error.code}`);
    console.error(`Error Message: ${error.message}`);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
    }
    process.exit(1);
  });
  
  server.on('listening', () => {
    const address = server.address();
    console.log(`✅ Server is listening on:`, address);
  });
  
} catch (error) {
  logEntry('server/index.ts:127', 'Server startup error', {
    error: error instanceof Error ? error.message : String(error),
    errorName: error instanceof Error ? error.name : 'Unknown',
    stack: error instanceof Error ? error.stack : undefined,
  });
  console.error('❌ Failed to start server:', error);
  if (error instanceof Error) {
    console.error('Error Stack:', error.stack);
  }
  process.exit(1);
}

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

