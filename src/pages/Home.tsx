import React, { useState, useEffect } from 'react';
import { Youtube, Play, Loader2 } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { YouTubeVideo } from '../types/dashboard';
import { fetchPublicYouTubeVideos } from '../utils/api';

export default function Home() {
  const { language, t } = useLanguage();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  // 영상 목록 로드
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const videosData = await fetchPublicYouTubeVideos();
        setVideos(videosData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t('home.youtube.loadError') || '영상 목록을 불러오는데 실패했습니다.';
        setError(errorMessage);
        console.error('Failed to load videos:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideos();
  }, [t]);

  const getThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const getEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleVideoClick = (video: YouTubeVideo) => {
    setSelectedVideo(video);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
      {/* Videos Section */}
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <span className="ml-3 text-slate-600">
              {t('home.youtube.loading') || (language === 'vn' ? 'Đang tải...' : language === 'en' ? 'Loading...' : '로딩 중...')}
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && videos.length === 0 && (
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="p-6 text-center">
              <Youtube className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">
                {t('home.youtube.noVideos') || (language === 'vn' ? 'Chưa có video nào' : language === 'en' ? 'No videos available' : '등록된 영상이 없습니다')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Videos Grid */}
        {!isLoading && !error && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden border-slate-200 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleVideoClick(video)}
              >
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    <img
                      src={getThumbnailUrl(video.videoId)}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to default thumbnail if image fails to load
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                      }}
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center group-hover:bg-red-600 group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                      </div>
                    </div>
                  </div>
                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video bg-slate-100">
              <iframe
                src={getEmbedUrl(selectedVideo.videoId)}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {selectedVideo?.description && (
            <div className="px-6 pb-6">
              <p className="text-sm text-slate-600">{selectedVideo.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}