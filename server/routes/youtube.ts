import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// 모든 YouTube 엔드포인트는 관리자 권한 필요
const adminOnly = [authenticateToken, requireRole('super_admin', 'platform_admin')];

/**
 * 공개 유튜브 동영상 목록 조회 (인증 불필요)
 * GET /api/youtube/public
 * 활성화된 영상만 반환
 */
router.get('/public', async (req: Request, res: Response) => {
  try {
    const videos = await prisma.youTubeVideo.findMany({
      where: {
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // DB 모델을 프론트엔드 타입으로 변환
    const formattedVideos = videos.map((video) => ({
      id: video.id,
      title: video.title,
      url: video.url,
      videoId: video.videoId,
      description: video.description,
      status: video.status as 'active' | 'inactive',
      createdAt: video.createdAt.toISOString().split('T')[0],
    }));

    res.json({ videos: formattedVideos });
  } catch (error) {
    console.error('Failed to fetch public YouTube videos:', error);
    res.status(500).json({
      error: '동영상 목록을 불러오는데 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 유튜브 동영상 목록 조회
 * GET /api/youtube
 * 권한: 관리자만
 */
router.get('/', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status === 'active' || status === 'inactive') {
      where.status = status;
    }


    const videos = await prisma.youTubeVideo.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // DB 모델을 프론트엔드 타입으로 변환
    const formattedVideos = videos.map((video) => ({
      id: video.id,
      title: video.title,
      url: video.url,
      videoId: video.videoId,
      description: video.description,
      status: video.status as 'active' | 'inactive',
      createdAt: video.createdAt.toISOString().split('T')[0],
    }));

    res.json({ videos: formattedVideos });
  } catch (error) {
    console.error('Failed to fetch YouTube videos:', error);
    res.status(500).json({
      error: '동영상 목록을 불러오는데 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 유튜브 동영상 등록
 * POST /api/youtube
 * 권한: 관리자만
 */
router.post('/', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const { title, url, videoId, description, status } = req.body;

    // 필수 필드 검증
    if (!url || !videoId) {
      return res.status(400).json({
        error: 'URL, videoId는 필수 항목입니다.',
      });
    }

    // videoId 중복 검증
    const existingVideo = await prisma.youTubeVideo.findUnique({
      where: { videoId },
    });

    if (existingVideo) {
      return res.status(400).json({
        error: '이미 등록된 동영상입니다.',
      });
    }

    // 동영상 생성
    const video = await prisma.youTubeVideo.create({
      data: {
        title: title || '',
        url,
        videoId,
        description: description || '',
        status: (status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
      },
    });

    // DB 모델을 프론트엔드 타입으로 변환
    const formattedVideo = {
      id: video.id,
      title: video.title,
      url: video.url,
      videoId: video.videoId,
      description: video.description,
      status: video.status as 'active' | 'inactive',
      createdAt: video.createdAt.toISOString().split('T')[0],
    };

    res.status(201).json({ video: formattedVideo });
  } catch (error) {
    console.error('Failed to create YouTube video:', error);
    res.status(500).json({
      error: '동영상 등록에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 유튜브 동영상 수정
 * PATCH /api/youtube/:id
 * 권한: 관리자만
 */
router.patch('/:id', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, url, videoId, description, status } = req.body;

    // 동영상 존재 확인
    const existingVideo = await prisma.youTubeVideo.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingVideo) {
      return res.status(404).json({
        error: '동영상을 찾을 수 없습니다.',
      });
    }

    // videoId 변경 시 중복 검증
    if (videoId && videoId !== existingVideo.videoId) {
      const duplicateVideo = await prisma.youTubeVideo.findUnique({
        where: { videoId },
      });

      if (duplicateVideo) {
        return res.status(400).json({
          error: '이미 등록된 videoId입니다.',
        });
      }
    }

    // 업데이트 데이터 구성
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (url !== undefined) updateData.url = url;
    if (videoId !== undefined) updateData.videoId = videoId;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      updateData.status = (status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive';
    }

    // 동영상 업데이트
    const video = await prisma.youTubeVideo.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    // DB 모델을 프론트엔드 타입으로 변환
    const formattedVideo = {
      id: video.id,
      title: video.title,
      url: video.url,
      videoId: video.videoId,
      description: video.description,
      status: video.status as 'active' | 'inactive',
      createdAt: video.createdAt.toISOString().split('T')[0],
    };

    res.json({ video: formattedVideo });
  } catch (error) {
    console.error('Failed to update YouTube video:', error);
    res.status(500).json({
      error: '동영상 수정에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * 유튜브 동영상 삭제
 * DELETE /api/youtube/:id
 * 권한: 관리자만
 */
router.delete('/:id', ...adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    // 동영상 존재 확인
    const existingVideo = await prisma.youTubeVideo.findUnique({
      where: { id: parsedId },
    });

    if (!existingVideo) {
      return res.status(404).json({
        error: '동영상을 찾을 수 없습니다.',
      });
    }

    // 동영상 삭제
    await prisma.youTubeVideo.delete({
      where: { id: parsedId },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete YouTube video:', error);
    res.status(500).json({
      error: '동영상 삭제에 실패했습니다.',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

