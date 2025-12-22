import React, { useState, useEffect } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { 
  Upload, 
  Video, 
  X, 
  UserPlus, 
  User, 
  Briefcase, 
  Activity, 
  Coffee, 
  Heart, 
  Building2,
  ImageIcon,
  UserCircle
} from "lucide-react";
import { AvatarCropDialog } from "./AvatarCropDialog";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { AgencySelector } from "./AgencySelector";
import { MemoTextarea } from "./MemoTextarea";
import { useLanguage } from "./LanguageContext";
import { Badge } from "./ui/badge";
import { Star } from "lucide-react";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "./ui/sheet";

interface Agency {
  id: string;
  name: string;
  role: string;
  contact: string;
  registeredDate: string;
}

interface GroomRegistrationFormProps {
  newClient: {
    name: string;
    birthYear: string;
    loc: string;
    education: string;
    job: string;
    height: string;
    weight: string;
    income: string;
    smoking: string;
    drinking: string;
    marriage: string;
    idealType: string;
    memo: string;
    agencyId?: string;
  };
  setNewClient: (client: any) => void;
  selectedPhotos: File[];
  photoPreviewUrls: string[];
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemovePhoto: (index: number) => void;
  selectedVideo: File | null;
  videoPreviewUrl: string;
  handleVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveVideo: () => void;
  agencies: Agency[];
  onClose: () => void;
  onSubmit: () => void;
  selectedAvatar?: File | null;
  onAvatarChange?: (avatar: File | null) => void;
}

