import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

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
    hypothesisId: 'E',
  }) + '\n';
  try {
    appendFileSync(logPath, entry, 'utf8');
    // 콘솔에도 출력하여 즉시 확인 가능하도록
    console.log(`[${timestamp}] ${location}: ${message}`, data);
  } catch (e) {
    // Ignore file write errors
  }
};

const dbUrl = process.env.DATABASE_URL;
console.log('[DEBUG] DATABASE_URL check:', dbUrl ? `SET (length: ${dbUrl.length})` : 'NOT SET');

// DigitalOcean 등 프로덕션 환경에서 SSL 모드 강제 설정
if (process.env.NODE_ENV === 'production' && dbUrl && !dbUrl.includes('sslmode=')) {
  console.log('[DEBUG] Appending sslmode=require to DATABASE_URL');
  process.env.DATABASE_URL = dbUrl + (dbUrl.includes('?') ? '&sslmode=require' : '?sslmode=require');
}

logEntry('server/prisma.ts:8', 'Before PrismaClient init', {
  databaseUrlSet: !!dbUrl,
  databaseUrlLength: dbUrl?.length || 0,
  nodeEnv: process.env.NODE_ENV,
});
// #endregion

if (!dbUrl) {
  logEntry('server/prisma.ts:15', 'ERROR: DATABASE_URL not set', {});
  console.error('ERROR: DATABASE_URL environment variable is not set');
  // Don't throw immediately - allow server to start and handle errors gracefully
  // The error will be caught when PrismaClient is actually used
}

// #region agent log
console.log('[DEBUG] Creating PrismaClient');
let prismaVersion = 'unknown';
try {
  prismaVersion = require('@prisma/client/package.json').version;
} catch (e) {
  console.warn('[DEBUG] Could not read Prisma version:', e);
}
logEntry('server/prisma.ts:46', 'Creating PrismaClient', {
  hasDatasources: false,
  datasourceUrl: dbUrl ? dbUrl.substring(0, 30) + '...' : 'NOT SET',
  engineType: 'default (no engineType specified)',
  prismaVersion: prismaVersion,
});
// #endregion

let prisma: PrismaClient;

try {
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  // Prisma 7에서는 datasources 옵션을 사용하지 않음
  // DATABASE_URL 환경 변수에서 자동으로 읽어옴
  // engineType은 schema.prisma의 generator 설정에서 읽어옴
  // prisma.config.ts의 client 설정은 제거 (schema.prisma가 우선)
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // #region agent log
  console.log('[DEBUG] PrismaClient created successfully');
  logEntry('server/prisma.ts:48', 'PrismaClient created', {
    usingEnvVar: true,
  });
  // #endregion
} catch (error) {
  // #region agent log
  console.error('[DEBUG] PrismaClient creation failed:', error);
  logEntry('server/prisma.ts:54', 'PrismaClient creation failed', {
    error: error instanceof Error ? error.message : String(error),
    errorName: error instanceof Error ? error.name : 'Unknown',
  });
  // #endregion
  // Don't throw - create a mock PrismaClient that throws on use
  // This allows the server to start and handle errors gracefully
  prisma = new Proxy({} as PrismaClient, {
    get: () => {
      throw new Error(`PrismaClient initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
}

export default prisma;

