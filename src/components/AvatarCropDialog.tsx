import React, { useState, useCallback, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { cn } from "./ui/utils";

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AvatarCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[]; // 프로필 이미지 URL 배열
  onCropComplete: (croppedImageFile: File) => void;
  currentAvatar?: string; // 현재 아바타 URL
}

export function AvatarCropDialog({
  open,
  onOpenChange,
  images,
  onCropComplete,
  currentAvatar,
}: AvatarCropDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    images[0] || currentAvatar || ""
  );
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // 다이얼로그 높이 및 스크롤 상태 측정
  useEffect(() => {
    if (!open) return;

    const measureHeights = () => {
      if (!dialogContentRef.current || !contentAreaRef.current) return;

      const dialogContent = dialogContentRef.current;
      const contentArea = contentAreaRef.current;
      const viewportHeight = window.innerHeight;
      const dialogRect = dialogContent.getBoundingClientRect();
      const contentRect = contentArea.getBoundingClientRect();
      const header = dialogContent.querySelector('[data-slot="dialog-header"]');
      const footer = dialogContent.querySelector('[data-slot="dialog-footer"]');
      
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const footerHeight = footer ? footer.getBoundingClientRect().height : 0;
      const contentHeight = contentRect.height;
      const totalHeight = dialogRect.height;
      const scrollHeight = contentArea.scrollHeight;
      const clientHeight = contentArea.clientHeight;
      const hasOverflow = scrollHeight > clientHeight;
      const canScroll = contentArea.scrollHeight > contentArea.clientHeight;

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/1ea1dcfc-80be-42cc-9332-f848c10e9a0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AvatarCropDialog.tsx:useEffect:measureHeights',message:'Dialog height measurements',data:{viewportHeight,dialogHeight:totalHeight,contentHeight,headerHeight,footerHeight,scrollHeight,clientHeight,hasOverflow,canScroll,overflowY:window.getComputedStyle(contentArea).overflowY,overflowX:window.getComputedStyle(contentArea).overflowX,dialogOverflowY:window.getComputedStyle(dialogContent).overflowY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    };

    // 초기 측정
    setTimeout(measureHeights, 100);

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', measureHeights);
    return () => window.removeEventListener('resize', measureHeights);
  }, [open, selectedImage, images.length]);

  const createImage = async (url: string): Promise<HTMLImageElement> => {
    // CORS 문제 해결: fetch로 이미지를 가져와서 blob URL로 변환
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.addEventListener("load", () => {
          URL.revokeObjectURL(blobUrl); // 메모리 정리
          resolve(image);
        });
        image.addEventListener("error", (error) => {
          URL.revokeObjectURL(blobUrl); // 메모리 정리
          reject(error);
        });
        image.src = blobUrl;
      });
    } catch (fetchError) {
      // fetch 실패 시 직접 로드 시도 (같은 도메인인 경우)
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.src = url;
      });
    }
  };

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    // 원형 크롭을 위한 정사각형 크기
    const size = Math.min(pixelCrop.width, pixelCrop.height);
    canvas.width = size;
    canvas.height = size;

    // 원형 마스크를 위한 경로
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    // 이미지 그리기
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      size,
      size
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels || !selectedImage) return;

    try {
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels);
      const file = new File([croppedBlob], "avatar.jpg", {
        type: "image/jpeg",
      });
      onCropComplete(file);
      onOpenChange(false);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={dialogContentRef} className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>아바타 이미지 선택 및 편집</DialogTitle>
          <DialogDescription>
            프로필 사진 중 하나를 선택하고 얼굴이 잘 보이도록 조정하세요.
          </DialogDescription>
        </DialogHeader>

        <div ref={contentAreaRef} className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* 이미지 선택 - 썸네일 갤러리 */}
          {images.length > 0 && (
            <div className="space-y-2">
              <Label>프로필 사진 선택</Label>
              <div className="flex flex-wrap gap-2">
                {images.map((img, index) => {
                  // #region agent log
                  const logThumbnailSize = () => {
                    setTimeout(() => {
                      const button = document.querySelector(`[data-thumbnail-index="${index}"]`) as HTMLElement;
                      if (button) {
                        const rect = button.getBoundingClientRect();
                        fetch('http://127.0.0.1:7243/ingest/1ea1dcfc-80be-42cc-9332-f848c10e9a0f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AvatarCropDialog.tsx:thumbnail:size',message:'Thumbnail size measurement',data:{index,width:rect.width,height:rect.height,layout:'flex-wrap'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                      }
                    }, 100);
                  };
                  if (index === 0) logThumbnailSize();
                  // #endregion
                  return (
                  <button
                    key={index}
                    data-thumbnail-index={index}
                    type="button"
                    onClick={() => {
                      setSelectedImage(img);
                      setZoom(1);
                      setCrop({ x: 0, y: 0 });
                    }}
                    className={cn(
                      "relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all hover:opacity-80 flex-shrink-0",
                      selectedImage === img
                        ? "border-primary ring-1 ring-primary ring-offset-1"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <img
                      src={img}
                      alt={`이미지 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedImage === img && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-primary-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 크롭 영역 */}
          {selectedImage && (
            <div className="relative w-full" style={{ height: "400px" }}>
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropComplete={onCropCompleteCallback}
                cropShape="round"
                showGrid={false}
                style={{
                  containerStyle: {
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  },
                }}
              />
            </div>
          )}

          {/* 줌 컨트롤 */}
          {selectedImage && (
            <div className="space-y-2">
              <Label>확대/축소</Label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* 미리보기 */}
          {selectedImage && croppedAreaPixels && (
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Label>미리보기</Label>
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedImage} alt="Preview" />
                  <AvatarFallback>미리보기</AvatarFallback>
                </Avatar>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedImage || !croppedAreaPixels}
          >
            적용
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

