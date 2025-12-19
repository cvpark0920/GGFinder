import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireRole } from '../middleware/auth';
import { uploadImages, deleteFile, getFilePathFromUrl } from '../middleware/upload';
import path from 'path';

const router = Router();

// 모든 클라이언트 관리 엔드포인트는 관리자 권한 필요
const adminOnly = [authenticateToken, requireRole('super_admin', 'platform_admin')];

/**
 * 프론트엔드 status를 DB status로 변환
 */
function mapStatusToDb(status: string): 'registered' | 'matching' | 'meeting_scheduled' | 'document_prep' | 'waiting' | 'in_progress' {
  const statusMap: Record<string, 'registered' | 'matching' | 'meeting_scheduled' | 'document_prep' | 'waiting' | 'in_progress'> = {
    '등록 완료': 'registered',
    '매칭 중': 'matching',
    '만남 예정': 'meeting_scheduled',
    '서류 준비': 'document_prep',
    '대기 중': 'waiting',
    '진행 중': 'in_progress',
  };
  return statusMap[status] || 'registered';
}

/**
 * DB status를 프론트엔드 status로 변환
 */
function mapStatusFromDb(status: 'registered' | 'matching' | 'meeting_scheduled' | 'document_prep' | 'waiting' | 'in_progress'): string {
  const statusMap: Record<string, string> = {
    'registered': '등록 완료',
    'matching': '매칭 중',
    'meeting_scheduled': '만남 예정',
    'document_prep': '서류 준비',
    'waiting': '대기 중',
    'in_progress': '진행 중',
  };
  return statusMap[status] || '등록 완료';
}

/**
 * 출생년도로부터 나이 계산
 */
