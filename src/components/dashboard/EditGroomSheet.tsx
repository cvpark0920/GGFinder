import { Client, Agency } from "../../types/dashboard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { AgencySelector } from "../AgencySelector";
import { MemoTextarea } from "../MemoTextarea";
import { 
  Upload, 
  Video, 
  X, 
  FileEdit, 
  User, 
  Briefcase, 
  Activity, 
  Heart, 
  Building2,
  ImageIcon,
  DollarSign,
  UserCircle
} from "lucide-react";
import { AvatarCropDialog } from "../AvatarCropDialog";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateClientImageOrder, fetchClient } from "../../utils/api";
import { Badge } from "../ui/badge";
import { Star } from "lucide-react";

interface EditGroomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingClient: Client | null;
  setEditingClient: (client: Client | null) => void;
  agencies: Agency[];
  selectedPhotos: File[];
  photoPreviewUrls: string[];
  selectedVideo: File | null;
  videoPreviewUrl: string;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemovePhoto: (index: number) => void;
  handleVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveVideo: () => void;
  onSave: () => void;
  selectedAvatar?: File | null;
  onAvatarChange?: (avatar: File | null) => void;
}

export function EditGroomSheet({
  open,
  onOpenChange,
  editingClient,
  setEditingClient,
  agencies,
  selectedPhotos,
  photoPreviewUrls,
  selectedVideo,
  videoPreviewUrl,
  handlePhotoChange,
  handleRemovePhoto,
  handleVideoChange,
  handleRemoveVideo,
  onSave,
  selectedAvatar,
  onAvatarChange,
}: EditGroomSheetProps) {
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // 기존 아바타 또는 새로 선택한 아바타 미리보기
  useEffect(() => {
    if (selectedAvatar) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedAvatar);
    } else if (editingClient?.avatarUrl) {
      setAvatarPreview(editingClient.avatarUrl);
    } else {
      setAvatarPreview(null);
    }
  }, [selectedAvatar, editingClient?.avatarUrl]);

  // 모든 이미지 URL 수집 (기존 + 새로 업로드한 것)
  const allImageUrls = [
    ...(editingClient?.images || []),
    ...photoPreviewUrls,
  ];

  const handleCropComplete = (croppedImage: File) => {
    if (onAvatarChange) {
      onAvatarChange(croppedImage);
    }
    setIsAvatarDialogOpen(false);
  };

  const handleRemoveAvatar = () => {
    if (onAvatarChange) {
      onAvatarChange(null);
    }
    setAvatarPreview(null);
  };

  // 이미지가 객체인지 문자열인지 확인하는 헬퍼 함수
  const getImageUrl = (img: string | { id: number; url: string; order: number } | undefined): string => {
    if (!img) return '';
    return typeof img === 'string' ? img : img.url;
  };

  const getImageId = (img: string | { id: number; url: string; order: number } | undefined): number | null => {
    if (!img || typeof img === 'string') return null;
    return img.id;
  };

  const getImageOrder = (img: string | { id: number; url: string; order: number } | undefined): number => {
    if (!img || typeof img === 'string') return 999; // 새로 업로드한 이미지는 큰 값
    return img.order || 999;
  };

  // 기존 이미지와 새로 업로드한 이미지를 합쳐서 정렬
  const allImages = [
    ...(editingClient?.images || []).map((img, index) => ({
      id: getImageId(img),
      url: getImageUrl(img),
      order: getImageOrder(img),
      isNew: false,
      newIndex: null as number | null,
    })),
    ...photoPreviewUrls.map((url, index) => ({
      id: null as number | null,
      url,
      order: 999 + index,
      isNew: true,
      newIndex: index,
    })),
  ].sort((a, b) => a.order - b.order);

  const handleSetPrimaryImage = async (imageId: number) => {
    if (!editingClient) return;

    try {
      const updatedClient = await updateClientImageOrder(editingClient.id, imageId);
      setEditingClient(updatedClient);
      toast.success('대표 이미지가 변경되었습니다.');
    } catch (error) {
      console.error('Failed to update image order:', error);
      toast.error('대표 이미지 변경에 실패했습니다.');
    }
  };

  if (!editingClient) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="pb-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FileEdit className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <SheetTitle className="text-xl">신랑 정보 수정</SheetTitle>
              <SheetDescription>
                신랑 회원의 정보를 수정하세요.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* 기본 정보 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                <CardTitle>기본 정보</CardTitle>
              </div>
              <CardDescription>신랑의 기본적인 인적사항을 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-g-name">이름</Label>
                  <Input
                    id="edit-g-name"
                    value={editingClient.name}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        name: e.target.value,
                      })
                    }
                    placeholder="홍길동"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-g-birthYear">출생년도</Label>
                  <Select
                    value={editingClient.birthYear?.toString() || ''}
                    onValueChange={(val) =>
                      setEditingClient({
                        ...editingClient,
                        birthYear: parseInt(val),
                      })
                    }
                  >
                    <SelectTrigger id="edit-g-birthYear">
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-g-loc">거주지 주소</Label>
                  <Input
                    id="edit-g-loc"
                    value={editingClient.loc}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        loc: e.target.value,
                      })
                    }
                    placeholder="서울시 강남구"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-g-marriage">결혼유무</Label>
                  <Select
                    value={editingClient.marriage}
                    onValueChange={(val) =>
                      setEditingClient({
                        ...editingClient,
                        marriage: val,
                      })
                    }
                  >
                    <SelectTrigger id="edit-g-marriage">
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="초혼">초혼</SelectItem>
                      <SelectItem value="재혼">재혼</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 학력 및 직업 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <CardTitle>학력 및 직업</CardTitle>
              </div>
              <CardDescription>신랑의 학력과 직업 정보를 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-g-edu">학력</Label>
                  <Input
                    id="edit-g-edu"
                    value={editingClient.education || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        education: e.target.value,
                      })
                    }
                    placeholder="대졸"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-g-job">직업(직장)</Label>
                  <Input
                    id="edit-g-job"
                    value={editingClient.job || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        job: e.target.value,
                      })
                    }
                    placeholder="회사원"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 신체 정보 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <CardTitle>신체 정보</CardTitle>
              </div>
              <CardDescription>신랑의 신체 정보를 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-g-height">신장 - cm</Label>
                  <Input
                    id="edit-g-height"
                    type="number"
                    min="100"
                    max="250"
                    value={editingClient.height || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        height: e.target.value ? parseInt(e.target.value) || 0 : undefined,
                      })
                    }
                    placeholder="175"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-g-weight">몸무게 - kg</Label>
                  <Input
                    id="edit-g-weight"
                    type="number"
                    min="30"
                    max="200"
                    value={editingClient.weight || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        weight: e.target.value ? parseInt(e.target.value) || 0 : undefined,
                      })
                    }
                    placeholder="70"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 재산 및 라이프스타일 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <CardTitle>재산 및 라이프스타일</CardTitle>
              </div>
              <CardDescription>소득 및 생활 습관 정보를 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-g-income">연소득 - 만원</Label>
                  <Input
                    id="edit-g-income"
                    type="number"
                    min="0"
                    value={editingClient.income || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        income: e.target.value,
                      })
                    }
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-g-smoking">흡연유무</Label>
                  <Select
                    value={editingClient.smoking || "비흡연"}
                    onValueChange={(val) =>
                      setEditingClient({
                        ...editingClient,
                        smoking: val,
                      })
                    }
                  >
                    <SelectTrigger id="edit-g-smoking">
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="비흡연">비흡연</SelectItem>
                      <SelectItem value="흡연">흡연</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-g-drinking">음주주량</Label>
                <Input
                  id="edit-g-drinking"
                  value={editingClient.drinking || ""}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      drinking: e.target.value,
                    })
                  }
                  placeholder="소주 1병"
                />
              </div>
            </CardContent>
          </Card>

          {/* 소속사 및 메모 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <CardTitle>소속 및 메모</CardTitle>
              </div>
              <CardDescription>소속사와 추가 정보를 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AgencySelector
                id="edit-g-agency"
                label="소속사"
                value={editingClient.agencyId?.toString() || ""}
                onChange={(val) =>
                  setEditingClient({
                    ...editingClient,
                    agencyId: val ? parseInt(val) : undefined,
                  })
                }
                agencies={agencies}
                role="groom"
              />

              <div className="space-y-2">
                <Label htmlFor="edit-g-ideal">이상형 조건</Label>
                <textarea
                  id="edit-g-ideal"
                  value={editingClient.idealType || ""}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      idealType: e.target.value,
                    })
                  }
                  placeholder="성격이 밝고 명랑한 분"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              <MemoTextarea
                id="edit-g-memo"
                value={editingClient.memo || ""}
                onChange={(val) =>
                  setEditingClient({
                    ...editingClient,
                    memo: val,
                  })
                }
              />
            </CardContent>
          </Card>

          {/* 미디어 업로드 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <CardTitle>사진 및 동영상</CardTitle>
              </div>
              <CardDescription>프로필 사진과 소개 동영상을 업로드하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 아바타 설정 */}
              <div className="space-y-3 pb-4 border-b">
                <Label>아바타 이미지</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-2 border-slate-200">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Avatar" />
                    ) : (
                      <AvatarFallback className="bg-indigo-100 text-indigo-600">
                        <UserCircle className="w-10 h-10" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setIsAvatarDialogOpen(true)}
                      disabled={allImageUrls.length === 0}
                    >
                      <UserCircle className="w-4 h-4" /> 아바타 {editingClient.avatarUrl ? '변경' : '선택'}
                    </Button>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700"
                        onClick={handleRemoveAvatar}
                      >
                        <X className="w-4 h-4" /> 제거
                      </Button>
                    )}
                    {allImageUrls.length === 0 && (
                      <p className="text-xs text-slate-500">
                        먼저 프로필 사진을 업로드해주세요
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 사진 업로드 */}
              <div className="space-y-3">
                <Label htmlFor="edit-g-photos">사진 업로드</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-g-photos"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 px-4 h-10"
                    asChild
                  >
                    <label
                      htmlFor="edit-g-photos"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" /> 사진 선택
                    </label>
                  </Button>
                  {selectedPhotos.length > 0 && (
                    <span className="text-sm text-indigo-600 font-medium">
                      {selectedPhotos.length}장 선택됨
                    </span>
                  )}
                </div>
                {photoPreviewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {photoPreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Uploaded photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-slate-200"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-7 w-7 bg-white/95 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 동영상 업로드 */}
              <div className="space-y-3 pt-3 border-t">
                <Label htmlFor="edit-g-video">동영상 업로드</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-g-video"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 px-4 h-10"
                    asChild
                  >
                    <label
                      htmlFor="edit-g-video"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Video className="w-4 h-4" /> 동영상 선택
                    </label>
                  </Button>
                  {selectedVideo && (
                    <span className="text-sm text-indigo-600 font-medium truncate max-w-[200px]">
                      {selectedVideo.name}
                    </span>
                  )}
                </div>
                {videoPreviewUrl && (
                  <div className="relative mt-2 group">
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full h-48 object-cover rounded-lg border-2 border-slate-200"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 bg-white/95 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveVideo}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <SheetFooter className="sticky bottom-0 bg-white border-t pt-4 pb-4 px-6 gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            onClick={onSave}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            수정 완료
          </Button>
        </SheetFooter>
      </SheetContent>

      {/* 아바타 크롭 다이얼로그 */}
      <AvatarCropDialog
        open={isAvatarDialogOpen}
        onOpenChange={setIsAvatarDialogOpen}
        images={allImageUrls}
        onCropComplete={handleCropComplete}
        currentAvatar={editingClient?.avatarUrl}
      />
    </Sheet>
  );
}
