import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// 모든 사용자 관리 엔드포인트는 관리자 권한 필요
const adminOnly = [authenticateToken, requireRole('super_admin', 'platform_admin')];

/**
 * 사용자 목록 조회
 * GET /api/users
 */
router.get('/', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        agency: true,
      },
      orderBy: {
        joinDate: 'desc',
      },
    });

    // 사용자 정보 반환 (비밀번호 등 민감 정보 제외)
    res.json({
      users: users.map((user) => ({
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
        joinDate: user.joinDate.toISOString().split('T')[0],
        lastLogin: user.lastLogin ? user.lastLogin.toISOString().split('T')[0] : '-',
      })),
    });
  } catch (error) {
    console.error('User list error:', error);
    res.status(500).json({
      error: '사용자 목록 조회에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 특정 사용자 조회
 * GET /api/users/:id
 */
router.get('/:id', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: '유효하지 않은 사용자 ID입니다.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        agency: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
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
        joinDate: user.joinDate.toISOString().split('T')[0],
        lastLogin: user.lastLogin ? user.lastLogin.toISOString().split('T')[0] : '-',
      },
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({
      error: '사용자 조회에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 사용자 생성
 * POST /api/users
 */
router.post('/', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const { username, name, email, role, status, agencyId } = req.body;

    // 필수 필드 검증
    if (!username || !name || !email) {
      return res.status(400).json({ error: '사용자명, 이름, 이메일은 필수 항목입니다.' });
    }

    // role 검증
    const validRoles = ['super_admin', 'platform_admin', 'agency_member'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: '유효하지 않은 역할입니다.' });
    }

    // agency_member인 경우 agencyId 필수
    if (role === 'agency_member' && !agencyId) {
      return res.status(400).json({ error: '소속사 회원은 소속사를 선택해야 합니다.' });
    }

    // username, email 중복 검사
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      const field = existingUser.username === username ? '사용자명' : '이메일';
      return res.status(409).json({ error: `${field}이(가) 이미 사용 중입니다.` });
    }

    // agencyId 유효성 검사
    if (agencyId) {
      const agency = await prisma.agency.findUnique({
        where: { id: parseInt(agencyId) },
      });
      if (!agency) {
        return res.status(400).json({ error: '존재하지 않는 소속사입니다.' });
      }
    }

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        name: name.trim(),
        email: email.trim(),
        role,
        status: status || 'pending',
        agencyId: agencyId ? parseInt(agencyId) : null,
      },
      include: {
        agency: true,
      },
    });

    // 사용자 정보 반환
    res.status(201).json({
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
        joinDate: user.joinDate.toISOString().split('T')[0],
        lastLogin: user.lastLogin ? user.lastLogin.toISOString().split('T')[0] : '-',
      },
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({
      error: '사용자 생성에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 사용자 정보 업데이트
 * PATCH /api/users/:id
 * - 관리자는 모든 필드 수정 가능
 * - 본인은 realName, phone만 수정 가능
 */
router.patch('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: '유효하지 않은 사용자 ID입니다.' });
    }

    const { username, name, email, realName, phone, role, status, agencyId } = req.body;

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 본인 정보 업데이트인지 확인
    const isSelfUpdate = req.user && req.user.id === userId;
    const isAdmin = req.user && (req.user.role === 'super_admin' || req.user.role === 'platform_admin');
    
    // 본인 정보 업데이트인 경우, realName과 phone만 수정 가능
    if (isSelfUpdate && !isAdmin) {
      const allowedFields = ['realName', 'phone'];
      const requestedFields = Object.keys(req.body);
      const hasRestrictedFields = requestedFields.some(field => !allowedFields.includes(field));
      
      if (hasRestrictedFields) {
        return res.status(403).json({ 
          error: '본인 정보는 실명과 전화번호만 수정할 수 있습니다.' 
        });
      }
    }
    
    // 관리자가 아닌 경우, 본인 정보만 수정 가능
    if (!isAdmin && !isSelfUpdate) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // username, email 중복 검사 (본인 제외)
    if (username || email) {
      const duplicateUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                ...(username ? [{ username }] : []),
                ...(email ? [{ email }] : []),
              ],
            },
          ],
        },
      });

      if (duplicateUser) {
        const field = duplicateUser.username === username ? '사용자명' : '이메일';
        return res.status(409).json({ error: `${field}이(가) 이미 사용 중입니다.` });
      }
    }

    // role 검증
    if (role) {
      const validRoles = ['super_admin', 'platform_admin', 'agency_member'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: '유효하지 않은 역할입니다.' });
      }

      // agency_member인 경우 agencyId 필수
      if (role === 'agency_member' && agencyId === null) {
        return res.status(400).json({ error: '소속사 회원은 소속사를 선택해야 합니다.' });
      }
    }

    // agencyId 유효성 검사
    if (agencyId !== undefined && agencyId !== null) {
      const agency = await prisma.agency.findUnique({
        where: { id: parseInt(agencyId) },
      });
      if (!agency) {
        return res.status(400).json({ error: '존재하지 않는 소속사입니다.' });
      }
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (username !== undefined) updateData.username = username.trim();
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (realName !== undefined) updateData.realName = realName?.trim() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    if (agencyId !== undefined) updateData.agencyId = agencyId ? parseInt(agencyId) : null;

    // 사용자 업데이트
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        agency: true,
      },
    });

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
        joinDate: user.joinDate.toISOString().split('T')[0],
        lastLogin: user.lastLogin ? user.lastLogin.toISOString().split('T')[0] : '-',
      },
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({
      error: '사용자 정보 업데이트에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 사용자 삭제
 * DELETE /api/users/:id
 */
router.delete('/:id', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: '유효하지 않은 사용자 ID입니다.' });
    }

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자 삭제
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: '사용자가 삭제되었습니다.' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({
      error: '사용자 삭제에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

