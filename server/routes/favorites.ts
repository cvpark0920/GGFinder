import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken } from '../middleware/auth';
import { mapClientToFrontend } from './clients';

const router = Router();

// 모든 찜하기 엔드포인트는 인증 필요
const requireAuth = [authenticateToken];

/**
 * 현재 사용자의 찜 목록 조회
 * GET /api/favorites
 */
router.get('/', ...requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        client: {
          include: {
            images: {
              orderBy: {
                order: 'asc',
              },
            },
            video: true,
            agency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      favorites: favorites.map((fav) => ({
        id: fav.id,
        clientId: fav.clientId,
        createdAt: fav.createdAt.toISOString(),
        client: fav.client,
      })),
    });
  } catch (error: any) {
    console.error('Favorites fetch error:', error);
    // Prisma 에러 상세 로깅
    if (error.code) {
      console.error('Prisma Error Code:', error.code);
      console.error('Prisma Error Message:', error.message);
      console.error('Prisma Error Meta:', error.meta);
    }
    res.status(500).json({
      error: '찜 목록 조회에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error.code || 'UNKNOWN',
    });
  }
});

/**
 * 찜하기 추가
 * POST /api/favorites
 * 권한: 신랑소속사 회원만 신부 프로필 찜 가능
 */
router.post('/', ...requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const { clientId, fromClientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: '클라이언트 ID가 필요합니다.' });
    }

    if (!fromClientId) {
      return res.status(400).json({ error: '찜하는 프로필 ID가 필요합니다.' });
    }

    // 사용자 정보와 소속사 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { agency: true },
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 권한 검증: 소속사 회원만 찜하기 가능
    if (!user.agencyId || !user.agency) {
      return res.status(403).json({ error: '소속사 회원만 찜하기 기능을 사용할 수 있습니다.' });
    }

    // 찜받은 프로필 (toClientId) 확인
    const toClient = await prisma.client.findUnique({
      where: { id: parseInt(clientId) },
      include: { agency: true },
    });

    if (!toClient) {
      return res.status(404).json({ error: '찜받은 프로필을 찾을 수 없습니다.' });
    }

    // 찜하는 프로필 (fromClientId) 확인
    const fromClient = await prisma.client.findUnique({
      where: { id: parseInt(fromClientId) },
      include: { agency: true },
    });

    if (!fromClient) {
      return res.status(404).json({ error: '찜하는 프로필을 찾을 수 없습니다.' });
    }

    // fromClientId가 해당 소속사의 프로필인지 검증
    if (fromClient.agencyId !== user.agencyId) {
      return res.status(403).json({ error: '자신의 소속사 프로필만 선택할 수 있습니다.' });
    }

    // 방향 결정: user.agency.role과 toClient.type 조합으로 결정
    let direction: 'groom_to_bride' | 'bride_to_groom';
    if (user.agency.role === 'groom' && toClient.type === 'bride') {
      direction = 'groom_to_bride';
    } else if (user.agency.role === 'bride' && toClient.type === 'groom') {
      direction = 'bride_to_groom';
    } else {
      return res.status(403).json({ 
        error: user.agency.role === 'groom' 
          ? '신랑소속사 회원은 신부 프로필만 찜할 수 있습니다.' 
          : '신부소속사 회원은 신랑 프로필만 찜할 수 있습니다.' 
      });
    }

    // fromClient와 toClient의 타입이 올바른지 검증
    if (direction === 'groom_to_bride') {
      if (fromClient.type !== 'groom' || toClient.type !== 'bride') {
        return res.status(400).json({ error: '신랑 프로필이 신부 프로필을 찜해야 합니다.' });
      }
    } else if (direction === 'bride_to_groom') {
      if (fromClient.type !== 'bride' || toClient.type !== 'groom') {
        return res.status(400).json({ error: '신부 프로필이 신랑 프로필을 찜해야 합니다.' });
      }
    }

    // 같은 소속사 내 찜 방지
    if (toClient.agencyId === user.agencyId) {
      return res.status(403).json({ error: '같은 소속사 내에서는 찜할 수 없습니다.' });
    }

    // 이미 찜한 경우 확인 (같은 방향으로만 중복 방지)
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_clientId_direction: {
          userId: req.user.id,
          clientId: parseInt(clientId),
          direction: direction,
        },
      },
    });

    if (existingFavorite) {
      return res.status(400).json({ error: '이미 찜한 프로필입니다.' });
    }

    // 찜하기 추가
    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        clientId: parseInt(clientId),
        fromClientId: parseInt(fromClientId),
        direction: direction,
        status: 'pending',
      },
      include: {
        client: {
          include: {
            images: {
              orderBy: {
                order: 'asc',
              },
            },
            video: true,
            agency: true,
          },
        },
        fromClient: {
          include: {
            images: {
              orderBy: {
                order: 'asc',
              },
            },
            video: true,
            agency: true,
          },
        },
        user: {
          include: {
            agency: true,
          },
        },
      },
    });

    res.status(201).json({
      favorite: {
        id: favorite.id,
        clientId: favorite.clientId,
        status: favorite.status,
        createdAt: favorite.createdAt.toISOString(),
        updatedAt: favorite.updatedAt.toISOString(),
        client: favorite.client,
        user: favorite.user,
      },
    });
  } catch (error) {
    console.error('Favorite creation error:', error);
    res.status(500).json({
      error: '찜하기 추가에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 찜하기 제거
 * DELETE /api/favorites/:clientId
 */
router.delete('/:clientId', ...requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const clientId = parseInt(req.params.clientId);

    if (isNaN(clientId)) {
      return res.status(400).json({ error: '유효하지 않은 클라이언트 ID입니다.' });
    }

    // 사용자 정보와 소속사 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { agency: true },
    });

    if (!user || !user.agency) {
      return res.status(403).json({ error: '소속사 회원만 찜하기 기능을 사용할 수 있습니다.' });
    }

    // 클라이언트 정보 조회
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return res.status(404).json({ error: '클라이언트를 찾을 수 없습니다.' });
    }

    // 방향 결정: user.agency.role과 client.type 조합으로 결정
    let direction: 'groom_to_bride' | 'bride_to_groom';
    if (user.agency.role === 'groom' && client.type === 'bride') {
      direction = 'groom_to_bride';
    } else if (user.agency.role === 'bride' && client.type === 'groom') {
      direction = 'bride_to_groom';
    } else {
      return res.status(403).json({ 
        error: user.agency.role === 'groom' 
          ? '신랑소속사 회원은 신부 프로필만 찜할 수 있습니다.' 
          : '신부소속사 회원은 신랑 프로필만 찜할 수 있습니다.' 
      });
    }

    // 찜하기 존재 확인
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_clientId_direction: {
          userId: req.user.id,
          clientId,
          direction,
        },
      },
    });

    if (!favorite) {
      return res.status(404).json({ error: '찜한 프로필을 찾을 수 없습니다.' });
    }

    // 찜하기 제거
    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    res.json({ message: '찜하기가 제거되었습니다.' });
  } catch (error) {
    console.error('Favorite deletion error:', error);
    res.status(500).json({
      error: '찜하기 제거에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 특정 프로필 찜 여부 확인
 * GET /api/favorites/check/:clientId
 */
router.get('/check/:clientId', ...requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const clientId = parseInt(req.params.clientId);

    if (isNaN(clientId)) {
      return res.status(400).json({ error: '유효하지 않은 클라이언트 ID입니다.' });
    }

    // 사용자 정보와 소속사 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { agency: true },
    });

    if (!user || !user.agency) {
      return res.json({
        isFavorite: false,
        favoriteId: null,
      });
    }

    // 클라이언트 정보 조회
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return res.status(404).json({ error: '클라이언트를 찾을 수 없습니다.' });
    }

    // 방향 결정: user.agency.role과 client.type 조합으로 결정
    let direction: 'groom_to_bride' | 'bride_to_groom';
    if (user.agency.role === 'groom' && client.type === 'bride') {
      direction = 'groom_to_bride';
    } else if (user.agency.role === 'bride' && client.type === 'groom') {
      direction = 'bride_to_groom';
    } else {
      // 방향이 맞지 않으면 찜할 수 없으므로 false 반환
      return res.json({
        isFavorite: false,
        favoriteId: null,
      });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_clientId_direction: {
          userId: req.user.id,
          clientId,
          direction,
        },
      },
    });

    res.json({
      isFavorite: !!favorite,
      favoriteId: favorite?.id || null,
    });
  } catch (error) {
    console.error('Favorite check error:', error);
    res.status(500).json({
      error: '찜 여부 확인에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 특정 신부를 찜한 신랑 목록 조회
 * GET /api/favorites/received/:brideClientId
 * 권한: 신부소속사 회원만 자신의 소속사 신부의 찜받은 목록 조회 가능
 */
router.get('/received/:brideClientId', ...requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const brideClientId = parseInt(req.params.brideClientId);

    if (isNaN(brideClientId)) {
      return res.status(400).json({ error: '유효하지 않은 클라이언트 ID입니다.' });
    }

    // 사용자 정보와 소속사 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { agency: true },
    });

    if (!user || !user.agencyId || !user.agency) {
      return res.status(403).json({ error: '소속사 회원만 접근할 수 있습니다.' });
    }

    if (user.agency.role !== 'bride') {
      return res.status(403).json({ error: '신부소속사 회원만 접근할 수 있습니다.' });
    }

    // 신부 클라이언트 확인
    const brideClient = await prisma.client.findUnique({
      where: { id: brideClientId },
      include: { agency: true },
    });

    if (!brideClient) {
      return res.status(404).json({ error: '신부 프로필을 찾을 수 없습니다.' });
    }

    if (brideClient.type !== 'bride') {
      return res.status(400).json({ error: '신부 프로필이 아닙니다.' });
    }

    // 권한 검증: 자신의 소속사 신부인지 확인
    if (brideClient.agencyId !== user.agencyId) {
      return res.status(403).json({ error: '자신의 소속사 신부만 조회할 수 있습니다.' });
    }

    // 찜받은 목록 조회
    const favorites = await prisma.favorite.findMany({
      where: {
        clientId: brideClientId,
      },
      include: {
        user: {
          include: {
            agency: true,
          },
        },
        client: {
          include: {
            images: {
              orderBy: {
                order: 'asc',
              },
            },
            video: true,
            agency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      favorites: favorites.map((fav) => ({
        id: fav.id,
        clientId: fav.clientId,
        userId: fav.userId,
        status: fav.status,
        createdAt: fav.createdAt.toISOString(),
        updatedAt: fav.updatedAt.toISOString(),
        user: fav.user,
        client: fav.client,
      })),
    });
  } catch (error) {
    console.error('Received favorites fetch error:', error);
    res.status(500).json({
      error: '찜받은 목록 조회에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 소속사별 찜받은 목록 조회
 * GET /api/favorites/received-by-agency
 * 권한: 신부소속사 또는 신랑소속사 회원 접근 가능
 */
router.get('/received-by-agency', ...requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    // 사용자 정보와 소속사 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { agency: true },
    });

    if (!user || !user.agencyId || !user.agency) {
      return res.status(403).json({ error: '소속사 회원만 접근할 수 있습니다.' });
    }

    if (user.agency.role !== 'bride' && user.agency.role !== 'groom') {
      return res.status(403).json({ error: '소속사 회원만 접근할 수 있습니다.' });
    }

    const isBrideAgency = user.agency.role === 'bride';
    const direction = isBrideAgency ? 'groom_to_bride' : 'bride_to_groom';
    const profileType = isBrideAgency ? 'bride' : 'groom';

    // 소속사의 모든 프로필 조회 (신부 또는 신랑)
    const profiles = await prisma.client.findMany({
      where: {
        type: profileType,
        agencyId: user.agencyId,
      },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        video: true,
        agency: true,
      },
    });

    // 각 프로필별로 찜받은 목록 조회
    const profilesWithFavorites = await Promise.all(
      profiles.map(async (profile) => {
        const favorites = await prisma.favorite.findMany({
          where: {
            clientId: profile.id,
            direction: direction,
          },
          include: {
            user: {
              include: {
                agency: true,
              },
            },
            fromClient: {
              include: {
                images: {
                  orderBy: {
                    order: 'asc',
                  },
                },
                video: true,
                agency: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // 각 찜에 대해 상대방 프로필 정보 조회
        const favoritesWithOppositeProfiles = favorites.map((fav) => {
          return {
            id: fav.id,
            clientId: fav.clientId,
            userId: fav.userId,
            status: fav.status,
            createdAt: fav.createdAt.toISOString(),
            updatedAt: fav.updatedAt.toISOString(),
            user: fav.user,
            oppositeProfile: fav.fromClient ? mapClientToFrontend(fav.fromClient) : null,
          };
        });

        return {
          profile: {
            id: profile.id,
            name: profile.name,
            loc: profile.loc,
            status: profile.status,
            images: profile.images,
            video: profile.video,
            avatarUrl: profile.avatarUrl,
          },
          favorites: favoritesWithOppositeProfiles,
          totalCount: favorites.length,
          pendingCount: favorites.filter((f) => f.status === 'pending').length,
          acceptedCount: favorites.filter((f) => f.status === 'accepted').length,
          rejectedCount: favorites.filter((f) => f.status === 'rejected').length,
        };
      })
    );

    // 응답 구조는 기존과 호환성을 위해 'brides' 키 사용하되, 실제로는 프로필 타입에 따라 다름
    res.json({
      profiles: profilesWithFavorites,
      agencyRole: user.agency.role,
    });
  } catch (error: any) {
    console.error('Received favorites by agency fetch error:', error);
    // Prisma 에러 상세 로깅
    if (error.code) {
      console.error('Prisma Error Code:', error.code);
      console.error('Prisma Error Message:', error.message);
      console.error('Prisma Error Meta:', error.meta);
    }
    res.status(500).json({
      error: '찜받은 목록 조회에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error.code || 'UNKNOWN',
    });
  }
});

/**
 * 찜 상태 업데이트 (승인/거절)
 * PATCH /api/favorites/:favoriteId/status
 * 권한: 신부소속사 또는 신랑소속사 회원이 자신의 소속사 프로필의 찜 상태 변경 가능
 */
router.patch('/:favoriteId/status', ...requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const favoriteId = parseInt(req.params.favoriteId);
    const { status } = req.body;

    if (isNaN(favoriteId)) {
      return res.status(400).json({ error: '유효하지 않은 찜 ID입니다.' });
    }

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '유효하지 않은 상태입니다. (accepted 또는 rejected)' });
    }

    // 사용자 정보와 소속사 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { agency: true },
    });

    if (!user || !user.agencyId || !user.agency) {
      return res.status(403).json({ error: '소속사 회원만 접근할 수 있습니다.' });
    }

    if (user.agency.role !== 'bride' && user.agency.role !== 'groom') {
      return res.status(403).json({ error: '소속사 회원만 접근할 수 있습니다.' });
    }

    // 찜 정보 조회
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId },
      include: {
        client: {
          include: {
            agency: true,
          },
        },
      },
    });

    if (!favorite) {
      return res.status(404).json({ error: '찜 정보를 찾을 수 없습니다.' });
    }

    // 권한 검증: 자신의 소속사 프로필인지 확인
    if (favorite.client.agencyId !== user.agencyId) {
      return res.status(403).json({ error: '자신의 소속사 프로필의 찜만 변경할 수 있습니다.' });
    }

    // 방향 검증: user.agency.role과 favorite.client.type 조합이 올바른지 확인
    const expectedDirection = (user.agency.role === 'bride' && favorite.client.type === 'bride') 
      ? 'groom_to_bride' 
      : (user.agency.role === 'groom' && favorite.client.type === 'groom')
      ? 'bride_to_groom'
      : null;

    if (!expectedDirection || favorite.direction !== expectedDirection) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    // 상태 업데이트
    const updatedFavorite = await prisma.favorite.update({
      where: { id: favoriteId },
      data: {
        status: status as 'accepted' | 'rejected',
      },
      include: {
        user: {
          include: {
            agency: true,
          },
        },
        client: {
          include: {
            images: {
              orderBy: {
                order: 'asc',
              },
            },
            video: true,
            agency: true,
          },
        },
      },
    });

    res.json({
      favorite: {
        id: updatedFavorite.id,
        clientId: updatedFavorite.clientId,
        userId: updatedFavorite.userId,
        status: updatedFavorite.status,
        createdAt: updatedFavorite.createdAt.toISOString(),
        updatedAt: updatedFavorite.updatedAt.toISOString(),
        user: updatedFavorite.user,
        client: updatedFavorite.client,
      },
    });
  } catch (error) {
    console.error('Favorite status update error:', error);
    res.status(500).json({
      error: '찜 상태 업데이트에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 찜 통계 조회
 * GET /api/favorites/statistics
 * 권한: 인증된 사용자 (관리자는 전체, 소속사 회원은 자신의 소속사만)
 */
router.get('/statistics', ...requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    // 사용자 정보와 소속사 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { agency: true },
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const isAdmin = user.role === 'super_admin' || user.role === 'platform_admin';
    const userAgencyId = user.agencyId;

    // 전체 찜 수 조회 (방향별)
    const whereClause: any = {};
    if (!isAdmin && userAgencyId) {
      // 소속사 회원은 자신의 소속사 프로필과 관련된 찜만 조회
      // 자신의 소속사 프로필을 찜한 것 또는 자신의 소속사 회원이 찜한 것
      const agencyClients = await prisma.client.findMany({
        where: { agencyId: userAgencyId },
        select: { id: true },
      });
      const clientIds = agencyClients.map(c => c.id);
      
      const agencyUsers = await prisma.user.findMany({
        where: { agencyId: userAgencyId },
        select: { id: true },
      });
      const userIds = agencyUsers.map(u => u.id);
      
      whereClause.OR = [
        { clientId: { in: clientIds } }, // 자신의 소속사 프로필을 찜받은 것
        { userId: { in: userIds } }, // 자신의 소속사 회원이 찜한 것
      ];
    }

    const allFavorites = await prisma.favorite.findMany({
      where: whereClause,
    });

    const groomToBrideCount = allFavorites.filter(f => f.direction === 'groom_to_bride').length;
    const brideToGroomCount = allFavorites.filter(f => f.direction === 'bride_to_groom').length;

    // 상태별 통계
    const pendingCount = allFavorites.filter(f => f.status === 'pending').length;
    const acceptedCount = allFavorites.filter(f => f.status === 'accepted').length;
    const rejectedCount = allFavorites.filter(f => f.status === 'rejected').length;

    // 최근 활동 통계
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recent7Days = allFavorites.filter(f => f.createdAt >= last7Days).length;
    const recent30Days = allFavorites.filter(f => f.createdAt >= last30Days).length;

    // 소속사별 통계 (관리자만)
    let byAgency: Record<number, { name: string; count: number }> | undefined;
    if (isAdmin) {
      const agencies = await prisma.agency.findMany({
        select: { id: true, name: true },
      });

      byAgency = {};
      for (const agency of agencies) {
        const agencyClients = await prisma.client.findMany({
          where: { agencyId: agency.id },
          select: { id: true },
        });
        const agencyClientIds = agencyClients.map(c => c.id);
        
        const agencyFavorites = await prisma.favorite.findMany({
          where: {
            OR: [
              { clientId: { in: agencyClientIds } },
              { userId: { in: await prisma.user.findMany({ where: { agencyId: agency.id }, select: { id: true } }).then(users => users.map(u => u.id)) } },
            ],
          },
        });

        byAgency[agency.id] = {
          name: agency.name,
          count: agencyFavorites.length,
        };
      }
    }

    res.json({
      total: {
        all: allFavorites.length,
        groom_to_bride: groomToBrideCount,
        bride_to_groom: brideToGroomCount,
      },
      byStatus: {
        pending: pendingCount,
        accepted: acceptedCount,
        rejected: rejectedCount,
      },
      recent: {
        last7Days: recent7Days,
        last30Days: recent30Days,
      },
      ...(byAgency && { byAgency }),
    });
  } catch (error) {
    console.error('Favorite statistics fetch error:', error);
    res.status(500).json({
      error: '찜 통계 조회에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 찜을 통한 매칭 현황 조회
 * GET /api/favorites/matches-overview
 * 권한: 인증된 사용자
 */
router.get('/matches-overview', ...requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    // 사용자 정보와 소속사 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { agency: true },
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const isAdmin = user.role === 'super_admin' || user.role === 'platform_admin';
    
    // 관리자가 아닌 경우 소속사 정보 필요
    if (!isAdmin && (!user.agencyId || !user.agency)) {
      return res.status(403).json({ error: '소속사 회원만 접근할 수 있습니다.' });
    }

    // 관리자는 모든 프로필 조회, 소속사 회원은 자신의 소속사 프로필만 조회
    let profiles: any[] = [];
    let isBrideAgency = false;
    let direction: 'groom_to_bride' | 'bride_to_groom' = 'groom_to_bride';
    let profileType: 'groom' | 'bride' = 'groom';

    if (isAdmin) {
      // 관리자는 모든 프로필 조회 (신부와 신랑 모두)
      const brideProfiles = await prisma.client.findMany({
        where: { type: 'bride' },
        include: {
          images: { orderBy: { order: 'asc' } },
          video: true,
          agency: true,
        },
      });
      const groomProfiles = await prisma.client.findMany({
        where: { type: 'groom' },
        include: {
          images: { orderBy: { order: 'asc' } },
          video: true,
          agency: true,
        },
      });
      profiles = [...brideProfiles, ...groomProfiles];
    } else {
      // 소속사 회원은 자신의 소속사 프로필만 조회
      isBrideAgency = user.agency!.role === 'bride';
      direction = isBrideAgency ? 'groom_to_bride' : 'bride_to_groom';
      profileType = isBrideAgency ? 'bride' : 'groom';

      profiles = await prisma.client.findMany({
        where: {
          type: profileType,
          agencyId: user.agencyId!,
        },
        include: {
          images: {
            orderBy: {
              order: 'asc',
            },
          },
          video: true,
          agency: true,
        },
      });
    }

    // 각 프로필별로 찜받은 목록 조회
    const profilesWithFavorites = await Promise.all(
      profiles.map(async (profile) => {
        // 프로필 타입에 따라 direction 결정
        const profileDirection = profile.type === 'bride' ? 'groom_to_bride' : 'bride_to_groom';
        
        const favorites = await prisma.favorite.findMany({
          where: {
            clientId: profile.id,
            direction: profileDirection,
          },
          include: {
            user: {
              include: {
                agency: true,
              },
            },
            fromClient: {
              include: {
                images: {
                  orderBy: {
                    order: 'asc',
                  },
                },
                video: true,
                agency: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // 각 찜에 대해 상대방 프로필 정보 조회
        const favoritesWithOppositeProfiles = favorites.map((fav) => {
          return {
            id: fav.id,
            clientId: fav.clientId,
            userId: fav.userId,
            status: fav.status,
            createdAt: fav.createdAt.toISOString(),
            updatedAt: fav.updatedAt.toISOString(),
            user: fav.user,
            oppositeProfile: fav.fromClient ? mapClientToFrontend(fav.fromClient) : null,
          };
        });

        // 승인된 찜 중 매칭이 생성되었는지 확인
        const acceptedFavorites = favoritesWithOppositeProfiles.filter(f => f.status === 'accepted');
        let hasMatch = false;
        let matchId: number | undefined;

        for (const fav of acceptedFavorites) {
          if (fav.oppositeProfile) {
            const oppositeId = fav.oppositeProfile.id;
            // 프로필 타입에 따라 매칭 조회
            const groomId = profile.type === 'bride' ? oppositeId : profile.id;
            const brideId = profile.type === 'bride' ? profile.id : oppositeId;
            const match = await prisma.match.findFirst({
              where: {
                groomId: groomId,
                brideId: brideId,
              },
            });

            if (match) {
              hasMatch = true;
              matchId = match.id;
              break;
            }
          }
        }

        return {
          profile: {
            id: profile.id,
            name: profile.name,
            type: profile.type,
            agency: {
              id: profile.agency?.id,
              name: profile.agency?.name,
            },
            avatarUrl: profile.avatarUrl,
          },
          favorites: favoritesWithOppositeProfiles,
          hasMatch,
          matchId,
        };
      })
    );

    // 요약 통계
    const allAcceptedFavorites = profilesWithFavorites.flatMap(p => 
      p.favorites.filter(f => f.status === 'accepted')
    );
    const matchedCount = profilesWithFavorites.filter(p => p.hasMatch).length;
    const unmatchedCount = profilesWithFavorites.filter(p => !p.hasMatch && p.favorites.some(f => f.status === 'accepted')).length;

    res.json({
      profiles: profilesWithFavorites,
      summary: {
        totalAccepted: allAcceptedFavorites.length,
        matched: matchedCount,
        unmatched: unmatchedCount,
      },
    });
  } catch (error: any) {
    console.error('Favorite matches overview fetch error:', error);
    // Prisma 에러 상세 로깅
    if (error.code) {
      console.error('Prisma Error Code:', error.code);
      console.error('Prisma Error Message:', error.message);
      console.error('Prisma Error Meta:', error.meta);
    }
    res.status(500).json({
      error: '찜 매칭 현황 조회에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error.code || 'UNKNOWN',
    });
  }
});

export default router;

