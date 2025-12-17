import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// 모든 소속사 관리 엔드포인트는 관리자 권한 필요
const adminOnly = [authenticateToken, requireRole('super_admin', 'platform_admin')];

/**
 * 프론트엔드 status를 DB status로 변환
 */
function mapStatusToDb(status: string): 'active' | 'suspended' {
  return status === '활성' ? 'active' : 'suspended';
}

/**
 * DB status를 프론트엔드 status로 변환
 */
function mapStatusFromDb(status: 'active' | 'suspended'): string {
  return status === 'active' ? '활성' : '중지';
}

/**
 * 소속사 목록 조회
 * GET /api/agencies
 */
router.get('/', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const agencies = await prisma.agency.findMany({
      orderBy: {
        registrationDate: 'desc',
      },
    });

    // 소속사 정보 반환
    res.json({
      agencies: agencies.map((agency) => ({
        id: agency.id,
        name: agency.name,
        role: agency.role,
        contact: agency.contact,
        phone: agency.phone,
        address: agency.address,
        registrationDate: agency.registrationDate.toISOString().split('T')[0],
        status: mapStatusFromDb(agency.status),
        memo: agency.memo || '',
      })),
    });
  } catch (error) {
    console.error('Agency list error:', error);
    res.status(500).json({
      error: '소속사 목록 조회에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 특정 소속사 조회
 * GET /api/agencies/:id
 */
router.get('/:id', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const agencyId = parseInt(req.params.id);

    if (isNaN(agencyId)) {
      return res.status(400).json({ error: '유효하지 않은 소속사 ID입니다.' });
    }

    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      return res.status(404).json({ error: '소속사를 찾을 수 없습니다.' });
    }

    // 소속사 정보 반환
    res.json({
      agency: {
        id: agency.id,
        name: agency.name,
        role: agency.role,
        contact: agency.contact,
        phone: agency.phone,
        address: agency.address,
        registrationDate: agency.registrationDate.toISOString().split('T')[0],
        status: mapStatusFromDb(agency.status),
        memo: agency.memo || '',
      },
    });
  } catch (error) {
    console.error('Agency fetch error:', error);
    res.status(500).json({
      error: '소속사 조회에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 소속사 생성
 * POST /api/agencies
 */
router.post('/', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const { name, role, contact, phone, address, status, memo } = req.body;

    // 필수 필드 검증
    if (!name || !role || !contact || !phone || !address) {
      return res.status(400).json({ error: '소속사명, 역할, 담당자, 연락처, 주소는 필수 항목입니다.' });
    }

    // role 검증
    const validRoles = ['groom', 'bride'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: '유효하지 않은 역할입니다.' });
    }

    // status 검증 및 매핑
    const dbStatus = status ? mapStatusToDb(status) : 'active';

    // 소속사 생성
    const agency = await prisma.agency.create({
      data: {
        name: name.trim(),
        role,
        contact: contact.trim(),
        phone: phone.trim(),
        address: address.trim(),
        status: dbStatus,
        memo: memo?.trim() || null,
      },
    });

    // 소속사 정보 반환
    res.status(201).json({
      agency: {
        id: agency.id,
        name: agency.name,
        role: agency.role,
        contact: agency.contact,
        phone: agency.phone,
        address: agency.address,
        registrationDate: agency.registrationDate.toISOString().split('T')[0],
        status: mapStatusFromDb(agency.status),
        memo: agency.memo || '',
      },
    });
  } catch (error) {
    console.error('Agency creation error:', error);
    res.status(500).json({
      error: '소속사 생성에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 소속사 정보 업데이트
 * PATCH /api/agencies/:id
 */
router.patch('/:id', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const agencyId = parseInt(req.params.id);

    if (isNaN(agencyId)) {
      return res.status(400).json({ error: '유효하지 않은 소속사 ID입니다.' });
    }

    const { name, role, contact, phone, address, status, memo } = req.body;

    // 소속사 존재 확인
    const existingAgency = await prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!existingAgency) {
      return res.status(404).json({ error: '소속사를 찾을 수 없습니다.' });
    }

    // role 검증
    if (role) {
      const validRoles = ['groom', 'bride'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: '유효하지 않은 역할입니다.' });
      }
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (role !== undefined) updateData.role = role;
    if (contact !== undefined) updateData.contact = contact.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (status !== undefined) updateData.status = mapStatusToDb(status);
    if (memo !== undefined) updateData.memo = memo?.trim() || null;

    // 소속사 업데이트
    const agency = await prisma.agency.update({
      where: { id: agencyId },
      data: updateData,
    });

    // 소속사 정보 반환
    res.json({
      agency: {
        id: agency.id,
        name: agency.name,
        role: agency.role,
        contact: agency.contact,
        phone: agency.phone,
        address: agency.address,
        registrationDate: agency.registrationDate.toISOString().split('T')[0],
        status: mapStatusFromDb(agency.status),
        memo: agency.memo || '',
      },
    });
  } catch (error) {
    console.error('Agency update error:', error);
    res.status(500).json({
      error: '소속사 정보 업데이트에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 소속사 삭제
 * DELETE /api/agencies/:id
 */
router.delete('/:id', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const agencyId = parseInt(req.params.id);

    if (isNaN(agencyId)) {
      return res.status(400).json({ error: '유효하지 않은 소속사 ID입니다.' });
    }

    // 소속사 존재 확인
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      return res.status(404).json({ error: '소속사를 찾을 수 없습니다.' });
    }

    // 소속사 삭제 (관련 User와 Client의 agencyId는 자동으로 null로 설정됨)
    await prisma.agency.delete({
      where: { id: agencyId },
    });

    res.json({ message: '소속사가 삭제되었습니다.' });
  } catch (error) {
    console.error('Agency deletion error:', error);
    res.status(500).json({
      error: '소속사 삭제에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

