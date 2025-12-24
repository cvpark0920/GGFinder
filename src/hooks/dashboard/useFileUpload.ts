import { useState, useCallback } from "react";
// TODO: 모바일 최적화를 위해 @capacitor/camera 또는 @capacitor/filesystem 플러그인 고려
// import { Camera } from '@capacitor/camera';
// import { isNativePlatform } from '../utils/platform';

/**
 * 파일 업로드 관련 상태와 핸들러를 관리하는 커스텀 훅
 * 
 * 현재는 웹과 모바일 모두에서 기본 파일 입력을 사용합니다.
 * 향후 모바일 최적화를 위해 Capacitor Camera/Filesystem 플러그인 사용 고려 가능.
 */
export function useFileUpload() {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");

  const handlePhotoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        setSelectedPhotos((prev) => [...prev, ...files]);

        // 미리보기 URL 생성
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPhotoPreviewUrls((prev) => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        });
      }
    },
    []
  );

  const handleRemovePhoto = useCallback((index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleVideoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedVideo(file);

        // 미리보기 URL 생성
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideoPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleRemoveVideo = useCallback(() => {
    setSelectedVideo(null);
    setVideoPreviewUrl("");
  }, []);

  const resetFileUploads = useCallback(() => {
    setSelectedPhotos([]);
    setSelectedVideo(null);
    setPhotoPreviewUrls([]);
    setVideoPreviewUrl("");
  }, []);

  return {
    selectedPhotos,
    selectedVideo,
    photoPreviewUrls,
    videoPreviewUrl,
    handlePhotoChange,
    handleRemovePhoto,
    handleVideoChange,
    handleRemoveVideo,
    resetFileUploads,
  };
}

