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
import { useLanguage } from "../LanguageContext";

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
  const { t } = useLanguage();
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
      toast.success(t('form.registration.media.primaryImageChanged'));
    } catch (error) {
      console.error('Failed to update image order:', error);
      toast.error(t('form.registration.media.primaryImageChangeFailed'));
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
              <SheetTitle className="text-xl">{t('form.registration.titles.editBride')}</SheetTitle>
              <SheetDescription>
                {t('form.registration.descriptions.editBride')}
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
                <CardTitle>{t('form.registration.sections.basicInfo')}</CardTitle>
              </div>
              <CardDescription>{t('form.registration.sectionDescriptions.basicInfoBride')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-b-name">{t('form.registration.fields.nameWithVietnamese')}</Label>
                  <Input
                    id="edit-b-name"
                    value={editingClient.name}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        name: e.target.value,
                      })
                    }
                    placeholder={t('form.registration.placeholders.nameBride')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-b-birthYear">{t('form.registration.fields.birthYear')}</Label>
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
                      <SelectValue placeholder={t('common.select')} />
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
                  <Label htmlFor="edit-b-loc">{t('form.registration.fields.residenceWithVietnamese')}</Label>
                  <Input
                    id="edit-b-loc"
                    value={editingClient.loc}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        loc: e.target.value,
                      })
                    }
                    placeholder={t('form.registration.placeholders.residenceBride')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-b-marriage">{t('form.registration.fields.maritalStatus')}</Label>
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
                      <SelectValue placeholder={t('common.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="초혼">{t('form.registration.options.firstMarriage')}</SelectItem>
                      <SelectItem value="재혼">{t('form.registration.options.remarriage')}</SelectItem>
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
                <CardTitle>{t('form.registration.sections.educationJob')}</CardTitle>
              </div>
              <CardDescription>{t('form.registration.sectionDescriptions.educationJobBride')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-b-edu">{t('form.registration.fields.educationWithVietnamese')}</Label>
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
                    placeholder={t('form.registration.placeholders.educationLevel')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-b-job">{t('form.registration.fields.currentJob')}</Label>
                  <Input
                    id="edit-b-job"
                    value={editingClient.job || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        job: e.target.value,
                      })
                    }
                    placeholder={t('form.registration.placeholders.jobBride')}
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
                <CardTitle>{t('form.registration.sections.physicalInfo')}</CardTitle>
              </div>
              <CardDescription>{t('form.registration.sectionDescriptions.physicalInfoBride')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-b-height">{t('form.registration.fields.heightWithVietnamese')}</Label>
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
                    placeholder={t('form.registration.placeholders.heightBride')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-b-weight">{t('form.registration.fields.weightWithVietnamese')}</Label>
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
                    placeholder={t('form.registration.placeholders.weightBride')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-b-tattoo">{t('form.registration.fields.tattoo')}</Label>
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
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="없음">{t('form.registration.options.noTattoo')}</SelectItem>
                    <SelectItem value="있음">{t('form.registration.options.hasTattoo')}</SelectItem>
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
                <CardTitle>{t('form.registration.sections.familyReligion')}</CardTitle>
              </div>
              <CardDescription>{t('form.registration.sectionDescriptions.familyReligion')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-b-family">{t('form.registration.fields.family')}</Label>
                <Input
                  id="edit-b-family"
                  value={editingClient.family || ""}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      family: e.target.value,
                    })
                  }
                  placeholder={t('form.registration.placeholders.family')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-b-fatherAge">{t('form.registration.fields.fatherAge')}</Label>
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
                  <Label htmlFor="edit-b-motherAge">{t('form.registration.fields.motherAge')}</Label>
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

              <div className="space-y-2">
                <Label htmlFor="edit-b-religion">{t('form.labels.religion')}</Label>
                <Select
                  value={editingClient.religion || ""}
                  onValueChange={(val) =>
                    setEditingClient({
                      ...editingClient,
                      religion: val,
                    })
                  }
                >
                  <SelectTrigger id="edit-b-religion">
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="무교">{t('profile.filters.noReligion')}</SelectItem>
                    <SelectItem value="불교">{t('profile.filters.buddhism')}</SelectItem>
                    <SelectItem value="기독교">{t('profile.filters.christianity')}</SelectItem>
                    <SelectItem value="천주교">{t('profile.filters.catholicism')}</SelectItem>
                    <SelectItem value="기타">{t('profile.filters.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 소속사 및 메모 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-rose-600" />
                <CardTitle>{t('form.registration.sections.affiliationMemo')}</CardTitle>
              </div>
              <CardDescription>{t('form.registration.sectionDescriptions.affiliationMemo')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AgencySelector
                id="edit-b-agency"
                label={t('form.registration.fields.agency')}
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
                <Label htmlFor="edit-b-ideal">{t('form.registration.fields.idealType')}</Label>
                <textarea
                  id="edit-b-ideal"
                  value={editingClient.idealType || ""}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      idealType: e.target.value,
                    })
                  }
                  placeholder={t('form.registration.placeholders.idealType')}
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
                <CardTitle>{t('form.registration.sections.media')}</CardTitle>
              </div>
              <CardDescription>{t('form.registration.sectionDescriptions.media')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 아바타 설정 */}
              <div className="space-y-3 pb-4 border-b">
                <Label>{t('form.registration.media.avatarImage')}</Label>
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
                      <UserCircle className="w-4 h-4" /> {editingClient?.avatarUrl ? t('form.registration.buttons.changeAvatar') : t('form.registration.buttons.selectAvatar')}
                    </Button>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700"
                        onClick={handleRemoveAvatar}
                      >
                        <X className="w-4 h-4" /> {t('common.delete')}
                      </Button>
                    )}
                    {allImageUrls.length === 0 && (
                      <p className="text-xs text-slate-500">
                        {t('form.registration.media.uploadPhotosFirst')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 사진 업로드 */}
              <div className="space-y-3">
                <Label htmlFor="edit-b-photos">{t('form.registration.media.uploadPhotos')}</Label>
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
                      <Upload className="w-4 h-4" /> {t('form.registration.buttons.selectPhotos')}
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
                              {t('form.registration.media.primary')}
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
                              {t('form.registration.buttons.setPrimary')}
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
                                toast.info(t('form.registration.media.existingImageDeleteInfo'));
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
                <Label htmlFor="edit-b-video">{t('form.registration.media.uploadVideo')}</Label>
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
                      <Video className="w-4 h-4" /> {t('form.registration.buttons.selectVideo')}
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
            {t('form.registration.buttons.cancel')}
          </Button>
          <Button
            onClick={onSave}
            className="flex-1 bg-rose-600 hover:bg-rose-700"
          >
            {t('form.registration.buttons.updateComplete')}
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
