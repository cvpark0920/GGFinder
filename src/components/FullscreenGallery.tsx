import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from './ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from './ui/carousel';
import { X, Video } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';

interface FullscreenGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  videoUrl?: string;
  initialIndex?: number;
  name: string;
}

export function FullscreenGallery({
  open,
  onOpenChange,
  images,
  videoUrl,
  initialIndex = 0,
  name,
}: FullscreenGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoIndex = videoUrl ? images.length : -1;

  // 초기 인덱스 설정
  useEffect(() => {
    if (api && open) {
      api.scrollTo(initialIndex, false);
      setCurrent(initialIndex + 1);
    }
  }, [api, open, initialIndex]);

  // Carousel API 설정 및 이벤트 리스너
  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    const handleSelect = () => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrent(selectedIndex + 1);

      // 동영상이 있고 현재 선택된 항목이 동영상이 아니면 동영상 재생 일시정지
      if (videoRef.current && videoIndex >= 0 && selectedIndex !== videoIndex) {
        videoRef.current.pause();
      }
    };

    api.on('select', handleSelect);

    return () => {
      api.off('select', handleSelect);
    };
  }, [api, videoIndex]);

  // 키보드 네비게이션
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        api?.scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        api?.scrollNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, api, onOpenChange]);

  const allMediaCount = images.length + (videoUrl ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 gap-0 border-0 bg-black/95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        onPointerDownOutside={(e) => {
          // 이미지/동영상 영역 클릭은 무시하고, 배경 클릭만 닫기
          if ((e.target as HTMLElement).closest('[data-slot="carousel-content"]')) {
            e.preventDefault();
          }
        }}
      >
        {/* 접근성을 위한 숨김 제목 */}
        <DialogTitle className="sr-only">
          {name} 프로필 갤러리
        </DialogTitle>
        
        {/* 닫기 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
          onClick={() => onOpenChange(false)}
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* 갤러리 컨테이너 */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Carousel
            setApi={setApi}
            className="w-full h-full flex items-center justify-center"
            opts={{
              loop: true,
              startIndex: initialIndex,
            }}
          >
            <CarouselContent className="h-full ml-0 flex items-center">
              {images.map((img, index) => (
                <CarouselItem key={index} className="pl-0 h-full basis-full flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <ImageWithFallback
                      src={img}
                      alt={`${name} ${index + 1}`}
                      className="max-w-full max-h-full w-auto h-auto object-contain select-none"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ userSelect: 'none', WebkitUserDrag: 'none' }}
                    />
                  </div>
                </CarouselItem>
              ))}
              {videoUrl && (
                <CarouselItem className="pl-0 h-full basis-full flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      className="max-w-full max-h-full w-auto h-auto object-contain select-none"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ userSelect: 'none', WebkitUserDrag: 'none' } as React.CSSProperties}
                    />
                    <div className="absolute top-6 right-6 z-10 pointer-events-none">
                      <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Video size={14} />
                        <span>동영상</span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>

            {/* 좌우 화살표 버튼 */}
            {allMediaCount > 1 && (
              <>
                <CarouselPrevious className="left-4 h-12 w-12 border-none bg-black/50 hover:bg-black/70 text-white hover:text-white opacity-80 hover:opacity-100 transition-opacity" />
                <CarouselNext className="right-4 h-12 w-12 border-none bg-black/50 hover:bg-black/70 text-white hover:text-white opacity-80 hover:opacity-100 transition-opacity" />
              </>
            )}
          </Carousel>

          {/* 현재 인덱스 표시 (우측 상단, 닫기 버튼 아래) */}
          {allMediaCount > 1 && (
            <div className="absolute top-16 right-4 z-50 pointer-events-none">
              <div className="bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full">
                {current} / {allMediaCount}
              </div>
            </div>
          )}

          {/* 하단 인디케이터 점 */}
          {allMediaCount > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-50 pointer-events-none">
              {Array.from({ length: allMediaCount }).map((_, index) => (
                <button
                  key={index}
                  className={`rounded-full transition-all pointer-events-auto ${
                    index + 1 === current
                      ? 'bg-white w-2.5 h-2.5'
                      : 'bg-white/50 hover:bg-white/80 w-2 h-2'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    api?.scrollTo(index);
                  }}
                  aria-label={`${index + 1}번째 이미지로 이동`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

