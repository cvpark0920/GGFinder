import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// 모든 매칭 엔드포인트는 인증 필요
const requireAuth = [authenticateToken];
const adminOnly = [authenticateToken, requireRole('super_admin', 'platform_admin')];

/**
 * DB status를 프론트엔드 status로 변환
 */
function mapStatusFromDb(status: 'in_progress' | 'waiting' | 'completed' | 'on_hold' | 'cancelled'): string {
  const statusMap: Record<string, string> = {
    'in_progress': '진행 중',
    'waiting': '대기 중',
    'completed': '완료',
    'on_hold': '보류',
    'cancelled': '취소됨',
  };
  return statusMap[status] || '대기 중';
}

/**
 * 프론트엔드 status를 DB status로 변환
 */
function mapStatusToDb(status: string): 'in_progress' | 'waiting' | 'completed' | 'on_hold' | 'cancelled' {
  const statusMap: Record<string, 'in_progress' | 'waiting' | 'completed' | 'on_hold' | 'cancelled'> = {
    '진행 중': 'in_progress',
    '대기 중': 'waiting',
    '완료': 'completed',
    '보류': 'on_hold',
    '취소됨': 'cancelled',
  };
  return statusMap[status] || 'waiting';
}

/**
 * 매칭 목록 조회
 * GET /api/matches
 * 권한: 인증된 사용자 (관리자는 전체, 소속사 회원은 자신의 소속사 프로필 관련 매칭만)
 */
