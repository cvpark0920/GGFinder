import { useState, useCallback, useEffect } from "react";
import { YouTubeVideo } from "../../types/dashboard";
import { toast } from "sonner";
import {
  fetchYouTubeVideos,
  createYouTubeVideo,
  updateYouTubeVideo,
  deleteYouTubeVideo,
} from "../../utils/api";

/**
 * YouTube 동영상 상태 및 CRUD 작업을 관리하는 커스텀 훅
 */
export function useVideos() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const videosData = await fetchYouTubeVideos();
        setVideos(videosData);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "동영상 목록을 불러오는데 실패했습니다.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Failed to load videos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideos();
  }, []);

  const handleAddVideo = useCallback(
    async (
      data: Omit<YouTubeVideo, "id" | "createdAt" | "videoId"> & {
        videoId: string;
      }
    ): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        if (editingVideo) {
          // 수정
          const updatedVideo = await updateYouTubeVideo(editingVideo.id, data);
          setVideos(
            videos.map((v) => (v.id === editingVideo.id ? updatedVideo : v))
          );
          setEditingVideo(null);
          toast.success("동영상이 수정되었습니다.");
        } else {
          // 등록
          const newVideo = await createYouTubeVideo(data);
          setVideos([newVideo, ...videos]);
          toast.success("동영상이 등록되었습니다.");
        }
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : editingVideo
            ? "동영상 수정에 실패했습니다."
            : "동영상 등록에 실패했습니다.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Failed to save video:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [videos, editingVideo]
  );

  const handleEditVideo = useCallback((video: YouTubeVideo) => {
    setEditingVideo(video);
  }, []);

  const handleDeleteVideo = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);
        setError(null);

        await deleteYouTubeVideo(id);
        setVideos(videos.filter((v) => v.id !== id));
        toast.success("동영상이 삭제되었습니다.");
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "동영상 삭제에 실패했습니다.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Failed to delete video:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [videos]
  );

  const resetEditingVideo = useCallback(() => {
    setEditingVideo(null);
  }, []);

  return {
    videos,
    editingVideo,
    setEditingVideo,
    isLoading,
    error,
    handleAddVideo,
    handleEditVideo,
    handleDeleteVideo,
    resetEditingVideo,
  };
}

