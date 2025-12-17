import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// 업로드 디렉토리 생성
const uploadsDir = path.join(process.cwd(), 'uploads');
const imagesDir = path.join(uploadsDir, 'images');
const videosDir = path.join(uploadsDir, 'videos');
const avatarsDir = path.join(uploadsDir, 'avatars');

[uploadsDir, imagesDir, videosDir, avatarsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 파일 필터 함수
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

  if (file.fieldname === 'images' || file.fieldname === 'avatar') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일은 jpg, png, webp 형식만 지원합니다.'));
    }
  } else if (file.fieldname === 'video') {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('비디오 파일은 mp4, webm, mov 형식만 지원합니다.'));
    }
  } else {
    cb(null, true);
  }
};

// 스토리지 설정
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    if (file.fieldname === 'images') {
      cb(null, imagesDir);
    } else if (file.fieldname === 'video') {
      cb(null, videosDir);
    } else if (file.fieldname === 'avatar') {
      cb(null, avatarsDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// Multer 설정
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// 이미지 여러 개 업로드
export const uploadImages = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'avatar', maxCount: 1 },
]);

// 파일 삭제 헬퍼 함수
export const deleteFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('파일 삭제 실패:', error);
  }
};

// URL에서 파일 경로 추출
export const getFilePathFromUrl = (url: string): string | null => {
  try {
    // URL 형식: /uploads/images/filename.jpg 또는 http://localhost:4000/uploads/images/filename.jpg
    const urlPath = url.replace(/^https?:\/\/[^\/]+/, '');
    if (urlPath.startsWith('/uploads/')) {
      return path.join(process.cwd(), urlPath);
    }
    return null;
  } catch (error) {
    console.error('파일 경로 추출 실패:', error);
    return null;
  }
};

