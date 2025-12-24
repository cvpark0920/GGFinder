import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../prisma';
import crypto from 'crypto';

const router = Router();

// 슈퍼 관리자 이메일 상수 정의
const SUPER_ADMIN_EMAIL = 'cvpark0920@gmail.com';

// Google OAuth2 클라이언트 초기화
// 환경 변수 검증
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('⚠️ ERROR: GOOGLE_CLIENT_ID is not set!');
  console.error('Please set GOOGLE_CLIENT_ID as RUN_TIME SECRET in DigitalOcean');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error('⚠️ ERROR: GOOGLE_CLIENT_SECRET is not set!');
  console.error('Please set GOOGLE_CLIENT_SECRET as RUN_TIME SECRET in DigitalOcean');
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
// GOOGLE_REDIRECT_URI는 백엔드 URL이어야 함 (Google OAuth 콜백이 백엔드로 옴)
// 개발 환경에서는 localhost:4000 (백엔드), 프로덕션에서는 백엔드 도메인 사용
const isDevelopment = process.env.NODE_ENV !== 'production';
const defaultBackendUrl = isDevelopment ? 'http://localhost:4000' : (process.env.FRONTEND_URL || 'https://finder.ggacademy.top');
const backendBaseUrl = process.env.API_BASE_URL || process.env.FRONTEND_URL || defaultBackendUrl;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || `${backendBaseUrl}/api/auth/google/callback`;

// 프론트엔드 URL (인증 후 리디렉션용)
const defaultFrontendUrl = isDevelopment ? 'http://localhost:4001' : 'http://localhost:4000';
const frontendBaseUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || defaultFrontendUrl;

// 디버깅: Google OAuth 설정 로그
console.log('[Google OAuth Config]', {
  GOOGLE_CLIENT_ID: googleClientId ? `${googleClientId.substring(0, 20)}...` : 'NOT SET',
  GOOGLE_CLIENT_SECRET: googleClientSecret ? 'SET' : 'NOT SET',
  GOOGLE_REDIRECT_URI: googleRedirectUri,
  backendBaseUrl,
  frontendBaseUrl,
  FRONTEND_URL: process.env.FRONTEND_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
});

if (!googleClientId || !googleClientSecret) {
  console.error('⚠️ CRITICAL: Google OAuth credentials are missing!');
  console.error(`GOOGLE_CLIENT_ID: ${googleClientId ? 'SET' : 'NOT SET'}`);
  console.error(`GOOGLE_CLIENT_SECRET: ${googleClientSecret ? 'SET' : 'NOT SET'}`);
}

const client = new OAuth2Client(
  googleClientId,
  googleClientSecret,
  googleRedirectUri
);

/**
 * Google OAuth 리디렉션 시작
 * GET /api/auth/google/redirect
 */
