import { Request, Response, NextFunction } from 'express';
import { appendFileSync } from 'fs';
import { join } from 'path';

export interface AppError extends Error {
  statusCode?: number;
}

// #region agent log
const logPath = join(process.cwd(), '.cursor', 'debug.log');
const logError = (location: string, error: Error | string, data?: any) => {
  const now = new Date();
  const timestamp = now.toISOString();
  const timestampMs = Date.now();
  const errorObj = typeof error === 'string' ? { message: error } : {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };
  const entry = JSON.stringify({
    location,
    message: 'ERROR',
    data: {
      ...errorObj,
      ...data,
    },
    timestamp: timestamp,
    timestampMs: timestampMs,
    sessionId: 'debug-session',
    runId: 'run5',
    hypothesisId: 'G',
  }) + '\n';
  try {
    appendFileSync(logPath, entry, 'utf8');
    console.error(`[${timestamp}] ${location}: ERROR`, errorObj, data);
  } catch (e) {
    // Ignore file write errors
  }
};
// #endregion

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // #region agent log
  logError('server/middleware/errorHandler.ts:35', err, {
    statusCode,
    path: req.path,
    method: req.method,
    url: req.originalUrl,
  });
  // #endregion

  console.error('Error:', {
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: AppError = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