export function GroomRegistrationForm({
  newClient,
  setNewClient,
  selectedPhotos,
  photoPreviewUrls,
  handlePhotoChange,
  handleRemovePhoto,
  selectedVideo,
  videoPreviewUrl,
  handleVideoChange,
  handleRemoveVideo,
  agencies,
  onClose,
  onSubmit,
  selectedAvatar,
  onAvatarChange,
}: GroomRegistrationFormProps) {
  const { t } = useLanguage();
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // 아바타 파일이 변경되면 미리보기 업데이트
  useEffect(() => {
    if (selectedAvatar) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedAvatar);
    } else {
      setAvatarPreview(null);
    }
  }, [selectedAvatar]);

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

  return (
    <>
      <SheetHeader className="pb-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <SheetTitle className="text-xl">{t('dashboard.buttons.registerGroom')}</SheetTitle>
            <SheetDescription>
              {t('form.labels.name')}
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
              <CardTitle>{t('profile.basicInfo')}</CardTitle>
            </div>
            <CardDescription>{t('profile.basicInfo')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="g-name">{t('form.labels.name')}</Label>
                <Input
                  id="g-name"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      name: e.target.value,
                    })
                  }
                  placeholder="홍길동"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-birthYear">출생년도</Label>
                <Select
                  value={newClient.birthYear || ''}
                  onValueChange={(val) =>
                    setNewClient({
                      ...newClient,
                      birthYear: val,
                    })
                  }
                >
                  <SelectTrigger id="g-birthYear">
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
                <Label htmlFor="g-marriage">결혼유무</Label>
                <Select
                  value={newClient.marriage}
                  onValueChange={(val) =>
                    setNewClient({
                      ...newClient,
                      marriage: val,
                    })
                  }
                >
                  <SelectTrigger id="g-marriage">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="초혼">초혼</SelectItem>
                    <SelectItem value="재혼">재혼</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-loc">{t('form.labels.residence')}</Label>
                <Input
                  id="g-loc"
                  value={newClient.loc}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      loc: e.target.value,
                    })
                  }
                  placeholder="서울시 강남구"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 학력 및 직업 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <CardTitle>{t('profile.education')} & {t('profile.job')}</CardTitle>
            </div>
            <CardDescription>{t('profile.education')} & {t('profile.job')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="g-edu">{t('form.labels.education')}</Label>
                <Input
                  id="g-edu"
                  value={newClient.education}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      education: e.target.value,
                    })
                  }
                  placeholder="대졸"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-job">{t('form.labels.job')}</Label>
                <Input
                  id="g-job"
                  value={newClient.job}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      job: e.target.value,
                    })
                  }
                  placeholder="회사원"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="g-income">연소득 - 만원</Label>
              <Input
                id="g-income"
                type="number"
                min="0"
                value={newClient.income}
                onChange={(e) =>
                  setNewClient({
                    ...newClient,
                    income: e.target.value,
                  })
                }
                placeholder="5000"
              />
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
            <CardDescription>신랑의 신체 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="g-height">신장 - cm</Label>
                <Input
                  id="g-height"
                  type="number"
                  min="100"
                  max="250"
                  value={newClient.height}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      height: e.target.value,
                    })
                  }
                  placeholder="175"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-weight">{t('form.labels.weight')} - kg</Label>
                <Input
                  id="g-weight"
                  type="number"
                  min="30"
                  max="200"
                  value={newClient.weight}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      weight: e.target.value,
                    })
                  }
                  placeholder="70"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 생활 습관 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-indigo-600" />
              <CardTitle>생활 습관</CardTitle>
            </div>
            <CardDescription>신랑의 생활 습관을 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="g-smoking">흡연유무</Label>
                <Select
                  value={newClient.smoking}
                  onValueChange={(val) =>
                    setNewClient({
                      ...newClient,
                      smoking: val,
                    })
                  }
                >
                  <SelectTrigger id="g-smoking">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="비흡연">비흡연</SelectItem>
                    <SelectItem value="흡연">흡연</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="g-drinking">음주주량</Label>
                <Input
                  id="g-drinking"
                  value={newClient.drinking}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      drinking: e.target.value,
                    })
                  }
                  placeholder="소주 1병"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 이상형 및 소속 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-indigo-600" />
              <CardTitle>이상형 및 소속</CardTitle>
            </div>
            <CardDescription>이상형 조건과 소속사를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="g-ideal">이상형여성 조건</Label>
              <textarea
                id="g-ideal"
                value={newClient.idealType}
                onChange={(e) =>
                  setNewClient({
                    ...newClient,
                    idealType: e.target.value,
                  })
                }
                placeholder="성격이 밝고 명랑한 분"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            <AgencySelector
              id="g-agency"
              label="소속사"
              value={newClient.agencyId || ""}
              onChange={(val) =>
                setNewClient({
                  ...newClient,
                  agencyId: val,
                })
              }
              agencies={agencies}
              role="groom"
            />

            <MemoTextarea
              id="g-memo"
              value={newClient.memo}
              onChange={(val) =>
                setNewClient({ ...newClient, memo: val })
              }
            />
          </CardContent>
        </Card>

        {/* 미디어 업로드 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
              <CardTitle>{t('form.labels.photos')} & {t('form.labels.video')}</CardTitle>
            </div>
            <CardDescription>{t('form.labels.avatar')} & {t('form.labels.video')}</CardDescription>
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
                    disabled={photoPreviewUrls.length === 0}
                  >
                    <UserCircle className="w-4 h-4" /> 아바타 선택
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
                  {photoPreviewUrls.length === 0 && (
                    <p className="text-xs text-slate-500">
                      {t('form.labels.avatar')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 사진 업로드 */}
            <div className="space-y-3">
              <Label htmlFor="g-photos">{t('form.labels.photos')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="g-photos"
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
                    htmlFor="g-photos"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" /> {t('common.select')} {t('form.labels.photos')}
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
                  {photoPreviewUrls.map((url, index) => {
                    const isPrimary = index === 0;
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Uploaded photo ${index + 1}`}
                          className={`w-full h-24 object-cover rounded-lg border-2 ${
                            isPrimary ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'
                          }`}
                        />
                        {isPrimary && (
                          <Badge className="absolute top-1 left-1 bg-indigo-500 text-white text-xs px-2 py-0.5">
                            <Star className="w-3 h-3 mr-1" />
                            대표
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-7 w-7 bg-white/95 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 동영상 업로드 */}
            <div className="space-y-3 pt-3 border-t">
              <Label htmlFor="g-video">{t('form.labels.video')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="g-video"
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
                    htmlFor="g-video"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4" /> {t('common.select')} {t('form.labels.video')}
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
          onClick={onClose}
          className="flex-1"
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={onSubmit}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
        >
          {t('common.submit')}
        </Button>
      </SheetFooter>

      {/* 아바타 크롭 다이얼로그 */}
      <AvatarCropDialog
        open={isAvatarDialogOpen}
        onOpenChange={setIsAvatarDialogOpen}
        images={photoPreviewUrls}
        onCropComplete={handleCropComplete}
      />
    </>
  );
}