function calculateAge(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

/**
 * 상대 경로를 절대 URL로 변환
 */
function getAbsoluteUrl(relativePath: string): string {
  if (!relativePath) return '';
  // 이미 절대 URL인 경우 그대로 반환
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  // 상대 경로인 경우 API_BASE_URL과 결합
  const apiBaseUrl = process.env.API_BASE_URL || process.env.FRONTEND_URL?.replace(':4001', ':4000') || 'http://localhost:4000';
  return `${apiBaseUrl}${relativePath.startsWith('/') ? relativePath : '/' + relativePath}`;
}

/**
 * Prisma Client 모델을 프론트엔드 Client 타입으로 변환
 */
export function mapClientToFrontend(client: any) {
  if (!client) return null;

  try {
    const mappedImages = client.images?.map((img: any) => {
      if (!img || !img.url) return '';
      const imagePath = img.url.startsWith('/uploads/') ? img.url : `/uploads/images/${path.basename(img.url)}`;
      const absoluteUrl = getAbsoluteUrl(imagePath);
      return absoluteUrl;
    }).filter((url: string) => url !== '') || [];
    
    const mappedVideo = client.video && client.video.url ? (() => {
      const videoPath = client.video.url.startsWith('/uploads/') ? client.video.url : `/uploads/videos/${path.basename(client.video.url)}`;
      const absoluteUrl = getAbsoluteUrl(videoPath);
      return absoluteUrl;
    })() : undefined;
    
    // 나이 계산
    const age = client.birthYear ? calculateAge(client.birthYear) : 0;
    
    // 아바타 URL 매핑
    const mappedAvatarUrl = client.avatarUrl ? (() => {
      const avatarPath = client.avatarUrl.startsWith('/uploads/') ? client.avatarUrl : `/uploads/avatars/${path.basename(client.avatarUrl)}`;
      return getAbsoluteUrl(avatarPath);
    })() : undefined;
    
    // Date 처리 안전하게
    let dateStr = new Date().toISOString().split('T')[0];
    if (client.date) {
      if (typeof client.date === 'string') {
        dateStr = client.date.split('T')[0];
      } else if (client.date instanceof Date) {
        dateStr = client.date.toISOString().split('T')[0];
      }
    }

    const result = {
      id: client.id,
      name: client.name || 'Unknown',
      age: age,
      loc: client.loc || '',
      status: mapStatusFromDb(client.status),
      date: dateStr,
      type: client.type,
      education: client.education || undefined,
      height: client.height || undefined,
      weight: client.weight || undefined,
      family: client.family || undefined,
      marriage: client.marriage || undefined,
      job: client.job || undefined,
      tattoo: client.tattoo || undefined,
      income: client.income || undefined,
      smoking: client.smoking || undefined,
      drinking: client.drinking || undefined,
      idealType: client.idealType || undefined,
      memo: client.memo || undefined,
      agencyId: client.agencyId || undefined,
      images: mappedImages,
      video: mappedVideo,
      avatarUrl: mappedAvatarUrl,
      birthYear: client.birthYear,
      hasMarriedBefore: client.hasMarriedBefore || false,
      exHusbandNationality: client.exHusbandNationality || undefined,
      children: client.children || undefined,
      addressRegistration: client.addressRegistration || undefined,
      currentAddress: client.currentAddress || undefined,
      monthlyIncome: client.monthlyIncome || undefined,
      siblings: client.siblings || undefined,
      relativesOverseas: client.relativesOverseas || undefined,
      fatherAge: client.fatherAge !== null && client.fatherAge !== undefined ? client.fatherAge.toString() : undefined,
      motherAge: client.motherAge !== null && client.motherAge !== undefined ? client.motherAge.toString() : undefined,
      parentsPhone: client.parentsPhone || undefined,
      phone: client.phone || undefined,
      healthIssues: client.healthIssues || undefined,
      desiredDestination: client.desiredDestination || undefined,
      guarantee: client.guarantee || false,
      residence: client.residence || undefined,
      hobbies: client.hobbies || undefined,
      parentalSupport: client.parentalSupport || undefined,
      features: client.features || undefined,
      religion: client.religion || undefined,
    };
    
    return result;
  } catch (e) {
    console.error('[Client Mapping Error] Failed to map client:', client?.id, e);
    // 최소한의 데이터라도 반환 시도
    return {
      id: client?.id,
      name: client?.name || 'Error',
      status: '등록 완료',
      date: new Date().toISOString().split('T')[0],
      type: client?.type || 'groom',
      images: [],
      error: 'Data mapping error'
    };
  }
}

/**
 * 클라이언트 목록 조회
 * GET /api/clients?type=groom|bride
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    // 관리자가 아닌 경우 소속사 회원인지 확인
    const isAdmin = req.user.role === 'super_admin' || req.user.role === 'platform_admin';
    let user: any = null;
    
    if (!isAdmin) {
      // 소속사 회원인지 확인
      user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { agency: true },
      });

      if (!user || !user.agencyId || !user.agency) {
        return res.status(403).json({ error: '소속사 회원만 접근할 수 있습니다.' });
      }
    }

    const { type, ownAgency } = req.query;

    const where: any = {};
    if (type === 'groom' || type === 'bride') {
      where.type = type;
    }

    // 관리자가 아닌 경우: 소속사 회원은 자신의 소속사가 아닌 반대 타입의 프로필만 조회 가능
    // 단, ownAgency=true인 경우 자신의 소속사 프로필 조회 허용 (찜하기 시 프로필 선택용)
    if (!isAdmin && user && ownAgency !== 'true') {
      // 신랑소속사 회원은 신부 프로필만, 신부소속사 회원은 신랑 프로필만 조회 가능
      if (user.agency.role === 'groom' && type !== 'bride') {
        return res.status(403).json({ error: '신랑소속사 회원은 신부 프로필만 조회할 수 있습니다.' });
      }
      if (user.agency.role === 'bride' && type !== 'groom') {
        return res.status(403).json({ error: '신부소속사 회원은 신랑 프로필만 조회할 수 있습니다.' });
      }
    }

    // ownAgency=true인 경우 자신의 소속사 프로필만 필터링
    if (ownAgency === 'true' && user.agencyId) {
      where.agencyId = user.agencyId;
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        video: true,
        agency: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json({
      clients: clients.map(mapClientToFrontend),
    });
  } catch (error: any) {
    console.error('Clients fetch error:', error);
    // Prisma 에러 상세 로깅
    if (error.code) {
      console.error('Prisma Error Code:', error.code);
      console.error('Prisma Error Message:', error.message);
      console.error('Prisma Error Meta:', error.meta);
    }
    
    res.status(500).json({
      error: '클라이언트 목록 조회에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error.code || 'UNKNOWN', // 프론트엔드에서 디버깅용으로 확인 가능하도록 추가
    });
  }
});

/**
 * 특정 클라이언트 조회
 * GET /api/clients/:id
 */
router.get('/:id', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ error: '유효하지 않은 클라이언트 ID입니다.' });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
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

    if (!client) {
      return res.status(404).json({ error: '클라이언트를 찾을 수 없습니다.' });
    }

    res.json({
      client: mapClientToFrontend(client),
    });
  } catch (error) {
    console.error('Client fetch error:', error);
    res.status(500).json({
      error: '클라이언트 조회에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 클라이언트 생성
 * POST /api/clients
 */
router.post('/', ...adminOnly, uploadImages, async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    // 디버깅: 요청 본문 확인
    console.log('Request body:', req.body);
    console.log('Request files:', files);
    const {
      name,
      loc,
      status,
      type,
      education,
      height,
      weight,
      family,
      marriage,
      job,
      tattoo,
      income,
      smoking,
      drinking,
      idealType,
      memo,
      agencyId,
      // 출생 정보 (신랑/신부 공통)
      birthYear,
      // 신랑 전용 필드
      residence,
      hobbies,
      parentalSupport,
      features,
      religion,
      // 신부 전용 필드
      hasMarriedBefore,
      exHusbandNationality,
      children,
      addressRegistration,
      currentAddress,
      monthlyIncome,
      siblings,
      relativesOverseas,
      fatherAge,
      motherAge,
      parentsPhone,
      phone,
      healthIssues,
      desiredDestination,
      guarantee,
    } = req.body;

    // 필수 필드 검증
    if (!name || !loc || !type || !birthYear) {
      return res.status(400).json({ error: '이름, 지역, 타입, 출생년도는 필수 항목입니다.' });
    }

    // type 검증
    if (type !== 'groom' && type !== 'bride') {
      return res.status(400).json({ error: '유효하지 않은 타입입니다. (groom 또는 bride)' });
    }

    // 출생년도 검증
    const birthYearNum = parseInt(birthYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(birthYearNum) || birthYearNum < 1900 || birthYearNum > currentYear) {
      return res.status(400).json({ error: `출생년도는 1900년부터 ${currentYear}년 사이여야 합니다.` });
    }

    // agencyId 유효성 검사
    let agencyIdNum: number | null = null;
    if (agencyId) {
      agencyIdNum = parseInt(agencyId);
      const agency = await prisma.agency.findUnique({
        where: { id: agencyIdNum },
      });
      if (!agency) {
        return res.status(400).json({ error: '존재하지 않는 소속사입니다.' });
      }
    }

    // 신장/몸무게 처리 (숫자로 저장)
    const heightNum = height ? (typeof height === 'string' ? parseInt(height.replace(/[^0-9]/g, '')) : (typeof height === 'number' ? height : parseInt(String(height)))) : null;
    const weightNum = weight ? (typeof weight === 'string' ? parseInt(weight.replace(/[^0-9]/g, '')) : (typeof weight === 'number' ? weight : parseInt(String(weight)))) : null;
    
    // 부모님 나이 처리 (숫자로 저장)
    const fatherAgeNum = fatherAge ? (typeof fatherAge === 'string' ? parseInt(fatherAge.replace(/[^0-9]/g, '')) : parseInt(String(fatherAge))) : null;
    const motherAgeNum = motherAge ? (typeof motherAge === 'string' ? parseInt(motherAge.replace(/[^0-9]/g, '')) : parseInt(String(motherAge))) : null;

    const createData = {
        name: name.trim(),
        loc: loc.trim(),
        status: status ? mapStatusToDb(status) : 'registered',
        type,
        education: education?.trim() || null,
        height: heightNum || null,
        weight: weightNum || null,
        family: family?.trim() || null,
        marriage: marriage?.trim() || null,
        job: job?.trim() || null,
        tattoo: tattoo?.trim() || null,
        income: income?.trim() || null,
        smoking: smoking?.trim() || null,
        drinking: drinking?.trim() || null,
        idealType: idealType?.trim() || null,
        memo: memo?.trim() || null,
        agencyId: agencyIdNum,
        birthYear: birthYearNum,
        residence: type === 'groom' ? residence?.trim() || null : null,
        hobbies: type === 'groom' ? hobbies?.trim() || null : null,
        parentalSupport: type === 'groom' ? parentalSupport?.trim() || null : null,
        features: type === 'groom' ? features?.trim() || null : null,
        religion: type === 'groom' ? religion?.trim() || null : null,
        hasMarriedBefore: type === 'bride' && hasMarriedBefore === 'true' ? true : (type === 'bride' ? false : null),
        exHusbandNationality: type === 'bride' ? exHusbandNationality?.trim() || null : null,
        children: type === 'bride' ? children?.trim() || null : null,
        addressRegistration: type === 'bride' ? addressRegistration?.trim() || null : null,
        currentAddress: type === 'bride' ? currentAddress?.trim() || null : null,
        monthlyIncome: type === 'bride' ? monthlyIncome?.trim() || null : null,
        siblings: type === 'bride' ? siblings?.trim() || null : null,
        relativesOverseas: type === 'bride' ? relativesOverseas?.trim() || null : null,
        fatherAge: type === 'bride' ? fatherAgeNum : null,
        motherAge: type === 'bride' ? motherAgeNum : null,
        parentsPhone: type === 'bride' ? parentsPhone?.trim() || null : null,
        phone: type === 'bride' ? phone?.trim() || null : null,
        healthIssues: type === 'bride' ? healthIssues?.trim() || null : null,
        desiredDestination: type === 'bride' ? desiredDestination?.trim() || null : null,
        guarantee: type === 'bride' && guarantee === 'true' ? true : (type === 'bride' ? false : null),
        avatarUrl: files.avatar && files.avatar.length > 0 ? `/uploads/avatars/${files.avatar[0].filename}` : null,
      };

    // 클라이언트 생성
    const client = await prisma.client.create({
      data: createData,
    });

    // 이미지 저장
    if (files.images && files.images.length > 0) {
      await Promise.all(
        files.images.map((file, index) =>
          prisma.clientImage.create({
            data: {
              clientId: client.id,
              url: `/uploads/images/${file.filename}`,
              order: index,
            },
          })
        )
      );
    }

    // 비디오 저장
    if (files.video && files.video.length > 0) {
      await prisma.clientVideo.create({
        data: {
          clientId: client.id,
          url: `/uploads/videos/${files.video[0].filename}`,
        },
      });
    }

    // 생성된 클라이언트 조회 (이미지/비디오 포함)
    const createdClient = await prisma.client.findUnique({
      where: { id: client.id },
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

    res.status(201).json({
      client: mapClientToFrontend(createdClient!),
    });
  } catch (error) {
    console.error('Client creation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Request body:', req.body);
    console.error('Request files:', req.files);
    res.status(500).json({
      error: '클라이언트 생성에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined,
    });
  }
});

/**
 * 클라이언트 수정
 * PATCH /api/clients/:id
 */
router.patch('/:id', ...adminOnly, uploadImages, async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ error: '유효하지 않은 클라이언트 ID입니다.' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        images: true,
        video: true,
      },
    });

    if (!existingClient) {
      return res.status(404).json({ error: '클라이언트를 찾을 수 없습니다.' });
    }

    const {
      name,
      loc,
      status,
      education,
      height,
      weight,
      family,
      marriage,
      job,
      tattoo,
      income,
      smoking,
      drinking,
      idealType,
      memo,
      agencyId,
      // 출생 정보 (신랑/신부 공통)
      birthYear,
      // 신랑 전용 필드
      residence,
      hobbies,
      parentalSupport,
      features,
      religion,
      // 신부 전용 필드
      hasMarriedBefore,
      exHusbandNationality,
      children,
      addressRegistration,
      currentAddress,
      monthlyIncome,
      siblings,
      relativesOverseas,
      fatherAge,
      motherAge,
      parentsPhone,
      phone,
      healthIssues,
      desiredDestination,
      guarantee,
    } = req.body;

    // 출생년도 검증 (업데이트 시)
    if (birthYear !== undefined) {
      const birthYearNum = typeof birthYear === 'number' ? birthYear : parseInt(String(birthYear));
      const currentYear = new Date().getFullYear();
      if (isNaN(birthYearNum) || birthYearNum < 1900 || birthYearNum > currentYear) {
        return res.status(400).json({ error: `출생년도는 1900년부터 ${currentYear}년 사이여야 합니다.` });
      }
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (loc !== undefined) updateData.loc = loc.trim();
    if (status !== undefined) updateData.status = mapStatusToDb(status);
    if (education !== undefined) updateData.education = education?.trim() || null;
    
    // 신장/몸무게 처리 (숫자로 저장)
    if (height !== undefined) {
      const heightNum = height ? (typeof height === 'string' ? parseInt(height.replace(/[^0-9]/g, '')) : (typeof height === 'number' ? height : parseInt(String(height)))) : null;
      updateData.height = heightNum;
    }
    if (weight !== undefined) {
      const weightNum = weight ? (typeof weight === 'string' ? parseInt(weight.replace(/[^0-9]/g, '')) : (typeof weight === 'number' ? weight : parseInt(String(weight)))) : null;
      updateData.weight = weightNum;
    }
    
    if (family !== undefined) updateData.family = family?.trim() || null;
    if (marriage !== undefined) updateData.marriage = marriage?.trim() || null;
    if (job !== undefined) updateData.job = job?.trim() || null;
    if (tattoo !== undefined) updateData.tattoo = tattoo?.trim() || null;
    if (income !== undefined) {
      updateData.income = typeof income === 'string' ? income.trim() : String(income);
    }
    if (smoking !== undefined) updateData.smoking = smoking?.trim() || null;
    if (drinking !== undefined) updateData.drinking = drinking?.trim() || null;
    if (idealType !== undefined) updateData.idealType = idealType?.trim() || null;
    if (memo !== undefined) updateData.memo = memo?.trim() || null;

    // 출생 정보 (신랑/신부 공통)
    if (birthYear !== undefined) {
      const birthYearNum = typeof birthYear === 'number' ? birthYear : parseInt(String(birthYear));
      updateData.birthYear = birthYearNum;
    }

    // agencyId 처리
    if (agencyId !== undefined) {
      if (agencyId === null || agencyId === '') {
        updateData.agencyId = null;
      } else {
        const agencyIdNum = parseInt(agencyId);
        const agency = await prisma.agency.findUnique({
          where: { id: agencyIdNum },
        });
        if (!agency) {
          return res.status(400).json({ error: '존재하지 않는 소속사입니다.' });
        }
        updateData.agencyId = agencyIdNum;
      }
    }

    // 신랑 전용 필드
    if (existingClient.type === 'groom') {
      if (residence !== undefined) updateData.residence = residence?.trim() || null;
      if (hobbies !== undefined) updateData.hobbies = hobbies?.trim() || null;
      if (parentalSupport !== undefined) updateData.parentalSupport = parentalSupport?.trim() || null;
      if (features !== undefined) updateData.features = features?.trim() || null;
      if (religion !== undefined) updateData.religion = religion?.trim() || null;
    }

    // 신부 전용 필드
    if (existingClient.type === 'bride') {
      if (hasMarriedBefore !== undefined) updateData.hasMarriedBefore = hasMarriedBefore === 'true' || hasMarriedBefore === true;
      if (exHusbandNationality !== undefined) updateData.exHusbandNationality = exHusbandNationality?.trim() || null;
      if (children !== undefined) updateData.children = children?.trim() || null;
      if (addressRegistration !== undefined) updateData.addressRegistration = addressRegistration?.trim() || null;
      if (currentAddress !== undefined) updateData.currentAddress = currentAddress?.trim() || null;
      if (monthlyIncome !== undefined) updateData.monthlyIncome = monthlyIncome?.trim() || null;
      if (siblings !== undefined) updateData.siblings = siblings?.trim() || null;
      if (relativesOverseas !== undefined) updateData.relativesOverseas = relativesOverseas?.trim() || null;
      // 부모님 나이 처리 (숫자로 저장)
      if (fatherAge !== undefined) {
        const fatherAgeNum = fatherAge ? (typeof fatherAge === 'string' ? parseInt(fatherAge.replace(/[^0-9]/g, '')) : parseInt(String(fatherAge))) : null;
        updateData.fatherAge = fatherAgeNum;
      }
      if (motherAge !== undefined) {
        const motherAgeNum = motherAge ? (typeof motherAge === 'string' ? parseInt(motherAge.replace(/[^0-9]/g, '')) : parseInt(String(motherAge))) : null;
        updateData.motherAge = motherAgeNum;
      }
      if (parentsPhone !== undefined) updateData.parentsPhone = parentsPhone?.trim() || null;
      if (phone !== undefined) updateData.phone = phone?.trim() || null;
      if (healthIssues !== undefined) updateData.healthIssues = healthIssues?.trim() || null;
      if (desiredDestination !== undefined) updateData.desiredDestination = desiredDestination?.trim() || null;
      if (guarantee !== undefined) updateData.guarantee = guarantee === 'true' || guarantee === true;
    }

    // 아바타 업데이트 처리
    if (files.avatar && files.avatar.length > 0) {
      // 기존 아바타 파일 삭제
      if (existingClient.avatarUrl) {
        const filePath = getFilePathFromUrl(existingClient.avatarUrl);
        if (filePath) deleteFile(filePath);
      }
      updateData.avatarUrl = `/uploads/avatars/${files.avatar[0].filename}`;
    }

    // 클라이언트 업데이트
    try {
      await prisma.client.update({
        where: { id: clientId },
        data: updateData,
      });
    } catch (prismaError) {
      throw prismaError;
    }

    // 기존 이미지 삭제 (새 이미지가 업로드된 경우)
    if (files.images && files.images.length > 0) {
      // 기존 이미지 파일 삭제
      for (const image of existingClient.images) {
        const filePath = getFilePathFromUrl(image.url);
        if (filePath) deleteFile(filePath);
      }

      // 기존 이미지 레코드 삭제
      await prisma.clientImage.deleteMany({
        where: { clientId },
      });

      // 새 이미지 저장
      await Promise.all(
        files.images.map((file, index) =>
          prisma.clientImage.create({
            data: {
              clientId,
              url: `/uploads/images/${file.filename}`,
              order: index,
            },
          })
        )
      );
    }

    // 기존 비디오 삭제 (새 비디오가 업로드된 경우)
    if (files.video && files.video.length > 0) {
      // 기존 비디오 파일 삭제
      if (existingClient.video) {
        const filePath = getFilePathFromUrl(existingClient.video.url);
        if (filePath) deleteFile(filePath);
        await prisma.clientVideo.delete({
          where: { clientId },
        });
      }

      // 새 비디오 저장
      await prisma.clientVideo.create({
        data: {
          clientId,
          url: `/uploads/videos/${files.video[0].filename}`,
        },
      });
    }

    // 업데이트된 클라이언트 조회
    const updatedClient = await prisma.client.findUnique({
      where: { id: clientId },
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

    res.json({
      client: mapClientToFrontend(updatedClient!),
    });
  } catch (error) {
    console.error('Client update error:', error);
    res.status(500).json({
      error: '클라이언트 수정에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 클라이언트 삭제
 * DELETE /api/clients/:id
 */
router.delete('/:id', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ error: '유효하지 않은 클라이언트 ID입니다.' });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        images: true,
        video: true,
      },
    });

    if (!client) {
      return res.status(404).json({ error: '클라이언트를 찾을 수 없습니다.' });
    }

    // 이미지 파일 삭제
    for (const image of client.images) {
      const filePath = getFilePathFromUrl(image.url);
      if (filePath) deleteFile(filePath);
    }

    // 비디오 파일 삭제
    if (client.video) {
      const filePath = getFilePathFromUrl(client.video.url);
      if (filePath) deleteFile(filePath);
    }

    // 클라이언트 삭제 (CASCADE로 이미지/비디오 레코드도 자동 삭제됨)
    await prisma.client.delete({
      where: { id: clientId },
    });

    res.json({ message: '클라이언트가 삭제되었습니다.' });
  } catch (error) {
    console.error('Client deletion error:', error);
    res.status(500).json({
      error: '클라이언트 삭제에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 클라이언트 상태만 업데이트
 * PATCH /api/clients/:id/status
 */
router.patch('/:id/status', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ error: '유효하지 않은 클라이언트 ID입니다.' });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: '상태 값이 필요합니다.' });
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return res.status(404).json({ error: '클라이언트를 찾을 수 없습니다.' });
    }

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        status: mapStatusToDb(status),
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

    res.json({
      client: mapClientToFrontend(updatedClient),
    });
  } catch (error) {
    console.error('Client status update error:', error);
    res.status(500).json({
      error: '상태 업데이트에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

