import React, { useState, useEffect, useRef } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi
} from './ui/carousel';
import { Image as ImageIcon, Video } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProfileImageSliderProps {
  images: string[];
  name: string;
  videoUrl?: string;
}

export function ProfileImageSlider({ images, name, videoUrl }: ProfileImageSliderProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoIndex = videoUrl ? images.length : -1; // 동영상이 있으면 마지막 인덱스

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
 
    api.on("select", handleSelect);
    
    return () => {
      api.off("select", handleSelect);
    };
  }, [api, videoIndex]);

  // 이미지와 동영상을 합친 배열 생성
  const allMedia = [...images, ...(videoUrl ? [videoUrl] : [])];
  const hasVideo = !!videoUrl;

  if (!images || images.length === 0) {
    // 이미지가 없고 동영상만 있는 경우
    if (videoUrl) {
      return (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="object-contain object-center w-full h-full bg-slate-900 select-none"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserDrag: 'none' }}
          />
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <div className="bg-black/30 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
              <Video size={10} />
              <span>동영상</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }
  
  if (images.length === 1 && !videoUrl) {
    return (
        <ImageWithFallback
            src={images[0]}
            alt={name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 select-none"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserDrag: 'none' }}
        />
    );
  }

  return (
    <div className="w-full h-full group/slider relative">
      <Carousel 
        setApi={setApi} 
        className="w-full h-full [&_[data-slot=carousel-content]]:h-full"
        opts={{
            loop: true,
        }}
      >
        <CarouselContent className="h-full ml-0">
          {images.map((img, index) => (
            <CarouselItem key={index} className="pl-0 h-full basis-full">
              <div className="relative w-full h-full">
                 <ImageWithFallback
                   src={img}
                   alt={`${name} ${index + 1}`}
                   className="object-contain object-center w-full h-full bg-slate-900 select-none"
                   draggable={false}
                   onContextMenu={(e) => e.preventDefault()}
                   style={{ userSelect: 'none', WebkitUserDrag: 'none' }}
                 />
              </div>
            </CarouselItem>
          ))}
          {videoUrl && (
            <CarouselItem className="pl-0 h-full basis-full">
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="object-contain object-center w-full h-full bg-slate-900 select-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ userSelect: 'none', WebkitUserDrag: 'none' }}
                />
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <div className="bg-black/30 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                    <Video size={10} />
                    <span>동영상</span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        
        <CarouselPrevious 
            className="left-2 opacity-0 group-hover/slider:opacity-100 transition-opacity z-20 h-8 w-8 border-none bg-black/20 hover:bg-black/50 text-white hover:text-white" 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                api?.scrollPrev();
            }}
        />
        <CarouselNext 
            className="right-2 opacity-0 group-hover/slider:opacity-100 transition-opacity z-20 h-8 w-8 border-none bg-black/20 hover:bg-black/50 text-white hover:text-white" 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                api?.scrollNext();
            }}
        />
      </Carousel>

      {/* Media Count Badge */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none">
         <div className="bg-black/30 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
            <ImageIcon size={10} />
            <span>{images.length}</span>
            {hasVideo && (
              <>
                <span className="mx-1">+</span>
                <Video size={10} />
                <span>1</span>
              </>
            )}
         </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all pointer-events-auto ${
              index + 1 === current ? "bg-white w-2.5" : "bg-white/50 hover:bg-white/80"
            }`}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                api?.scrollTo(index);
            }}
          />
        ))}
      </div>
    </div>
  );
}