router.get('/google/redirect', async (req: Request, res: Response) => {
  try {
    // CSRF 보호를 위한 state 생성
    const state = crypto.randomBytes(32).toString('hex');
    
    // 원래 페이지 정보 저장 (선택사항)
    const returnUrl = req.query.returnUrl as string || '/';
    
    // 세션 또는 쿠키에 state 저장 (간단한 구현을 위해 쿠키 사용)
    // DigitalOcean App Platform은 HTTPS를 사용하므로 secure: true 필요
    // sameSite: 'none'은 크로스 도메인 요청을 허용 (Google OAuth 리디렉션용)
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = !isProduction;
    const defaultFrontendUrl = isDevelopment ? 'http://localhost:4001' : 'http://localhost:4000';
    const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || defaultFrontendUrl;
    
    // 디버깅: 환경 변수 로그
    console.log('[OAuth Redirect] Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      FRONTEND_URL: process.env.FRONTEND_URL,
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      frontendUrl,
      isProduction,
    });
    
    const cookieOptions: any = {
      httpOnly: true,
      secure: isProduction, // 프로덕션에서는 HTTPS만 허용
      sameSite: isProduction ? 'none' : 'lax', // 프로덕션에서는 크로스 도메인 허용
      maxAge: 10 * 60 * 1000, // 10분
      path: '/', // 모든 경로에서 쿠키 접근 가능
    };
    
    // 프로덕션에서는 도메인을 명시적으로 설정하지 않음 (브라우저가 자동 설정)
    // 하지만 필요시 도메인을 설정할 수 있음
    
    res.cookie('oauth_state', state, cookieOptions);
    res.cookie('oauth_return_url', returnUrl, cookieOptions);
    
    console.log('[OAuth Redirect] Cookie set:', {
      stateLength: state.length,
      returnUrl,
      cookieOptions,
    });

    // Google OAuth 인증 URL 생성
    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid',
      ],
      state: state,
      prompt: 'consent', // 항상 동의 화면 표시
    });

    // Google 인증 페이지로 리디렉션
    res.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth redirect error:', error);
    res.status(500).json({
      error: 'Failed to initiate OAuth flow',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Google OAuth 콜백 처리
 * GET /api/auth/google/callback
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    // 환경 변수 확인 및 fallback 처리
    // 개발 환경에서는 localhost:4001을 기본값으로 사용 (프론트엔드가 4001에서 실행)
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const defaultFrontendUrl = isDevelopment ? 'http://localhost:4001' : 'http://localhost:4000';
    let frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN;
    
    // 환경 변수가 없으면 요청의 host를 사용하여 URL 구성
    // Google OAuth 콜백은 Google 서버에서 직접 호출되므로 origin/referer가 없을 수 있음
    if (!frontendUrl) {
      const requestHost = req.get('host');
      const protocol = req.protocol || (req.secure ? 'https' : 'http');
      
      if (requestHost) {
        // 개발 환경이고 백엔드 호스트인 경우 프론트엔드 포트로 변경
        if (isDevelopment && requestHost.includes(':4000')) {
          frontendUrl = 'http://localhost:4001';
          console.warn('[OAuth Callback] Development mode: Using frontend port 4001');
        } else {
          frontendUrl = `${protocol}://${requestHost}`;
          console.warn('[OAuth Callback] Using request host as fallback:', frontendUrl);
        }
      } else {
        // 최후의 수단: origin 또는 referer 시도
        const requestOrigin = req.get('origin') || req.get('referer');
        if (requestOrigin) {
          try {
            const url = new URL(requestOrigin);
            frontendUrl = `${url.protocol}//${url.host}`;
            console.warn('[OAuth Callback] Using request origin/referer as fallback:', frontendUrl);
          } catch (e) {
            console.error('[OAuth Callback] Failed to parse origin/referer:', requestOrigin);
            frontendUrl = defaultFrontendUrl; // 개발/프로덕션에 맞는 기본값 사용
          }
        } else {
          frontendUrl = defaultFrontendUrl; // 개발/프로덕션에 맞는 기본값 사용
        }
      }
    }
    
    console.log('[OAuth Callback] Frontend URL determined:', {
      FRONTEND_URL: process.env.FRONTEND_URL,
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      frontendUrl,
      requestHost: req.get('host'),
      requestProtocol: req.protocol,
      requestSecure: req.secure,
      requestOrigin: req.get('origin'),
      requestReferer: req.get('referer'),
    });
    
    // 에러 처리
    if (error) {
      console.error('Google OAuth error:', error);
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(String(error))}`);
    }

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/login?error=missing_parameters`);
    }

    // CSRF 보호: state 검증
    const storedState = req.cookies?.oauth_state;
    
    // 디버깅: 쿠키 상태 및 환경 변수 로그
    console.log('[OAuth Callback] State validation:', {
      hasStoredState: !!storedState,
      storedStateLength: storedState?.length || 0,
      receivedStateLength: (state as string)?.length || 0,
      statesMatch: storedState === state,
      cookies: Object.keys(req.cookies || {}),
      allCookies: req.cookies,
      FRONTEND_URL: process.env.FRONTEND_URL,
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      NODE_ENV: process.env.NODE_ENV,
      frontendUrl,
      requestHost: req.get('host'),
      requestOrigin: req.get('origin'),
      requestReferer: req.get('referer'),
    });
    
    if (!storedState || storedState !== state) {
      // frontendUrl은 이미 위에서 결정되었으므로 그대로 사용
      const redirectUrl = frontendUrl;
      
      console.error('OAuth state validation failed:', {
        hasStoredState: !!storedState,
        storedStateLength: storedState?.length || 0,
        receivedStateLength: (state as string)?.length || 0,
        statesMatch: storedState === state,
        cookies: Object.keys(req.cookies || {}),
        allCookies: req.cookies,
        FRONTEND_URL: process.env.FRONTEND_URL,
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        NODE_ENV: process.env.NODE_ENV,
        frontendUrl,
        redirectUrl,
        requestHost: req.get('host'),
        requestOrigin: req.get('origin'),
        requestReferer: req.get('referer'),
      });
      return res.redirect(`${redirectUrl}/login?error=invalid_state`);
    }

    // 쿠키에서 returnUrl 가져오기
    const returnUrl = req.cookies?.oauth_return_url || '/';

    // code를 토큰으로 교환
    const { tokens } = await client.getToken(code as string);
    
    if (!tokens.id_token) {
      return res.redirect(`${frontendUrl}/login?error=no_id_token`);
    }

    // ID 토큰 검증
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.redirect(`${frontendUrl}/login?error=invalid_token`);
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.redirect(`${frontendUrl}/login?error=no_email`);
    }

    // 사용자 정보 추출
    const userEmail = email;
    const userName = name || email.split('@')[0];
    const userPicture = picture || null;

    // 슈퍼 관리자 여부 확인
    const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL;

    // DB에서 사용자 조회 또는 생성
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userEmail },
          { googleId: googleId },
        ],
      },
      include: {
        agency: true,
      },
    });

    if (user) {
      // 기존 사용자 업데이트 (이름은 업데이트하지 않음)
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleId,
          picture: userPicture,
          email: userEmail,
          lastLogin: new Date(),
          ...(isSuperAdmin ? { role: 'super_admin' } : {}),
        },
        include: {
          agency: true,
        },
      });
    } else {
      // 새 사용자 생성
      const username = email.split('@')[0];
      let uniqueUsername = username;
      let counter = 1;

      while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
        uniqueUsername = `${username}${counter}`;
        counter++;
      }

      user = await prisma.user.create({
        data: {
          username: uniqueUsername,
          name: userName,
          email: userEmail,
          googleId: googleId,
          picture: userPicture,
          role: isSuperAdmin ? 'super_admin' : 'agency_member',
          status: 'pending',
          joinDate: new Date(),
          lastLogin: new Date(),
        },
        include: {
          agency: true,
        },
      });
    }

    // 쿠키 정리 (clearCookie도 동일한 옵션 필요)
    const isProduction = process.env.NODE_ENV === 'production';
    const clearCookieOptions: any = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    };
    res.clearCookie('oauth_state', clearCookieOptions);
    res.clearCookie('oauth_return_url', clearCookieOptions);

    // 프론트엔드로 리디렉션 (토큰을 쿼리 파라미터로 전달)
    // 보안을 위해 짧은 세션 토큰을 사용하거나, httpOnly 쿠키로 전달하는 것이 더 안전함
    const tokenParam = encodeURIComponent(tokens.id_token);
    console.log('[OAuth Callback] Success redirect:', {
      frontendUrl,
      returnUrl,
    });
    res.redirect(`${frontendUrl}/auth/callback?token=${tokenParam}&returnUrl=${encodeURIComponent(returnUrl)}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    // 에러 발생 시에도 동일한 frontendUrl 로직 사용
    // 개발 환경에서는 localhost:4001을 기본값으로 사용
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const defaultFrontendUrl = isDevelopment ? 'http://localhost:4001' : 'http://localhost:4000';
    let errorFrontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN;
    if (!errorFrontendUrl) {
      const requestHost = req.get('host');
      const protocol = req.protocol || (req.secure ? 'https' : 'http');
      
      if (requestHost) {
        // 개발 환경이고 백엔드 호스트인 경우 프론트엔드 포트로 변경
        if (isDevelopment && requestHost.includes(':4000')) {
          errorFrontendUrl = 'http://localhost:4001';
        } else {
          errorFrontendUrl = `${protocol}://${requestHost}`;
        }
        console.warn('[OAuth Callback] Error handler - Using request host as fallback:', errorFrontendUrl);
      } else {
        const requestOrigin = req.get('origin') || req.get('referer');
        if (requestOrigin) {
          try {
            const url = new URL(requestOrigin);
            errorFrontendUrl = `${url.protocol}//${url.host}`;
            console.warn('[OAuth Callback] Error handler - Using request origin/referer as fallback:', errorFrontendUrl);
          } catch (e) {
            console.error('[OAuth Callback] Error handler - Failed to parse origin/referer:', requestOrigin);
            errorFrontendUrl = defaultFrontendUrl;
          }
        } else {
          errorFrontendUrl = defaultFrontendUrl;
        }
      }
    }
    console.log('[OAuth Callback] Error handler - Frontend URL:', {
      FRONTEND_URL: process.env.FRONTEND_URL,
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      errorFrontendUrl,
      requestHost: req.get('host'),
      requestProtocol: req.protocol,
      requestSecure: req.secure,
      requestOrigin: req.get('origin'),
      requestReferer: req.get('referer'),
    });
    res.redirect(`${errorFrontendUrl}/login?error=authentication_failed`);
  }
});