router.get('/', ...requireAuth, async (req: Request, res: Response) => {
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
    
    let matches;
    if (isAdmin) {
      // 관리자는 모든 매칭 조회
      matches = await prisma.match.findMany({
        include: {
          groom: {
            include: {
              agency: true,
            },
          },
          bride: {
            include: {
              agency: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
    } else if (user.agencyId) {
      // 소속사 회원은 자신의 소속사 프로필 관련 매칭만 조회
      const agencyClients = await prisma.client.findMany({
        where: { agencyId: user.agencyId },
        select: { id: true },
      });
      const clientIds = agencyClients.map(c => c.id);

      matches = await prisma.match.findMany({
        where: {
          OR: [
            { groomId: { in: clientIds } },
            { brideId: { in: clientIds } },
          ],
        },
        include: {
          groom: {
            include: {
              agency: true,
            },
          },
          bride: {
            include: {
              agency: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
    } else {
      return res.status(403).json({ error: '소속사 회원만 접근할 수 있습니다.' });
    }

    // 프론트엔드 형식으로 변환
    const formattedMatches = matches.map(match => ({
      id: match.id,
      groom: match.groom.name,
      bride: match.bride.name,
      groomId: match.groomId,
      brideId: match.brideId,
      status: mapStatusFromDb(match.status),
      stage: match.stage,
      progress: match.progress,
      nextStep: match.nextStep || '',
      date: match.date.toISOString().split('T')[0],
      startDate: match.startDate ? match.startDate.toISOString().split('T')[0] : undefined,
      memo: match.memo || undefined,
    }));

    res.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Matches fetch error:', error);
    res.status(500).json({
      error: '매칭 목록 조회에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 매칭 생성
 * POST /api/matches
 * 권한: 관리자만
 */
router.post('/', ...adminOnly, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const { groomId, brideId, stage, nextStep, startDate, memo, progress } = req.body;

    if (!groomId || !brideId) {
      return res.status(400).json({ error: '신랑 ID와 신부 ID가 필요합니다.' });
    }

    // 신랑과 신부 프로필 확인
    const groom = await prisma.client.findUnique({
      where: { id: parseInt(groomId) },
    });
    const bride = await prisma.client.findUnique({
      where: { id: parseInt(brideId) },
    });

    if (!groom || groom.type !== 'groom') {
      return res.status(404).json({ error: '신랑 프로필을 찾을 수 없습니다.' });
    }
    if (!bride || bride.type !== 'bride') {
      return res.status(404).json({ error: '신부 프로필을 찾을 수 없습니다.' });
    }

    // 중복 매칭 확인
    const existingMatch = await prisma.match.findFirst({
      where: {
        groomId: parseInt(groomId),
        brideId: parseInt(brideId),
        status: {
          in: ['in_progress', 'waiting'],
        },
      },
    });

    if (existingMatch) {
      return res.status(400).json({ error: '이미 진행 중이거나 대기 중인 매칭이 있습니다.' });
    }

    // 매칭 생성
    const match = await prisma.match.create({
      data: {
        groomId: parseInt(groomId),
        brideId: parseInt(brideId),
        status: 'in_progress',
        stage: stage || '서류 확인',
        progress: progress || 10,
        nextStep: nextStep || '화상 미팅',
        startDate: startDate ? new Date(startDate) : new Date(),
        memo: memo || null,
      },
      include: {
        groom: true,
        bride: true,
      },
    });

    // 클라이언트 상태 업데이트
    await prisma.client.update({
      where: { id: parseInt(groomId) },
      data: { status: 'matching' },
    });
    await prisma.client.update({
      where: { id: parseInt(brideId) },
      data: { status: 'matching' },
    });

    res.json({
      match: {
        id: match.id,
        groom: match.groom.name,
        bride: match.bride.name,
        groomId: match.groomId,
        brideId: match.brideId,
        status: mapStatusFromDb(match.status),
        stage: match.stage,
        progress: match.progress,
        nextStep: match.nextStep || '',
        date: match.date.toISOString().split('T')[0],
        startDate: match.startDate ? match.startDate.toISOString().split('T')[0] : undefined,
        memo: match.memo || undefined,
      },
    });
  } catch (error) {
    console.error('Match creation error:', error);
    res.status(500).json({
      error: '매칭 생성에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 매칭 수정
 * PATCH /api/matches/:id
 * 권한: 관리자만
 */
router.patch('/:id', ...adminOnly, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const matchId = parseInt(req.params.id);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: '유효하지 않은 매칭 ID입니다.' });
    }

    const { status, stage, progress, nextStep, memo } = req.body;

    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = mapStatusToDb(status);
    }
    if (stage !== undefined) updateData.stage = stage;
    if (progress !== undefined) updateData.progress = parseInt(progress);
    if (nextStep !== undefined) updateData.nextStep = nextStep;
    if (memo !== undefined) updateData.memo = memo;

    const match = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
      include: {
        groom: true,
        bride: true,
      },
    });

    res.json({
      match: {
        id: match.id,
        groom: match.groom.name,
        bride: match.bride.name,
        groomId: match.groomId,
        brideId: match.brideId,
        status: mapStatusFromDb(match.status),
        stage: match.stage,
        progress: match.progress,
        nextStep: match.nextStep || '',
        date: match.date.toISOString().split('T')[0],
        startDate: match.startDate ? match.startDate.toISOString().split('T')[0] : undefined,
        memo: match.memo || undefined,
      },
    });
  } catch (error) {
    console.error('Match update error:', error);
    res.status(500).json({
      error: '매칭 수정에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 매칭 삭제
 * DELETE /api/matches/:id
 * 권한: 관리자만
 */
router.delete('/:id', ...adminOnly, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const matchId = parseInt(req.params.id);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: '유효하지 않은 매칭 ID입니다.' });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ error: '매칭을 찾을 수 없습니다.' });
    }

    // 클라이언트 상태 복원
    await prisma.client.update({
      where: { id: match.groomId },
      data: { status: 'registered' },
    });
    await prisma.client.update({
      where: { id: match.brideId },
      data: { status: 'registered' },
    });

    // 매칭 삭제
    await prisma.match.delete({
      where: { id: matchId },
    });

    res.json({ message: '매칭이 삭제되었습니다.' });
  } catch (error) {
    console.error('Match deletion error:', error);
    res.status(500).json({
      error: '매칭 삭제에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

