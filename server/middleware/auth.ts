import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../prisma';

// Google OAuth2 클라이언트 초기화
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Express Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        name: string;
        email: string;
        picture: string | null;
        role: string;
        status: string;
        agencyId: number | null;
      };
    }
  }
}

/**
 * Google ID 토큰 검증 미들웨어
 * Authorization 헤더에서 Bearer 토큰을 추출하고 검증합니다.
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization token required' });
      return;
    }

    const idToken = authHeader.substring(7);

    // Google ID 토큰 검증
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const { sub: googleId } = payload;

    // DB에서 사용자 조회
    const user = await prisma.user.findUnique({
      where: { googleId: googleId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // 사용자 정보를 req.user에 추가
    req.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      picture: user.picture,
      role: user.role,
      status: user.status,
      agencyId: user.agencyId,
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(401).json({
      error: 'Invalid token',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * 역할 기반 접근 제어 미들웨어
 * 특정 역할만 접근을 허용합니다.
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

/**
 * 승인된 사용자만 접근 허용 미들웨어
 * status가 'active'인 사용자만 접근을 허용합니다.
 */
export const requireActiveStatus = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.status !== 'active') {
    res.status(403).json({
      error: 'Account not active',
      message: 'Your account is pending approval',
    });
    return;
  }

  next();
};

