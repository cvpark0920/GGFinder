import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import authRoutes from './auth';
import userRoutes from './users';
import agencyRoutes from './agencies';
import clientRoutes from './clients';
import favoriteRoutes from './favorites';
import matchRoutes from './matches';
import youtubeRoutes from './youtube';

const router = Router();

// Authentication routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Agency routes
router.use('/agencies', agencyRoutes);

// Client routes
router.use('/clients', clientRoutes);

// Favorite routes
router.use('/favorites', favoriteRoutes);

// Match routes
router.use('/matches', matchRoutes);

// YouTube routes
router.use('/youtube', youtubeRoutes);

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API routes will be added here
// Example:
// router.get('/clients', async (req, res) => { ... });
// router.get('/matches', async (req, res) => { ... });

export default router;

