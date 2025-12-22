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
  UserCircle
} from "lucide-react";
import { AvatarCropDialog } from "../AvatarCropDialog";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateClientImageOrder, fetchClient } from "../../utils/api";
import { Badge } from "../ui/badge";
import { Star } from "lucide-react";

interface EditBrideSheetProps {
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

export function EditBrideSheet({
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
}: EditBrideSheetProps) {
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
      <SheetContent side="bottom" className="h-[80vh] max-h-[80vh] rounded-t-2xl flex flex-col overflow-hidden p-0" style={{ height: '80vh', maxHeight: '80vh' }}>
        <SheetHeader className="pb-4 border-b bg-white sticky top-0 z-10 flex-shrink-0 px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
              <FileEdit className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <SheetTitle className="text-xl">신부 정보 수정</SheetTitle>
              <SheetDescription>
                신부 회원의 정보를 수정하세요.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 기본 정보 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-rose-600" />
                <CardTitle>기본 정보</CardTitle>
              </div>
              <CardDescription>신부의 기본적인 인적사항을 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-b-name">이름 (Tên)</Label>
                  <Input
                    id="edit-b-name"
                    value={editingClient.name}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        name: e.target.value,
                      })
                    }
                    placeholder="vũ quốc hương"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-b-birthYear">출생년도</Label>
                  <Select
                    value={editingClient.birthYear?.toString() || ''}
                    onValueChange={(val) =>
                      setEditingClient({
                        ...editingClient,
                        birthYear: parseInt(val),
                      })
                    }
                  >
                    <SelectTrigger id="edit-b-birthYear">
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
                  <Label htmlFor="edit-b-loc">거주지 (Địa chỉ)</Label>
                  <Input
                    id="edit-b-loc"
                    value={editingClient.loc}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        loc: e.target.value,
                      })
                    }
                    placeholder="Hà Nội"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-b-marriage">결혼유무</Label>
                  <Select
                    value={editingClient.marriage}
                    onValueChange={(val) =>
                      setEditingClient({
                        ...editingClient,
                        marriage: val,
                      })
                    }
                  >
                    <SelectTrigger id="edit-b-marriage">
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
                <Briefcase className="w-5 h-5 text-rose-600" />
                <CardTitle>학력 및 직업</CardTitle>
              </div>
              <CardDescription>신부의 학력과 직업 정보를 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-b-edu">학력 (Học lực)</Label>
                  <Input
                    id="edit-b-edu"
                    type="number"
                    min="0"
                    max="12"
                    value={editingClient.education || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        education: e.target.value,
                      })
                    }
                    placeholder="9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-b-job">현재직업</Label>
                  <Input
                    id="edit-b-job"
                    value={editingClient.job || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        job: e.target.value,
                      })
                    }
                    placeholder="재봉사"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 신체 정보 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-600" />
                <CardTitle>신체 정보</CardTitle>
              </div>
              <CardDescription>신부의 신체 정보를 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-b-height">키 (Cao) - cm</Label>
                  <Input
                    id="edit-b-height"
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
                    placeholder="163"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-b-weight">몸무게(Cân nặng) - kg</Label>
                  <Input
                    id="edit-b-weight"
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
                    placeholder="54"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-b-tattoo">문신(Tattoo) 여부</Label>
                <Select
                  value={editingClient.tattoo || "없음"}
                  onValueChange={(val) =>
                    setEditingClient({
                      ...editingClient,
                      tattoo: val,
                    })
                  }
                >
                  <SelectTrigger id="edit-b-tattoo">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="없음">없음</SelectItem>
                    <SelectItem value="있음">있음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 가족 및 종교 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                <CardTitle>가족 및 종교</CardTitle>
              </div>
              <CardDescription>가족 구성과 종교 정보를 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-b-family">가족구성 (Gia đình)</Label>
                <Input
                  id="edit-b-family"
                  value={editingClient.family || ""}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      family: e.target.value,
                    })
                  }
                  placeholder="부모님, 언니 1명"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-b-fatherAge">아빠 나이</Label>
                  <Input
                    id="edit-b-fatherAge"
                    type="number"
                    min="0"
                    max="150"
                    value={(editingClient as any).fatherAge || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        fatherAge: e.target.value ? parseInt(e.target.value) : undefined,
                      } as any)
                    }
                    placeholder="65"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-b-motherAge">엄마 나이</Label>
                  <Input
                    id="edit-b-motherAge"
                    type="number"
                    min="0"
                    max="150"
                    value={(editingClient as any).motherAge || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        motherAge: e.target.value ? parseInt(e.target.value) : undefined,
                      } as any)
                    }
                    placeholder="62"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 소속사 및 메모 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-600" />
                <CardTitle>소속 및 메모</CardTitle>
              </div>
              <CardDescription>소속사와 추가 정보를 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AgencySelector
                id="edit-b-agency"
                label="소속사"
                value={editingClient.agencyId?.toString() || ""}
                onChange={(val) =>
                  setEditingClient({
                    ...editingClient,
                    agencyId: val ? parseInt(val) : undefined,
                  })
                }
                agencies={agencies}
                role="bride"
              />

              <div className="space-y-2">
                <Label htmlFor="edit-b-ideal">이상형 조건</Label>
                <textarea
                  id="edit-b-ideal"
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
                id="edit-b-memo"
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
                <ImageIcon className="w-5 h-5 text-rose-600" />
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
                      <AvatarFallback className="bg-rose-100 text-rose-600">
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
                      <UserCircle className="w-4 h-4" /> 아바타 {editingClient?.avatarUrl ? '변경' : '선택'}
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
                <Label htmlFor="edit-b-photos">사진 업로드</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-b-photos"
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
                      htmlFor="edit-b-photos"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" /> 사진 선택
                    </label>
                  </Button>
                  {selectedPhotos.length > 0 && (
                    <span className="text-sm text-rose-600 font-medium">
                      {selectedPhotos.length}장 선택됨
                    </span>
                  )}
                </div>
                {(allImages.length > 0 || photoPreviewUrls.length > 0) && (
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {allImages.map((img, index) => {
                      const isPrimary = index === 0;
                      const canSetPrimary = !isPrimary && img.id !== null;

                      return (
                        <div key={img.id || `new-${img.newIndex}`} className="relative group">
                          <img
                            src={img.url}
                            alt={`Photo ${index + 1}`}
                            className={`w-full h-24 object-cover rounded-lg border-2 ${
                              isPrimary ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-200'
                            }`}
                          />
                          {isPrimary && (
                            <Badge className="absolute top-1 left-1 bg-rose-500 text-white text-xs px-2 py-0.5">
                              <Star className="w-3 h-3 mr-1" />
                              대표
                            </Badge>
                          )}
                          {canSetPrimary && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute bottom-1 left-1 right-1 h-7 bg-white/95 hover:bg-white text-xs px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => img.id && handleSetPrimaryImage(img.id)}
                            >
                              <Star className="w-3 h-3 mr-1" />
                              대표로 설정
                            </Button>
                          )}
                          {img.isNew && img.newIndex !== null && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-7 w-7 bg-white/95 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemovePhoto(img.newIndex!)}
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                          {!img.isNew && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-7 w-7 bg-white/95 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                // 기존 이미지 삭제는 저장 시 처리되므로 여기서는 비활성화
                                toast.info('기존 이미지는 저장 시 삭제할 수 있습니다.');
                              }}
                              disabled
                            >
                              <X className="w-4 h-4 text-slate-400" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 동영상 업로드 */}
              <div className="space-y-3 pt-3 border-t">
                <Label htmlFor="edit-b-video">동영상 업로드</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-b-video"
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
                      htmlFor="edit-b-video"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Video className="w-4 h-4" /> 동영상 선택
                    </label>
                  </Button>
                  {selectedVideo && (
                    <span className="text-sm text-rose-600 font-medium truncate max-w-[200px]">
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
            className="flex-1 bg-rose-600 hover:bg-rose-700"
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
