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
            <SheetTitle className="text-xl">신규 신부 등록</SheetTitle>
            <SheetDescription>
              새로운 신부 회원의 기본 정보를 입력하세요.
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
              <CardTitle>기본 정보</CardTitle>
            </div>
            <CardDescription>신부의 기본적인 인적사항을 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="b-name">이름 (Tên)</Label>
                <Input
                  id="b-name"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      name: e.target.value,
                    })
                  }
                  placeholder="vũ quốc hương"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-birthYear">출생년도</Label>
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
                <Label htmlFor="b-loc">거주지 (Địa chỉ)</Label>
                <Input
                  id="b-loc"
                  value={newClient.loc}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      loc: e.target.value,
                    })
                  }
                  placeholder="Hà Nội"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-marriage">결혼유무</Label>
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
            <CardDescription>신부의 학력과 직업 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="b-edu">학력 (Học lực)</Label>
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
                  placeholder="9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-job">현재직업</Label>
                <Input
                  id="b-job"
                  value={newClient.job}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      job: e.target.value,
                    })
                  }
                  placeholder="재봉사"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="b-korean">한국어 능력</Label>
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
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="상">상</SelectItem>
                  <SelectItem value="중">중</SelectItem>
                  <SelectItem value="하">하</SelectItem>
                  <SelectItem value="없음">없음</SelectItem>
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
              <CardTitle>신체 정보</CardTitle>
            </div>
            <CardDescription>신부의 신체 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="b-height">키 (Cao) - cm</Label>
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
                  placeholder="163"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-weight">몸무게 (Cân nặng) - kg</Label>
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
                  placeholder="52"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="b-tattoo">문신(Tattoo) 여부</Label>
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
            <CardDescription>가족 구성과 종교 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="b-family">가족구성 (Gia đình)</Label>
              <Input
                id="b-family"
                value={newClient.family}
                onChange={(e) =>
                  setNewClient({
                    ...newClient,
                    family: e.target.value,
                  })
                }
                placeholder="부모님, 언니 1명"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="b-fatherAge">아빠 나이</Label>
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
                <Label htmlFor="b-motherAge">엄마 나이</Label>
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
              <Label htmlFor="b-religion">종교</Label>
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
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="무교">무교</SelectItem>
                  <SelectItem value="불교">불교</SelectItem>
                  <SelectItem value="기독교">기독교</SelectItem>
                  <SelectItem value="천주교">천주교</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
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
              <CardTitle>소속 및 메모</CardTitle>
            </div>
            <CardDescription>소속사와 추가 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AgencySelector
              id="b-agency"
              label="소속사"
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
              <Label htmlFor="b-ideal">이상형 조건</Label>
              <textarea
                id="b-ideal"
                value={newClient.idealType || ""}
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
                      먼저 프로필 사진을 업로드해주세요
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 사진 업로드 */}
            <div className="space-y-3">
              <Label htmlFor="b-photos">사진 업로드</Label>
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
                    <Upload className="w-4 h-4" /> 사진 선택
                  </label>
                </Button>
                {selectedPhotos.length > 0 && (
                  <span className="text-sm text-rose-600 font-medium">
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
              <Label htmlFor="b-video">동영상 업로드</Label>
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
          onClick={onClose}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          onClick={onSubmit}
          className="flex-1 bg-rose-600 hover:bg-rose-700"
        >
          등록하기
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
