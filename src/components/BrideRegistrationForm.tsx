import React from "react";
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
  Heart, 
  Building2,
  ImageIcon,
  UserCircle
} from "lucide-react";
import { AvatarCropDialog } from "./AvatarCropDialog";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useState, useEffect } from "react";
import { AgencySelector } from "./AgencySelector";
import { MemoTextarea } from "./MemoTextarea";
import { Badge } from "./ui/badge";
import { Star } from "lucide-react";
import { useLanguage } from "./LanguageContext";
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

interface BrideRegistrationFormProps {
  newClient: {
    name: string;
    birthYear: string;
    loc: string;
    education: string;
    job: string;
    height: string;
    weight: string;
    marriage: string;
    family: string;
    fatherAge: string;
    motherAge: string;
    religion: string;
    koreanLevel: string;
    tattoo: string;
    memo: string;
    idealType?: string;
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

export function BrideRegistrationForm({
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
}: BrideRegistrationFormProps) {
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
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <SheetTitle className="text-xl">{t('form.registration.titles.newBride')}</SheetTitle>
            <SheetDescription>
              {t('form.registration.descriptions.newBride')}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="p-6 space-y-6">
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
                <Label htmlFor="b-name">{t('form.registration.fields.nameWithVietnamese')}</Label>
                <Input
                  id="b-name"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      name: e.target.value,
                    })
                  }
                  placeholder={t('form.registration.placeholders.nameBride')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-birthYear">{t('form.registration.fields.birthYear')}</Label>
                <Select
                  value={newClient.birthYear || ''}
                  onValueChange={(val) =>
                    setNewClient({
                      ...newClient,
                      birthYear: val,
                    })
                  }
                >
                  <SelectTrigger id="b-birthYear">
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
                <Label htmlFor="b-loc">{t('form.registration.fields.residenceWithVietnamese')}</Label>
                <Input
                  id="b-loc"
                  value={newClient.loc}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      loc: e.target.value,
                    })
                  }
                  placeholder={t('form.registration.placeholders.residenceBride')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-marriage">{t('form.registration.fields.maritalStatus')}</Label>
                <Select
                  value={newClient.marriage}
                  onValueChange={(val) =>
                    setNewClient({
                      ...newClient,
                      marriage: val,
                    })
                  }
                >
                  <SelectTrigger id="b-marriage">
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
                <Label htmlFor="b-edu">{t('form.registration.fields.educationWithVietnamese')}</Label>
                <Input
                  id="b-edu"
                  type="number"
                  min="0"
                  max="12"
                  value={newClient.education}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      education: e.target.value,
                    })
                  }
                  placeholder={t('form.registration.placeholders.educationLevel')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-job">{t('form.registration.fields.currentJob')}</Label>
                <Input
                  id="b-job"
                  value={newClient.job}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      job: e.target.value,
                    })
                  }
                  placeholder={t('form.registration.placeholders.jobBride')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="b-korean">{t('form.registration.fields.koreanLevel')}</Label>
              <Select
                value={newClient.koreanLevel}
                onValueChange={(val) =>
                  setNewClient({
                    ...newClient,
                    koreanLevel: val,
                  })
                }
              >
                <SelectTrigger id="b-korean">
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="상">{t('form.registration.options.koreanHigh')}</SelectItem>
                  <SelectItem value="중">{t('form.registration.options.koreanMid')}</SelectItem>
                  <SelectItem value="하">{t('form.registration.options.koreanLow')}</SelectItem>
                  <SelectItem value="없음">{t('form.registration.options.noTattoo')}</SelectItem>
                </SelectContent>
              </Select>
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
                <Label htmlFor="b-height">{t('form.registration.fields.heightWithVietnamese')}</Label>
                <Input
                  id="b-height"
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
                  placeholder={t('form.registration.placeholders.heightBride')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-weight">{t('form.registration.fields.weightWithVietnamese')}</Label>
                <Input
                  id="b-weight"
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
                  placeholder={t('form.registration.placeholders.weightBride')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="b-tattoo">{t('form.registration.fields.tattoo')}</Label>
              <Select
                value={newClient.tattoo || "없음"}
                onValueChange={(val) =>
                  setNewClient({
                    ...newClient,
                    tattoo: val,
                  })
                }
              >
                <SelectTrigger id="b-tattoo">
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
              <Label htmlFor="b-family">{t('form.registration.fields.family')}</Label>
              <Input
                id="b-family"
                value={newClient.family}
                onChange={(e) =>
                  setNewClient({
                    ...newClient,
                    family: e.target.value,
                  })
                }
                placeholder={t('form.registration.placeholders.family')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="b-fatherAge">{t('form.registration.fields.fatherAge')}</Label>
                <Input
                  id="b-fatherAge"
                  type="number"
                  min="0"
                  max="150"
                  value={newClient.fatherAge}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      fatherAge: e.target.value,
                    })
                  }
                  placeholder="65"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-motherAge">{t('form.registration.fields.motherAge')}</Label>
                <Input
                  id="b-motherAge"
                  type="number"
                  min="0"
                  max="150"
                  value={newClient.motherAge}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      motherAge: e.target.value,
                    })
                  }
                  placeholder="62"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="b-religion">{t('form.labels.religion')}</Label>
              <Select
                value={newClient.religion}
                onValueChange={(val) =>
                  setNewClient({
                    ...newClient,
                    religion: val,
                  })
                }
              >
                <SelectTrigger id="b-religion">
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
              id="b-agency"
              label={t('form.registration.fields.agency')}
              value={newClient.agencyId || ""}
              onChange={(val) =>
                setNewClient({
                  ...newClient,
                  agencyId: val,
                })
              }
              agencies={agencies}
              role="bride"
            />

            <div className="space-y-2">
              <Label htmlFor="b-ideal">{t('form.registration.fields.idealType')}</Label>
              <textarea
                id="b-ideal"
                value={newClient.idealType || ""}
                onChange={(e) =>
                  setNewClient({
                    ...newClient,
                    idealType: e.target.value,
                  })
                }
                placeholder={t('form.registration.placeholders.idealType')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            <MemoTextarea
              id="b-memo"
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
                    disabled={photoPreviewUrls.length === 0}
                  >
                    <UserCircle className="w-4 h-4" /> {t('form.registration.buttons.selectAvatar')}
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
                  {photoPreviewUrls.length === 0 && (
                    <p className="text-xs text-slate-500">
                      {t('form.registration.media.uploadPhotosFirst')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 사진 업로드 */}
            <div className="space-y-3">
              <Label htmlFor="b-photos">{t('form.registration.media.uploadPhotos')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="b-photos"
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
                    htmlFor="b-photos"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" /> {t('form.registration.buttons.selectPhotos')}
                  </label>
                </Button>
                {selectedPhotos.length > 0 && (
                  <span className="text-sm text-rose-600 font-medium">
                    {t('form.registration.media.photosSelected', { count: selectedPhotos.length })}
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
                            isPrimary ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-200'
                          }`}
                        />
                        {isPrimary && (
                          <Badge className="absolute top-1 left-1 bg-rose-500 text-white text-xs px-2 py-0.5">
                            <Star className="w-3 h-3 mr-1" />
                            {t('form.registration.media.primary')}
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
              <Label htmlFor="b-video">{t('form.registration.media.uploadVideo')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="b-video"
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
                    htmlFor="b-video"
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
          onClick={onClose}
          className="flex-1"
        >
          {t('form.registration.buttons.cancel')}
        </Button>
        <Button
          onClick={onSubmit}
          className="flex-1 bg-rose-600 hover:bg-rose-700"
        >
          {t('form.registration.buttons.register')}
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