/**
 * Google ID 토큰 검증 및 사용자 인증
 * POST /api/auth/google
 */
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Google ID 토큰 검증
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // 사용자 정보 추출
    const userEmail = email;
    const userName = name || email.split('@')[0];
    const userPicture = picture || null;

    // 슈퍼 관리자 여부 확인
    const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL;

    // DB에서 사용자 조회 또는 생성
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userEmail },
          { googleId: googleId },
        ],
      },
      include: {
        agency: true,
      },
    });

    if (user) {
      // 기존 사용자 업데이트 (이름은 업데이트하지 않음)
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleId,
          picture: userPicture,
          email: userEmail,
          lastLogin: new Date(),
          ...(isSuperAdmin ? { role: 'super_admin' } : {}),
        },
        include: {
          agency: true,
        },
      });
    } else {
      // 새 사용자 생성
      // username은 email의 @ 앞부분 사용
      const username = email.split('@')[0];
      let uniqueUsername = username;
      let counter = 1;

      // username이 이미 존재하면 숫자 추가
      while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
        uniqueUsername = `${username}${counter}`;
        counter++;
      }

      user = await prisma.user.create({
        data: {
          username: uniqueUsername,
          name: userName,
          email: userEmail,
          googleId: googleId,
          picture: userPicture,
          role: isSuperAdmin ? 'super_admin' : 'agency_member', // 기본 역할
          status: 'pending', // 기본 상태는 승인 대기
          joinDate: new Date(),
          lastLogin: new Date(),
        },
        include: {
          agency: true,
        },
      });
    }

    // 사용자 정보 반환 (비밀번호 등 민감 정보 제외)
    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        picture: user.picture,
        realName: user.realName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        agencyId: user.agencyId,
        agency: user.agency,
        joinDate: user.joinDate,
        lastLogin: user.lastLogin,
      },
      idToken, // 클라이언트에서 사용할 수 있도록 토큰 반환
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 토큰 검증 및 사용자 정보 조회
 * GET /api/auth/me
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const idToken = authHeader.substring(7);

    // Google ID 토큰 검증
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { sub: googleId } = payload;

    // DB에서 사용자 조회
    const user = await prisma.user.findUnique({
      where: { googleId: googleId },
      include: {
        agency: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 사용자 정보 반환
    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        status: user.status,
        agencyId: user.agencyId,
        agency: user.agency,
        joinDate: user.joinDate,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      error: 'Invalid token',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

